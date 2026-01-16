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

## Unit Class API

### Constructor

```typescript
class Unit<TMetadata extends BaseMetadata = BaseMetadata> {
  constructor(
    value: number,
    dimensions: Dimensions,
    metadata: TMetadata
  );
}
```

**Parameters**:
- `value`: Numeric value of the unit
- `dimensions`: Dimensional analysis structure
- `metadata`: Metadata object (must extend `BaseMetadata`)

**Returns**: New `Unit<TMetadata>` instance

**Example**:
```typescript
const Celsius = {name: 'Celsius' as const, symbol: '°C'};
const temp = new Unit(25, dimensions.temperature, Celsius);
//    ^? Unit<{name: 'Celsius', symbol: string}>
```

---

### getMetadata()

```typescript
class Unit<TMetadata extends BaseMetadata = BaseMetadata> {
  getMetadata(): TMetadata;
}
```

**Parameters**: None

**Returns**: The metadata object associated with this unit (typed as `TMetadata`)

**Example**:
```typescript
const metadata = temp.getMetadata();
metadata.name;   // Type: 'Celsius' (if defined with as const)
metadata.symbol; // Type: string
```

**Behavior**:
- Returns the exact metadata object passed to constructor
- Immutable - returned object should not be mutated
- Type-safe - TypeScript infers the exact metadata type

---

### withMetadata()

```typescript
class Unit<TMetadata extends BaseMetadata = BaseMetadata> {
  withMetadata<TNewMetadata extends BaseMetadata>(
    metadata: TNewMetadata
  ): Unit<TNewMetadata>;
}
```

**Parameters**:
- `metadata`: New metadata object (must extend `BaseMetadata`)

**Returns**: NEW `Unit` instance with type `Unit<TNewMetadata>` (different type parameter)

**Example**:
```typescript
const tempC = new Unit(25, dimensions.temperature, Celsius);
const tempF = tempC.withMetadata(Fahrenheit);

tempC.getMetadata().name; // 'Celsius'
tempF.getMetadata().name; // 'Fahrenheit'

// Types are different
tempC; // Unit<typeof Celsius>
tempF; // Unit<typeof Fahrenheit>
```

**Behavior**:
- Immutable operation - original unit unchanged
- Returns new instance with same value and dimensions
- Type parameter changes to reflect new metadata type
- Enables type-safe metadata transformations

---

### Deprecated: tag Property

```typescript
class Unit<TMetadata extends BaseMetadata = BaseMetadata> {
  /**
   * @deprecated Use getMetadata().name instead
   */
  get tag(): string;
}
```

**Returns**: `this.metadata.name` (string)

**Deprecation Notice**:
- Logs warning to console when accessed
- Compatibility layer only - will be removed in next major version
- Migrate to `getMetadata().name` or registry accessors

---

## Registry API

### register()

```typescript
class Registry {
  register<T extends BaseMetadata>(
    metadata: T,
    ...converters: ConverterFn[]
  ): void;
}
```

**Parameters**:
- `metadata`: Metadata object for the unit being registered
- `converters`: Conversion functions to/from other units

**Returns**: `void`

**Throws**: Error if `metadata.name` already registered

**Example**:
```typescript
const Celsius = {name: 'Celsius' as const, symbol: '°C'};
registry.register(Celsius, /* converters */);
```

**Behavior**:
- Stores metadata in internal `Map<string, BaseMetadata>`
- Key is `metadata.name`
- Value is the complete metadata object
- Enables later lookup by name

**Contract**:
- `metadata.name` MUST be unique (throws if duplicate)
- `metadata.name` MUST be non-empty string
- Metadata object stored by reference (not cloned)

---

### getMetadata()

```typescript
class Registry {
  getMetadata<T extends BaseMetadata = BaseMetadata>(
    name: string
  ): T | undefined;
}
```

**Parameters**:
- `name`: Unit name to lookup

**Returns**: Metadata object if found, `undefined` if not registered

**Example**:
```typescript
const metadata = registry.getMetadata('Celsius');
if (metadata) {
  metadata.name; // 'Celsius'
}
```

