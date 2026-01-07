# Data Model: Unacy Core Conversion Library

**Feature**: 001-unacy-core  
**Phase**: 1 - Data Model Design  
**Date**: 2026-01-06

## Overview

This document defines the core entities, their relationships, and type structures for the Unacy Core library. All entities are compile-time constructs with zero runtime overhead unless explicitly noted.

---

## Core Entities

### 1. WithUnits<T, U extends PropertyKey>

**Purpose**: Brand a value with a unit identifier for compile-time safety.

**Structure**:
```typescript
import type { Tagged } from 'type-fest';

export type WithUnits<T, U extends PropertyKey> = Tagged<T, 'Units', U>;
```

**Properties**:
- `T`: Base type (e.g., `number`, `bigint`, custom numeric type)
- `U`: Unit identifier (e.g., `'Celsius'`, `'meters'`, `'USD'`)

**Validation Rules**:
- `U` must be a valid PropertyKey (string | number | symbol)
- Type brand exists only at compile-time (no runtime representation)

**State Transitions**: N/A (immutable type construct)

**Examples**:
```typescript
type Celsius = WithUnits<number, 'Celsius'>;
type Meters = WithUnits<number, 'meters'>;

const temp: Celsius = 25 as Celsius;
const distance: Meters = 100 as Meters;
```

---

### 2. WithFormat<T, F extends string>

**Purpose**: Brand a value with a format identifier for serialization/deserialization safety.

**Structure**:
```typescript
export type WithFormat<T, F extends string> = Tagged<T, 'Format', F>;
```

**Properties**:
- `T`: Base type (e.g., `number`, `Date`, custom type)
- `F`: Format identifier (e.g., `'ISO8601'`, `'UnixTimestamp'`, `'HexColor'`)

**Validation Rules**:
- `F` must be a string literal type
- Format identity preserved through transformations

**State Transitions**: Format ↔ String via Formatter/Parser

**Examples**:
```typescript
type ISO8601Date = WithFormat<Date, 'ISO8601'>;
type HexColor = WithFormat<string, 'HexColor'>;

const date: ISO8601Date = new Date() as ISO8601Date;
const color: HexColor = '#FF5733' as HexColor;
```

---

### 3. Converter<TInput, TOutput>

**Purpose**: Type-safe function to transform between two unit-tagged values.

**Structure**:
```typescript
export type Converter<
  TInput extends WithUnits<unknown, PropertyKey>,
  TOutput extends WithUnits<unknown, PropertyKey>
> = (input: TInput) => TOutput;
```

**Properties**:
- `TInput`: Source unit-tagged type
- `TOutput`: Destination unit-tagged type
- Pure function (no side effects)

**Validation Rules**:
- Input/output must be `WithUnits` tagged types
- Function must be deterministic (same input → same output)
- Should document precision loss if applicable

**Relationships**:
- Registered in `ConverterRegistry`
- Can be composed via multi-hop paths

**Examples**:
```typescript
const celsiusToFahrenheit: Converter<
  WithUnits<number, 'Celsius'>,
  WithUnits<number, 'Fahrenheit'>
> = (c) => ((c * 9/5) + 32) as WithUnits<number, 'Fahrenheit'>;
```

---

### 4. BidirectionalConverter<TInput, TOutput>

**Purpose**: Pair of converters for two-way transformations between units.

**Structure**:
```typescript
export type BidirectionalConverter<
  TInput extends WithUnits<unknown, PropertyKey>,
  TOutput extends WithUnits<unknown, PropertyKey>
> = {
  to: Converter<TInput, TOutput>;
  from: Converter<TOutput, TInput>;
};
```

**Properties**:
- `to`: Forward converter (TInput → TOutput)
- `from`: Reverse converter (TOutput → TInput)

**Validation Rules**:
- Round-trip should preserve value within precision tolerance: `from(to(x)) ≈ x`
- Both converters must be deterministic

**Relationships**:
- Registers two entries in `ConverterRegistry` (one per direction)

