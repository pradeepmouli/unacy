# API Contracts: Metadata System

**Date**: 2026-01-16
**Feature**: Strongly Typed Unit Metadata
**Format**: TypeScript Type Signatures

## Overview

This document defines the public API contracts for the strongly typed metadata system.

---

## Core Type Definitions

### BaseMetadata

```typescript
/**
 * Base metadata type that all unit metadata must extend.
 */
export type BaseMetadata = {
  /** Unique identifier for the unit (replaces tag) */
  name: string;
} & Record<string, unknown>;
```

**Contract**:
- `name` property is REQUIRED
- Additional properties allowed (extensible)
- Use with `as const` for literal type inference

---

## Branded Type System

**Architecture Note**: This library uses a **branded type system**, not runtime class instances. Units are represented as `WithUnits<T, M>` branded types, which are compile-time only. All metadata is stored in the registry and accessed via the `UnitAccessor` pattern.

### WithUnits Type

```typescript
export type WithUnits<
  T extends PrimitiveType = number,
  M extends BaseMetadata = BaseMetadata
> = Tagged<T, typeof UNITS, M>;
```

**Type Parameters**:
- `T`: Primitive type (typically `number`)
- `M`: Metadata type (must extend `BaseMetadata`)

**Contract**:
- Branded types are compile-time only (no runtime overhead)
- Values are plain numbers at runtime
- Type safety enforced by TypeScript's type checker

**Example**:
```typescript
const Celsius = {name: 'Celsius' as const, symbol: '°C'} satisfies BaseMetadata;
type Celsius = WithUnits<number, typeof Celsius>;

const temp: Celsius = 25 as Celsius;  // Branded value
const rawValue: number = temp;         // Still a plain number at runtime
```

---

## UnitAccessor Pattern

### Type Definition

```typescript
export type UnitAccessor<
  From extends WithUnits<PrimitiveType, BaseMetadata>,
  Edges extends readonly Edge[],
  FromUnits extends string
> = {
  (value: number): From;
  to: {
    [To in ToUnitsFor<Edges, From> as UnitsFor<To>]: (value: From) => To;
  };
  addMetadata(metadata: UnitMetadata): ConverterRegistry<...>;
  register<To extends WithUnits<PrimitiveType, ToMeta>, ToMeta extends BaseMetadata>(
    to: UnitsFor<To>,
    converter: Converter<From, To>
  ): ConverterRegistry<...>;
} & ExtractMetadata<From>;
```

**Capabilities**:
- **Callable**: Brand a number with the unit type
- **Conversions**: Access `.to.OtherUnit()` for type-safe conversions
- **Metadata**: Access metadata properties directly on the accessor
- **Extension**: Add metadata or register converters

### Accessing Metadata

```typescript
// Define metadata with 'as const' for literal types
const Celsius = {name: 'Celsius' as const, symbol: '°C'} satisfies BaseMetadata;
type Celsius = WithUnits<number, typeof Celsius>;

// Register with registry
const registry = createRegistry()
  .Celsius.addMetadata({name: 'Celsius', symbol: '°C'});

// Access metadata directly on the accessor
registry.Celsius.name;    // Type: string
registry.Celsius.symbol;  // Type: string | undefined
```

**Behavior**:
- Metadata stored in registry's internal `Map<PropertyKey, UnitMetadata>`
- Accessed via Proxy on the `UnitAccessor`
- Type-safe via intersection with `ExtractMetadata<From>`
- Returns `undefined` for properties not in metadata

---

### Creating Branded Values

```typescript
// Using the accessor as a function
const temp = registry.Celsius(25);
//    ^? Celsius (branded type)

// Manual branding (less convenient)
const temp2: Celsius = 25 as Celsius;
```

**Contract**:
- Accessor callable returns branded value with correct type
- Value is a plain number at runtime (zero overhead)
- Type checker enforces unit safety

---

### Type-Safe Conversions

```typescript
const Fahrenheit = {name: 'Fahrenheit' as const, symbol: '°F'} satisfies BaseMetadata;
type Fahrenheit = WithUnits<number, typeof Fahrenheit>;

const registry = createRegistry()
  .register('Celsius', 'Fahrenheit', {
    to: (c) => ((c * 9/5) + 32) as Fahrenheit,
    from: (f) => ((f - 32) * 5/9) as Celsius
  });

const tempC: Celsius = 25 as Celsius;
const tempF = registry.Celsius.to.Fahrenheit(tempC);
//    ^? Fahrenheit (strongly typed)
```

**Behavior**:
- `.to` object contains all registered target units
- Type-safe: only allows conversions that have been registered
- Returns branded value with target unit type
- Throws `ConversionError` if path not found (multi-hop uses BFS)

---

## Registry API

### createRegistry()

```typescript
export function createRegistry<Edges extends readonly Edge[] = []>(): 
  ConverterRegistry<Edges> & ConverterMap<Edges>;
```

**Returns**: New empty registry with unit accessor proxies

