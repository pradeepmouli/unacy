# Data Model: Strongly Typed Unit Metadata

**Date**: 2026-01-16
**Feature**: Support for Strongly Typed Unit Metadata

## Overview

This document defines the data structures for strongly typed unit metadata, including type definitions, relationships, and constraints.

---

## Core Types

### 1. Metadata Base Type

```typescript
/**
 * Base metadata type that all unit metadata must extend.
 * The `name` property is required and must be a string literal type.
 */
type BaseMetadata = {
  name: string;
} & Record<string, unknown>;
```

**Constraints**:
- `name` property is REQUIRED (serves as unique identifier and replaces tag)
- Additional properties are unrestricted (extensible design)
- Should be used with `as const` for literal type inference

**Example**:
```typescript
const Celsius = {
  name: 'Celsius' as const,
  symbol: '°C',
  description: 'Temperature in Celsius',
  baseUnit: 'Kelvin'
} satisfies BaseMetadata;
```

---

### 2. Unit Generic Type

```typescript
/**
 * Unit class with optional generic metadata type parameter.
 * TMetadata defaults to BaseMetadata for backward compatibility.
 */
class Unit<TMetadata extends BaseMetadata = BaseMetadata> {
  private readonly value: number;
  private readonly dimensions: Dimensions;
  private readonly metadata: TMetadata;

  constructor(value: number, dimensions: Dimensions, metadata: TMetadata);

  /**
   * Get the metadata associated with this unit.
   */
  getMetadata(): TMetadata;

  /**
   * Return a new Unit instance with updated metadata (immutable).
   */
  withMetadata<TNewMetadata extends BaseMetadata>(
    metadata: TNewMetadata
  ): Unit<TNewMetadata>;

  // Other Unit methods...
}
```

**Type Parameter**:
- `TMetadata`: The metadata type for this unit instance
- Default: `BaseMetadata` (backward compatible)
- Constraint: Must extend `BaseMetadata` (ensures `name` property exists)

**Immutability**:
- Metadata is `readonly` - cannot be mutated after construction
- `withMetadata()` returns a NEW Unit instance with different metadata type

---

### 3. Registry Structure

```typescript
/**
 * Registry stores metadata objects keyed by their name property.
 */
class Registry {
  private metadataMap: Map<string, BaseMetadata>;

  /**
   * Register a unit with its metadata.
   * The metadata.name is used as the key.
   */
  register<T extends BaseMetadata>(metadata: T, ...converters): void;

  /**
   * Lookup metadata by name.
   */
  getMetadata<T extends BaseMetadata = BaseMetadata>(name: string): T | undefined;

  /**
   * Check if a unit is registered.
   */
  has(name: string): boolean;

  /**
   * Get all registered unit names.
   */
  getAllNames(): string[];
}
```

**Storage**:
- Internal: `Map<string, BaseMetadata>`
- Key: `metadata.name` (string)
- Value: Complete metadata object

**Lookup Complexity**: O(1) by name

---

## Type Relationships

```
BaseMetadata (base type with name + extensible properties)
    │
    ├─> Celsius Metadata (concrete metadata with literal 'Celsius' name)
    ├─> Kelvin Metadata (concrete metadata with literal 'Kelvin' name)
    └─> Custom Metadata (user-defined metadata types)
         │
         └─> Unit<TMetadata> (Unit parameterized by metadata type)
              │
              ├─> Unit<Celsius Metadata> (Unit with Celsius metadata)
              ├─> Unit<Kelvin Metadata> (Unit with Kelvin metadata)
              └─> Unit<BaseMetadata> (Unit with default metadata)
```

**Relationship Rules**:
1. All metadata types MUST extend `BaseMetadata`
2. Unit metadata type parameter MUST extend `BaseMetadata`
3. `withMetadata<T>()` can change the metadata type of a Unit
4. Registry stores all metadata under `metadata.name` key

---

## Data Flow

### Unit Creation with Metadata

```typescript
// 1. Define metadata (type inferred automatically)
const Celsius = {
  name: 'Celsius' as const,
  symbol: '°C',
  description: 'Temperature in Celsius'
};

// 2. Register with metadata object
registry.register(Celsius, /* converters */);

// 3. Create unit with inferred metadata type
const temp = new Unit(25, dimensions.temperature, Celsius);
//    ^? Unit<{name: 'Celsius', symbol: string, description: string}>

// 4. Access metadata (fully typed)
temp.getMetadata().name;        // Type: 'Celsius' (literal)
temp.getMetadata().symbol;      // Type: string
temp.getMetadata().description; // Type: string
```

### Registry Access Pattern

```typescript
// Direct accessor (via declaration merging or code generation)
registry.Celsius.name;        // Type: 'Celsius'
registry.Celsius.symbol;      // Type: string
registry.Celsius.description; // Type: string

// Or via getMetadata
const metadata = registry.getMetadata('Celsius');
if (metadata) {
  metadata.name; // Type: string (not narrowed without type assertion)
}
```

### Immutable Metadata Updates

```typescript
const temp1 = new Unit(25, dimensions.temperature, Celsius);

// Create new unit with different metadata (immutable)
const temp2 = temp1.withMetadata({
  name: 'Fahrenheit' as const,
  symbol: '°F',
  description: 'Temperature in Fahrenheit'
});

// Types are different
temp1.getMetadata().name; // Type: 'Celsius'
temp2.getMetadata().name; // Type: 'Fahrenheit'
```

---

## State Transitions

### Metadata Lifecycle

```
1. DEFINED
   ↓ (const Celsius = {...})
2. REGISTERED
   ↓ (registry.register(Celsius, ...))
3. ASSOCIATED WITH UNIT
   ↓ (new Unit(..., Celsius))
4. ACCESSED
   ↓ (unit.getMetadata())
5. [OPTIONAL] REPLACED
   ↓ (unit.withMetadata(newMetadata))
   → New Unit instance with new metadata
```

