# Quickstart: Strongly Typed Unit Metadata (Branded Types)

**Date**: 2026-01-16
**Feature**: Strongly Typed Unit Metadata
**Architecture**: Branded Types (`WithUnits<T, U, M>`)

## Overview

This guide shows how to use strongly typed metadata with unacy's branded type system. Metadata is stored in the registry and accessed via type-safe `UnitAccessor` properties.

**Key Concepts**:
- Branded types (`WithUnits<T, U, M>`) are compile-time only - no runtime class instances
- Metadata stored in registry using `Map<string, BaseMetadata>`
- Metadata accessed via `registry.UnitName.property` pattern
- Full TypeScript type inference and autocomplete

---

## Basic Usage

### 1. Define Metadata

Define metadata objects with `as const` for precise type inference:

```typescript
import type { BaseMetadata } from 'unacy';

const Celsius = {
  name: 'Celsius' as const,
  symbol: '°C',
  description: 'Temperature in Celsius'
} satisfies BaseMetadata;

const Fahrenheit = {
  name: 'Fahrenheit' as const,
  symbol: '°F',
  description: 'Temperature in Fahrenheit'
} satisfies BaseMetadata;
```

**Key Points**:
- Use `satisfies BaseMetadata` to ensure name property exists
- Use `as const` on `name` for literal type inference
- Add any additional properties (fully extensible via `Record<string, unknown>`)

---

### 2. Create Branded Types with Metadata

Use the metadata type parameter in `WithUnits`:

```typescript
import type { WithUnits } from 'unacy';

// Type with metadata
type CelsiusTemp = WithUnits<number, 'Celsius', typeof Celsius>;
type FahrenheitTemp = WithUnits<number, 'Fahrenheit', typeof Fahrenheit>;

// TypeScript infers the full metadata type
const temp: CelsiusTemp = 25 as CelsiusTemp;
```

**Type Inference**:
```typescript
// TypeScript knows CelsiusTemp has metadata type:
// { name: 'Celsius', symbol: string, description: string }
```

---

### 3. Register Units with Metadata

Register units with the registry, attaching metadata:

```typescript
import { createRegistry } from 'unacy';

const registry = createRegistry()
  .register('Celsius', 'Fahrenheit', (c) => c * 9/5 + 32)
  .Celsius.addMetadata(Celsius);

// Later access metadata
const celsiusMetadata = registry.Celsius; // Access via UnitAccessor
```

**Note**: Current implementation being updated to accept metadata objects directly in `register()`.

---

### 4. Access Metadata via Registry

Access metadata through the `UnitAccessor` pattern:

```typescript
// Direct property access (type-safe)
registry.Celsius.name;        // Type: 'Celsius' (literal)
registry.Celsius.symbol;      // Type: string
registry.Celsius.description; // Type: string
```

**Benefits**:
- Full TypeScript autocomplete
- Compile-time type checking
- O(1) runtime lookup

---

## Advanced Usage

### Custom Metadata Types

Define domain-specific metadata:

```typescript
interface ScientificMetadata extends BaseMetadata {
  precision: number;
  uncertaintyPercent: number;
  instrumentId: string;
}

const ScientificCelsius: ScientificMetadata = {
  name: 'Celsius',
  symbol: '°C',
  precision: 2,
  uncertaintyPercent: 0.1,
  instrumentId: 'THERM-001'
};

type ScientificTemp = WithUnits<number, 'Celsius', ScientificMetadata>;
```

---

### Type-Safe Metadata Constraints

Constrain functions to specific metadata types:

```typescript
function formatTemperature<M extends { name: 'Celsius' | 'Fahrenheit', symbol: string }>(
  temp: WithUnits<number, string, M>
): string {
  // Access metadata via registry
  const metadata = registry[temp]; // Conceptual - actual implementation TBD
  return `${temp}${metadata.symbol}`;
}
```

---

## Type System Patterns

### Pattern 1: Metadata Union Types

```typescript
type TemperatureMetadata =
  | typeof Celsius
  | typeof Fahrenheit
  | typeof Kelvin;

type AnyTemperature = WithUnits<number, string, TemperatureMetadata>;
```