**Example**:
```typescript
const registry = createRegistry();
```

**Behavior**:
- Creates new registry instance with empty converter graph
- Returns proxy that provides dynamic unit accessors
- Immutable - all methods return new registry instances

---

### register()

```typescript
interface ConverterRegistry<Edges extends Edge[] = []> {
  register<From extends WithUnits<PrimitiveType, FromMeta>,
           To extends WithUnits<PrimitiveType, ToMeta>,
           FromMeta extends BaseMetadata,
           ToMeta extends BaseMetadata>(
    from: UnitsFor<From>,
    to: UnitsFor<To>,
    converter: Converter<From, To> | BidirectionalConverter<From, To>
  ): ConverterRegistry<[...Edges, Edge<From, To>]> & ConverterMap<[...Edges, Edge<From, To>]>;
}
```

**Parameters**:
- `from`: Source unit name (string)
- `to`: Destination unit name (string)
- `converter`: Converter function or bidirectional converter object

**Returns**: New registry instance with converter registered

**Example**:
```typescript
type Celsius = WithUnits<number, {name: 'Celsius', symbol: '°C'}>;
type Fahrenheit = WithUnits<number, {name: 'Fahrenheit', symbol: '°F'}>;

const registry = createRegistry()
  .register('Celsius', 'Fahrenheit', {
    to: (c) => ((c * 9/5) + 32) as Fahrenheit,
    from: (f) => ((f - 32) * 5/9) as Celsius
  });
```

**Behavior**:
- Immutable: returns NEW registry instance
- Bidirectional converters register both directions automatically
- Updates type system to include new conversion edges
- Converter graph stored in `Map<PropertyKey, Map<PropertyKey, Converter>>`

---

### addMetadata()

```typescript
// Available on UnitAccessor
unitAccessor.addMetadata(metadata: UnitMetadata): ConverterRegistry<Edges>;
```

**Parameters**:
- `metadata`: Metadata object with optional properties (abbreviation, symbol, format, etc.)

**Returns**: New registry instance with metadata attached

**Example**:
```typescript
const registry = createRegistry()
  .Celsius.addMetadata({
    name: 'Celsius',
    symbol: '°C',
    description: 'Temperature in Celsius'
  });

// Access metadata via accessor
registry.Celsius.symbol; // '°C'
registry.Celsius.description; // 'Temperature in Celsius'
```

**Behavior**:
- Merges metadata with existing metadata for the unit
- Stored in registry's `Map<PropertyKey, UnitMetadata>`
- Accessible via proxy on UnitAccessor
- Returns `undefined` for non-existent properties

---

### allow()

```typescript
interface ConverterRegistry<Edges extends Edge[] = []> {
  allow<From extends WithUnits<PrimitiveType, FromMeta>,
        To extends WithUnits<PrimitiveType, ToMeta>,
        FromMeta extends BaseMetadata,
        ToMeta extends BaseMetadata>(
    from: UnitsFor<From>,
    to: UnitsFor<To>
  ): ConverterRegistry<[...Edges, Edge<From, To>]> & ConverterMap<[...Edges, Edge<From, To>]>;
}
```

**Parameters**:
- `from`: Source unit name
- `to`: Destination unit name

**Returns**: New registry instance with multi-hop path exposed in types

**Throws**: `ConversionError` if no path exists between units

**Example**:
```typescript
const registry = createRegistry()
  .register('Celsius', 'Kelvin', c => (c + 273.15) as Kelvin)
  .register('Kelvin', 'Fahrenheit', k => ((k - 273.15) * 9/5 + 32) as Fahrenheit)
  .allow('Celsius', 'Fahrenheit'); // Enable multi-hop in types

// Now type-safe:
const f = registry.Celsius.to.Fahrenheit(tempC);
```

**Behavior**:
- Verifies conversion path exists at runtime via BFS
- Adds edge to type system (no new converter stored)
- Enables type-safe accessor for multi-hop conversions
- Actual conversion uses BFS-composed converter

---

### getConverter()

```typescript
interface ConverterRegistry<Edges extends Edge[] = []> {
  getConverter<From extends WithUnits<PrimitiveType, BaseMetadata>,
               To extends WithUnits<PrimitiveType, BaseMetadata>>(
    from: UnitsFor<From>,
    to: UnitsFor<To>
  ): Converter<From, To> | undefined;
}
```

**Parameters**:
- `from`: Source unit name
- `to`: Destination unit name

**Returns**: Converter function, or `undefined` if no path exists

**Example**:
```typescript
const converter = registry.getConverter('Celsius', 'Fahrenheit');
if (converter) {
  const result = converter(25 as Celsius);
}
```

**Behavior**:
- O(1) for direct conversions (Map lookup)
- Falls back to BFS for multi-hop paths
- Caches composed converters for performance
- Returns `undefined` if no path exists

---

### convert()