**Examples**:
```typescript
const meterKilometer: BidirectionalConverter<
  WithUnits<number, 'meters'>,
  WithUnits<number, 'kilometers'>
> = {
  to: (m) => (m / 1000) as WithUnits<number, 'kilometers'>,
  from: (km) => (km * 1000) as WithUnits<number, 'meters'>
};
```

---

### 5. Formatter<TInput>

**Purpose**: Convert a format-tagged value to a string representation.

**Structure**:
```typescript
export type Formatter<TInput extends WithFormat<unknown, string>> = (
  input: TInput
) => string;
```

**Properties**:
- `TInput`: Format-tagged type
- Returns plain string (loses format tag)

**Validation Rules**:
- Output string must be parseable by corresponding `Parser`
- Should produce human-readable or machine-parseable output

**Examples**:
```typescript
const formatISO: Formatter<WithFormat<Date, 'ISO8601'>> = (date) => 
  date.toISOString();
```

---

### 6. Parser<TOutput>

**Purpose**: Parse a string into a format-tagged value with validation.

**Structure**:
```typescript
export type Parser<TOutput extends WithFormat<unknown, string>> = (
  input: string
) => TOutput;
```

**Properties**:
- `input`: Plain string
- Returns format-tagged value
- **Runtime behavior**: Throws `ParseError` on invalid input

**Validation Rules**:
- Must validate input before tagging
- Must throw clear errors (not return invalid tagged values)
- Should use Zod or similar for schema validation

**Examples**:
```typescript
import { z } from 'zod';

const parseISO: Parser<WithFormat<Date, 'ISO8601'>> = (input) => {
  const schema = z.string().datetime();
  const validated = schema.parse(input);
  return new Date(validated) as WithFormat<Date, 'ISO8601'>;
};
```

---

### 7. FormatterParser<T>

**Purpose**: Paired formatter/parser for round-trip format transformations.

**Structure**:
```typescript
export type FormatterParser<T extends WithFormat<unknown, string>> = {
  format: Formatter<T>;
  parse: Parser<T>;
};
```

**Properties**:
- `format`: Converts tagged value → string
- `parse`: Converts string → tagged value

**Validation Rules**:
- Round-trip must succeed for valid values: `parse(format(x)) ≡ x`
- Parser must reject invalid strings with clear errors

**Examples**:
```typescript
const iso8601: FormatterParser<WithFormat<Date, 'ISO8601'>> = {
  format: (date) => date.toISOString(),
  parse: (str) => {
    const date = new Date(str);
    if (isNaN(date.getTime())) throw new Error('Invalid ISO8601 date');
    return date as WithFormat<Date, 'ISO8601'>;
  }
};
```

---

### 8. ConverterRegistry<Units extends PropertyKey>

**Purpose**: Centralized registry for managing and composing unit converters.

**Structure**:
```typescript
export type ConverterRegistry<Units extends PropertyKey> = {
  // Register a unidirectional converter
  register<From extends Units, To extends Exclude<Units, From>>(
    from: From,
    to: To,
    converter: Converter<WithUnits<unknown, From>, WithUnits<unknown, To>>
  ): ConverterRegistry<Units>;

  // Register a bidirectional converter
  registerBidirectional<From extends Units, To extends Exclude<Units, From>>(
    from: From,
    to: To,
    converter: BidirectionalConverter<
      WithUnits<unknown, From>,
      WithUnits<unknown, To>
    >
  ): ConverterRegistry<Units>;

  // Get a converter (direct or composed via BFS)
  getConverter<From extends Units, To extends Exclude<Units, From>>(
    from: From,
    to: To
  ): Converter<WithUnits<unknown, From>, WithUnits<unknown, To>> | undefined;

  // Fluent conversion API
  convert<From extends Units>(
    value: WithUnits<unknown, From>
  ): {
    to<To extends Exclude<Units, From>>(unit: To): WithUnits<unknown, To>;
  };
};
```