**State Rules**:
- Metadata is immutable after definition (use `as const`)
- Registry stores metadata permanently (no deletion in MVP)
- Units carry metadata reference (not copied)
- `withMetadata()` creates NEW unit (old unit unchanged)

---

## Validation Rules

### Metadata Constraints

| Property | Constraint | Validation |
|----------|------------|------------|
| `name` | REQUIRED, non-empty string | Runtime check on registration |
| `name` | UNIQUE in registry | Runtime check on registration (error if duplicate) |
| Additional properties | No constraints | User-defined, type-safe via TypeScript |

### Type Constraints

| Type | Constraint | Enforcement |
|------|------------|-------------|
| `TMetadata` | Must extend `BaseMetadata` | Compile-time (TypeScript) |
| `name` property | Must be string type | Compile-time (TypeScript) |
| Registry key | Must match `metadata.name` | Runtime (internal consistency) |

---

## Migration from Tag System

### Old Structure (Tag-based)

```typescript
class Unit {
  private readonly value: number;
  private readonly dimensions: Dimensions;
  private readonly tag: string; // OLD: simple string tag

  getTag(): string {
    return this.tag;
  }
}

// Old usage
const temp = new Unit(25, dimensions.temperature, 'Celsius');
temp.getTag(); // 'Celsius'
```

### New Structure (Metadata-based)

```typescript
class Unit<TMetadata extends BaseMetadata = BaseMetadata> {
  private readonly value: number;
  private readonly dimensions: Dimensions;
  private readonly metadata: TMetadata; // NEW: rich metadata object

  getMetadata(): TMetadata {
    return this.metadata;
  }

  // Compatibility layer (temporary)
  /** @deprecated Use getMetadata().name */
  get tag(): string {
    return this.metadata.name;
  }
}

// New usage
const Celsius = {name: 'Celsius' as const, symbol: '°C'};
const temp = new Unit(25, dimensions.temperature, Celsius);
temp.getMetadata().name;   // 'Celsius' (preferred)
temp.tag;                  // 'Celsius' (deprecated)
```

### Migration Steps

1. **Backward Compatible Layer**: Keep `tag` getter returning `metadata.name` with deprecation warning
2. **Update All Callers**: Replace `.tag` with `.getMetadata().name` or use registry accessors
3. **Remove Compatibility Layer**: In next major version, remove `.tag` getter entirely

---

## Arithmetic Metadata Behavior

### Rule: Metadata Comes from Result Type

When performing arithmetic operations, the result's metadata is determined by the result's unit type, NOT from the operands.

```typescript
// Example: velocity * time = distance
const velocity = new Unit(5, dimensions.velocity, VelocityMetadata);
const time = new Unit(10, dimensions.time, TimeMetadata);

// Result metadata comes from the distance unit type in registry
const distance = velocity.multiply(time);
//    ^? Unit<DistanceMetadata> (NOT from velocity or time metadata)

distance.getMetadata(); // Returns DistanceMetadata from registry lookup
```

**Implementation**:
- Result dimensions computed normally (velocity × time = distance)
- Metadata looked up from registry based on result dimensions
- If no metadata registered for result type, use default `BaseMetadata`

---

## Performance Considerations

### Memory

- Metadata objects shared across Unit instances (no copying)
- Registry Map has O(n) space complexity where n = number of registered units
- Each Unit stores ONE reference to metadata object (minimal overhead)

### Runtime

- Metadata access: O(1) - direct property access
- Registry lookup: O(1) - Map lookup by name key
- Type inference: Zero runtime cost (compile-time only)

### Zero-Cost Abstraction

Users who don't use metadata beyond the required `name` property pay minimal cost:
- One extra field on Unit (metadata reference)
- Default metadata type (`BaseMetadata`) is lightweight
- No runtime overhead for type checking (TypeScript compile-time)

---

## Edge Cases

### Case 1: Undefined Metadata

```typescript
// What if unit created without metadata?
const unit = new Unit(5, dimensions.length); // ERROR: metadata required

// Solution: Provide default metadata
const defaultMetadata = {name: 'unknown' as const};
const unit = new Unit(5, dimensions.length, defaultMetadata); // OK
```

### Case 2: Duplicate Names

```typescript
const Celsius1 = {name: 'Celsius' as const};
const Celsius2 = {name: 'Celsius' as const, extra: 'property'};

registry.register(Celsius1, ...); // OK
registry.register(Celsius2, ...); // ERROR: 'Celsius' already registered
```

### Case 3: Arithmetic with Different Metadata Types

```typescript
const m1 = new Unit(5, dimensions.length, {name: 'meters' as const, system: 'SI'});
const m2 = new Unit(10, dimensions.length, {name: 'meters' as const, system: 'metric'});

// Addition result metadata comes from registry lookup, not from m1 or m2
const result = m1.add(m2);
result.getMetadata(); // Returns meters metadata from registry (may differ from m1/m2 metadata)
```

---

## Summary

- **Base Type**: `{name: string} & Record<string, unknown>`
- **Unit Generic**: `Unit<TMetadata extends BaseMetadata = BaseMetadata>`
- **Registry Storage**: `Map<string, BaseMetadata>` keyed by `metadata.name`
- **Immutability**: `withMetadata<T>()` returns new instance
- **Type Inference**: Automatic from `as const` values
- **Arithmetic**: Metadata from result type (registry lookup)
- **Migration**: Tag → metadata.name with compatibility layer

---

**Next**: See [contracts/metadata-api.md](./contracts/metadata-api.md) for API signatures