```typescript
interface ConverterRegistry<Edges extends Edge[] = []> {
  convert<From extends WithUnits<PrimitiveType, BaseMetadata>>(
    value: From,
    fromUnit: UnitsFor<From>
  ): {
    to<To extends WithUnits<PrimitiveType, BaseMetadata>>(unit: UnitsFor<To>): To;
  };
}
```

**Parameters**:
- `value`: Branded value to convert
- `fromUnit`: Source unit name

**Returns**: Object with `to()` method for fluent conversion

**Example**:
```typescript
const tempC: Celsius = 25 as Celsius;
const tempF = registry.convert(tempC, 'Celsius').to('Fahrenheit');
```

**Behavior**:
- Alternative fluent API for conversions
- Less type-safe than accessor pattern (uses runtime strings)
- Throws `ConversionError` if no converter found

---

## Type Helpers

### UnitsFor<T>

```typescript
export type UnitsFor<T extends WithUnits<PrimitiveType, BaseMetadata>> =
  T extends WithUnits<infer A, infer M extends BaseMetadata> ? ExtractName<M> : never;
```

**Purpose**: Extract the unit name from a branded type

**Example**:
```typescript
type Celsius = WithUnits<number, {name: 'Celsius', symbol: '°C'}>;
type Name = UnitsFor<Celsius>; // 'Celsius'
```

---

### UnitsOf<T>

```typescript
export type UnitsOf<T extends WithUnits<PrimitiveType, BaseMetadata>> = 
  GetTagMetadata<T, typeof UNITS>;
```

**Purpose**: Extract the full metadata type from a branded type

**Example**:
```typescript
type Celsius = WithUnits<number, {name: 'Celsius', symbol: '°C'}>;
type Metadata = UnitsOf<Celsius>; // {name: 'Celsius', symbol: '°C'}
```

---

### Relax<T>

```typescript
export type Relax<T> = T | Unwrap<T>;
```

**Purpose**: Allow both branded and unbranded values

**Example**:
```typescript
function acceptTemp(temp: Relax<Celsius>) {
  // Accepts both Celsius and plain number
}
```

---

## Converter API

### Converter Type

```typescript
export type Converter<From, To> = (value: From) => To;
```

**Parameters**:
- `value`: Source branded value

**Returns**: Target branded value

**Example**:
```typescript
type CelsiusToFahrenheit = Converter<Celsius, Fahrenheit>;

const toFahrenheit: CelsiusToFahrenheit = (c) => {
  return ((c * 9/5) + 32) as Fahrenheit;
};
```

---

### BidirectionalConverter Type

```typescript
export type BidirectionalConverter<From, To> = {
  to: Converter<From, To>;
  from: Converter<To, From>;
};
```

**Properties**:
- `to`: Converter from `From` to `To`
- `from`: Converter from `To` to `From`

**Example**:
```typescript
const celsiusFahrenheit: BidirectionalConverter<Celsius, Fahrenheit> = {
  to: (c) => ((c * 9/5) + 32) as Fahrenheit,
  from: (f) => ((f - 32) * 5/9) as Celsius
};

// Register both directions automatically
const registry = createRegistry()
  .register('Celsius', 'Fahrenheit', celsiusFahrenheit);
```

**Behavior**:
- Registers both conversion directions
- More convenient than two separate `register()` calls
- Ensures bidirectional consistency

---

## Error Types

### ConversionError

```typescript
export class ConversionError extends Error {
  constructor(from: PropertyKey, to: PropertyKey, message?: string);
  readonly name: 'ConversionError';
  readonly from: PropertyKey;
  readonly to: PropertyKey;
}
```

**Thrown by**: 
- `registry.getConverter()` when no path exists
- `registry.convert().to()` when no converter found
- `unitAccessor.to.Unit()` when no converter found

**Properties**:
- `from`: Source unit name
- `to`: Destination unit name

**Example**:
```typescript
try {
  const result = registry.Celsius.to.Unknown(temp);
} catch (error) {
  if (error instanceof ConversionError) {
    console.log(`Cannot convert from ${error.from} to ${error.to}`);
  }
}
```

---

## Summary Table

| API | Input | Output | Side Effects |
|-----|-------|--------|--------------|
| `WithUnits<T, M>` | Type parameters | Branded type | None (compile-time) |
| `createRegistry()` | None | Registry instance | None |
| `registry.register(from, to, converter)` | Unit names, converter | New registry | None (immutable) |
| `unitAccessor(value)` | Number | Branded value | None |
| `unitAccessor.to.Unit(value)` | Branded value | Converted value | None |
| `unitAccessor.addMetadata(m)` | Metadata object | New registry | None (immutable) |
| `unitAccessor.register(to, converter)` | Unit name, converter | New registry | None (immutable) |
| `unitAccessor.property` | None | Metadata value | None |
| `registry.allow(from, to)` | Unit names | New registry | Verifies path exists |
| `registry.getConverter(from, to)` | Unit names | Converter or `undefined` | Caches composed path |
| `registry.convert(value, from).to(to)` | Branded value, unit names | Converted value | None |

---

**Next**: See [quickstart.md](../quickstart.md) for usage examples