**Properties**:
- `Units`: Union of all registered unit identifiers
- Immutable: `register` returns new registry instance
- **Runtime behavior**: Graph adjacency list (`Map<From, Map<To, Converter>>`)

**Validation Rules**:
- Cannot register `From → From` (identity conversion)
- Duplicate registration overwrites previous converter
- Cycle detection during `getConverter` (throws `CycleError`)
- Max path depth = 5 hops (throws `MaxDepthError`)

**State Transitions**:
1. Empty registry → register converters → populated registry
2. Populated registry → getConverter → direct converter (O(1))
3. Populated registry → getConverter (no direct path) → BFS search → composed converter

**Relationships**:
- Contains multiple `Converter` instances
- Used by consumers to perform type-safe conversions

**Internal Data Structure** (runtime):
```typescript
class ConverterRegistryImpl<Units extends PropertyKey> {
  private graph: Map<Units, Map<Units, Converter<any, any>>>;
  private pathCache: Map<string, Converter<any, any>>;

  // BFS for shortest path
  private findPath(from: Units, to: Units): Units[] | null;
  
  // Compose converters along path
  private composePath(path: Units[]): Converter<any, any>;
}
```

---

## Entity Relationships

```
┌─────────────────┐
│  WithUnits<T,U> │◄──────────┐
└────────┬────────┘           │
         │                    │
         │ used by            │ produces
         ▼                    │
┌────────────────────┐        │
│  Converter<In,Out> │────────┘
└────────┬───────────┘
         │
         │ stored in
         ▼
┌──────────────────────┐
│ ConverterRegistry<U> │
└──────────────────────┘
         │
         │ composes via BFS
         ▼
  [Multi-hop Converter]


┌──────────────────┐
│ WithFormat<T,F>  │◄──────────┐
└─────────┬────────┘           │
          │                    │
          │ used by            │ produces
          ▼                    │
┌──────────────────┐           │
│   Formatter<In>  │───────────┘
│   Parser<Out>    │       (string)
└──────────────────┘
          │
          │ paired in
          ▼
┌──────────────────────┐
│ FormatterParser<T>   │
└──────────────────────┘
```

---

## Example Usage Scenario

```typescript
import { createRegistry } from 'unacy';
import type { WithUnits } from 'unacy';

// Define unit types
type Meters = WithUnits<number, 'meters'>;
type Kilometers = WithUnits<number, 'kilometers'>;
type Miles = WithUnits<number, 'miles'>;

// Create registry
const distanceRegistry = createRegistry<'meters' | 'kilometers' | 'miles'>()
  .registerBidirectional('meters', 'kilometers', {
    to: (m) => (m / 1000) as Kilometers,
    from: (km) => (km * 1000) as Meters
  })
  .registerBidirectional('kilometers', 'miles', {
    to: (km) => (km * 0.621371) as Miles,
    from: (mi) => (mi / 0.621371) as Kilometers
  });

// Use fluent API
const distance = 5000 as Meters;
const miles = distanceRegistry.convert(distance).to('miles'); // Auto-composes: m→km→mi

// Type-safe: this won't compile
// const invalid = distanceRegistry.convert(distance).to('meters'); // Error: cannot convert to same unit
```

---

## Validation & Constraints Summary

| Entity | Compile-Time Checks | Runtime Checks |
|--------|---------------------|----------------|
| WithUnits | Unit type mismatch | None (phantom type) |
| WithFormat | Format type mismatch | None (phantom type) |
| Converter | Input/output type safety | Determinism (via tests) |
| BidirectionalConverter | Symmetry types | Round-trip accuracy (via tests) |
| Formatter | Input format type | Output string validity (optional) |
| Parser | Output format type | Input string validation (required) |
| ConverterRegistry | Unit membership, no self-loops | Cycle detection, max depth |

---

**Data Model Complete**: All entities defined with structures, relationships, and validation rules. Ready for contract definition (Phase 1 continuation).