### Pattern 2: Conditional Metadata

```typescript
const developmentMetadata = process.env.NODE_ENV === 'development' ? {
  name: 'Celsius' as const,
  symbol: '°C',
  debug: true
} : {
  name: 'Celsius' as const,
  symbol: '°C'
} satisfies BaseMetadata;
```

### Pattern 3: Metadata Builder Functions

```typescript
function createSIMetadata<TName extends string>(
  name: TName,
  symbol: string
) {
  return {
    name: name as TName,
    symbol,
    system: 'SI' as const,
    standard: 'ISO 80000' as const
  } satisfies BaseMetadata;
}

const Meter = createSIMetadata('meter', 'm');
//    ^? { name: 'meter', symbol: string, system: 'SI', standard: 'ISO 80000' }
```

---

## Best Practices

### 1. Always Use `satisfies BaseMetadata`

```typescript
// ✅ Good
const Good = {
  name: 'Celsius' as const,
  symbol: '°C'
} satisfies BaseMetadata;

// ❌ Bad - no type checking
const Bad = {
  symbol: '°C' // Missing required 'name'
};
```

### 2. Use Literal Types for Names

```typescript
// ✅ Good - Literal type
const Good = { name: 'Celsius' as const };
//                   ^? Type: 'Celsius'

// ❌ Bad - Type widened to string
const Bad = { name: 'Celsius' };
//                  ^? Type: string
```

### 3. Define Metadata as Constants

```typescript
// ✅ Good - Reusable constant
const Celsius = { name: 'Celsius' as const, symbol: '°C' } satisfies BaseMetadata;
type CelsiusUnit = WithUnits<number, 'Celsius', typeof Celsius>;

// ❌ Bad - Inline, harder to reuse
type BadCelsius = WithUnits<number, 'Celsius', { name: 'Celsius', symbol: '°C' }>;
```

---

## Current Implementation Status

**Phase 1-2 Complete** ✅:
- `BaseMetadata` type defined
- `WithUnits<T, U, M>` accepts metadata parameter
- All related types updated
- Type inference working
- Comprehensive type-level tests

**In Progress**:
- Registry metadata storage
- `UnitAccessor` metadata exposure
- `addMetadata()` enhancement

**Planned**:
- Documentation
- Examples
- Migration guide

---

## Example: Complete Workflow

```typescript
import { createRegistry, type WithUnits, type BaseMetadata } from 'unacy';

// 1. Define metadata
const Celsius = {
  name: 'Celsius' as const,
  symbol: '°C',
  description: 'Temperature in Celsius'
} satisfies BaseMetadata;

const Fahrenheit = {
  name: 'Fahrenheit' as const,
  symbol: '°F',
  description: 'Temperature in Fahrenheit'
} satisfies BaseMetadata;

// 2. Create typed units
type CelsiusTemp = WithUnits<number, 'Celsius', typeof Celsius>;
type FahrenheitTemp = WithUnits<number, 'Fahrenheit', typeof Fahrenheit>;

// 3. Create registry with converters
const registry = createRegistry()
  .register('Celsius', 'Fahrenheit', (c) => c * 9/5 + 32);

// 4. Use units with type safety
const freezing: CelsiusTemp = 0 as CelsiusTemp;
const boiling: CelsiusTemp = 100 as CelsiusTemp;

// 5. Convert units
const freezingF = registry.Celsius.to.Fahrenheit(freezing);
//    ^? FahrenheitTemp (32°F)
```

---

## Summary

- **Define**: Create metadata with `satisfies BaseMetadata` and `as const`
- **Type**: Use `WithUnits<T, U, M>` with metadata type parameter
- **Store**: Registry stores metadata via `Map<string, BaseMetadata>`
- **Access**: Use `UnitAccessor` pattern for type-safe property access
- **Infer**: TypeScript automatically infers all types

---

**Status**: Phase 1-2 Complete | Phase 3 In Progress
**Next**: Registry integration and UnitAccessor enhancement