**Behavior**:
- O(1) lookup using internal Map
- Returns `undefined` for unknown names (not error)
- Type assertion may be needed for specific metadata types

---

### has()

```typescript
class Registry {
  has(name: string): boolean;
}
```

**Parameters**:
- `name`: Unit name to check

**Returns**: `true` if registered, `false` otherwise

**Example**:
```typescript
if (registry.has('Celsius')) {
  // Celsius is registered
}
```

---

### getAllNames()

```typescript
class Registry {
  getAllNames(): string[];
}
```

**Parameters**: None

**Returns**: Array of all registered unit names

**Example**:
```typescript
const names = registry.getAllNames();
// ['Celsius', 'Kelvin', 'Fahrenheit', ...]
```

**Behavior**:
- Returns new array (defensive copy)
- Order not guaranteed (Map iteration order)
- Useful for enumeration or debugging

---

### Direct Accessor Pattern (Declaration Merging)

```typescript
// User-defined metadata
const Celsius = {name: 'Celsius' as const, symbol: '°C'};
const Kelvin = {name: 'Kelvin' as const, symbol: 'K'};

// Declaration merging for type-safe registry accessors
interface Registry {
  Celsius: typeof Celsius;
  Kelvin: typeof Kelvin;
}

// Now fully typed
registry.Celsius.name;   // Type: 'Celsius'
registry.Celsius.symbol; // Type: string
registry.Kelvin.name;    // Type: 'Kelvin'
registry.Kelvin.symbol;  // Type: string
```

**Contract**:
- User MUST augment `Registry` interface for type safety
- Property name MUST match `metadata.name`
- Type MUST match the metadata object type
- Accessor returns the stored metadata object

---

## Unit Creation Functions

### createUnit()

```typescript
export function createUnit<TMetadata extends BaseMetadata = BaseMetadata>(
  value: number,
  dimensions: Dimensions,
  metadata: TMetadata
): Unit<TMetadata>;
```

**Parameters**:
- `value`: Numeric value
- `dimensions`: Dimensional structure
- `metadata`: Metadata object

**Returns**: `Unit<TMetadata>` instance

**Example**:
```typescript
const temp = createUnit(25, dimensions.temperature, {
  name: 'Celsius' as const,
  symbol: '°C'
});
```

**Type Inference**:
- `TMetadata` inferred from `metadata` argument
- No explicit type annotation needed
- Fully type-safe

---

### defineUnit()

```typescript
export function defineUnit<TMetadata extends BaseMetadata>(
  metadata: TMetadata,
  ...converters: ConverterFn[]
): {
  create(value: number): Unit<TMetadata>;
  metadata: TMetadata;
};
```

**Parameters**:
- `metadata`: Metadata for this unit definition
- `converters`: Conversion functions

**Returns**: Object with `create()` factory and `metadata` property

**Example**:
```typescript
const CelsiusUnit = defineUnit(
  {name: 'Celsius' as const, symbol: '°C'},
  /* converters */
);

const temp = CelsiusUnit.create(25);
//    ^? Unit<{name: 'Celsius', symbol: string}>

CelsiusUnit.metadata.name;   // 'Celsius'
CelsiusUnit.metadata.symbol; // '°C'
```

**Behavior**:
- Registers unit with registry (calls `registry.register`)
- Returns factory for convenient unit creation
- Encapsulates metadata with factory

---

## Arithmetic Operations

### Result Metadata Contract

**Rule**: Arithmetic operations return units with metadata determined by the result's unit type, NOT from operands.

```typescript
interface Unit<TMetadata extends BaseMetadata = BaseMetadata> {
  // Arithmetic operations
  add(other: Unit): Unit<BaseMetadata>;      // Result metadata from registry
  subtract(other: Unit): Unit<BaseMetadata>; // Result metadata from registry
  multiply(other: Unit): Unit<BaseMetadata>; // Result metadata from registry
  divide(other: Unit): Unit<BaseMetadata>;   // Result metadata from registry
}
```

**Behavior**:
1. Compute result dimensions (existing logic)
2. Lookup metadata from registry based on result dimensions
3. If no metadata found, use default `{name: 'unknown'}`
4. Return new Unit with looked-up metadata

**Example**:
```typescript
// Velocity × Time = Distance
const velocity = createUnit(5, dimensions.velocity, VelocityMeta);
const time = createUnit(10, dimensions.time, TimeMeta);

const distance = velocity.multiply(time);
//    ^? Unit<BaseMetadata> (metadata from distance unit in registry)

distance.getMetadata(); // Returns DistanceMeta from registry, NOT VelocityMeta or TimeMeta
```

**Contract**:
- Operand metadata is IGNORED
- Result metadata comes from registry lookup by dimensions
- Type parameter becomes `BaseMetadata` (not specific)

---

## Converter API

### Converter Function Signature

```typescript
type ConverterFn<TFrom extends BaseMetadata, TTo extends BaseMetadata> = (
  unit: Unit<TFrom>
) => Unit<TTo>;
```

**Parameters**:
- `unit`: Source unit to convert

**Returns**: Converted unit with target metadata

**Example**:
```typescript
const celsiusToFahrenheit: ConverterFn<typeof Celsius, typeof Fahrenheit> = (unit) => {
  const fahrenheitValue = unit.getValue() * 9/5 + 32;
  return createUnit(fahrenheitValue, unit.getDimensions(), Fahrenheit);
};
```

**Contract**:
- MUST preserve dimensions (or convert to compatible dimensions)
- MUST use target metadata type (not source)
- MAY transform value

---

## Type Guards

### isUnit()

```typescript
export function isUnit<TMetadata extends BaseMetadata = BaseMetadata>(
  value: unknown
): value is Unit<TMetadata>;
```

**Parameters**:
- `value`: Value to check

**Returns**: Type predicate - `true` if `value` is a Unit

**Example**:
```typescript
if (isUnit(someValue)) {
  // TypeScript knows someValue is Unit<BaseMetadata>
  someValue.getMetadata();
}
```

---

## Validation

### validateMetadata()

```typescript
export function validateMetadata(
  metadata: unknown
): metadata is BaseMetadata;
```

**Parameters**:
- `metadata`: Value to validate

**Returns**: Type predicate - `true` if valid `BaseMetadata`

**Validation Rules**:
- Has `name` property
- `name` is non-empty string
- Object type (not null/undefined)

**Example**:
```typescript
if (validateMetadata(userInput)) {
  // TypeScript knows userInput is BaseMetadata
  registry.register(userInput, ...);
}
```

---

## Error Types

### DuplicateMetadataNameError

```typescript
export class DuplicateMetadataNameError extends Error {
  constructor(name: string);
  readonly name: 'DuplicateMetadataNameError';
  readonly unitName: string;
}
```

**Thrown by**: `registry.register()` when `metadata.name` already exists

**Properties**:
- `unitName`: The duplicate name that caused the error

---

### InvalidMetadataError

```typescript
export class InvalidMetadataError extends Error {
  constructor(reason: string);
  readonly name: 'InvalidMetadataError';
  readonly reason: string;
}
```

**Thrown by**: Functions validating metadata structure

**Properties**:
- `reason`: Human-readable explanation of validation failure

---

## Summary Table

| API | Input | Output | Side Effects |
|-----|-------|--------|--------------|
| `Unit.getMetadata()` | None | `TMetadata` | None |
| `Unit.withMetadata(m)` | Metadata | New `Unit<T>` | None (immutable) |
| `Unit.tag` (deprecated) | None | `string` | Console warning |
| `registry.register(m, ...)` | Metadata, converters | `void` | Stores in registry |
| `registry.getMetadata(name)` | Name string | Metadata or `undefined` | None |
| `registry.has(name)` | Name string | `boolean` | None |
| `registry.getAllNames()` | None | `string[]` | None |
| `createUnit(v, d, m)` | Value, dims, metadata | `Unit<T>` | None |
| `defineUnit(m, ...)` | Metadata, converters | Factory object | Registers unit |

---

**Next**: See [quickstart.md](../quickstart.md) for usage examples
