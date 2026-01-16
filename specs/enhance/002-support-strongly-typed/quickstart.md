# Quickstart: Strongly Typed Unit Metadata

**Date**: 2026-01-16
**Feature**: Strongly Typed Unit Metadata

## Overview

This guide shows you how to use strongly typed metadata with units, including creating units with metadata, accessing metadata values, and migrating from the old tag system.

---

## Basic Usage

### 1. Define Metadata

Define metadata objects with `as const` for precise type inference:

```typescript
const Celsius = {
  name: 'Celsius' as const,
  symbol: '°C',
  description: 'Temperature in Celsius',
  baseUnit: 'Kelvin',
  offset: 273.15
};

const Fahrenheit = {
  name: 'Fahrenheit' as const,
  symbol: '°F',
  description: 'Temperature in Fahrenheit',
  baseUnit: 'Kelvin'
};
```

**Key Points**:
- Use `as const` on the `name` property for literal type inference
- Add any additional properties you need (fully extensible)
- TypeScript infers the exact type automatically

---

### 2. Register Units

Register units with the registry using metadata objects:

```typescript
import { registry } from 'unacy';

// Old way (DEPRECATED)
// registry.register('Celsius', 'Kelvin', celsiusToKelvin);

// New way (with metadata objects)
registry.register(Celsius, celsiusToKelvin, kelvinToCelsius);
registry.register(Fahrenheit, fahrenheitToKelvin, kelvinToFahrenheit);
```

**Key Points**:
- Pass the metadata object directly (not just the name string)
- The registry stores the full metadata object
- Registry uses `metadata.name` as the internal key

---

### 3. Create Units

Create units with metadata-aware constructors:

```typescript
// Using createUnit
const temp1 = createUnit(25, dimensions.temperature, Celsius);
//    ^? Unit<{name: 'Celsius', symbol: string, description: string, ...}>

// Using Unit constructor directly
const temp2 = new Unit(77, dimensions.temperature, Fahrenheit);
//    ^? Unit<{name: 'Fahrenheit', symbol: string, description: string, ...}>

// Using defineUnit factory
const CelsiusUnit = defineUnit(Celsius, ...converters);
const temp3 = CelsiusUnit.create(25);
//    ^? Unit<typeof Celsius>
```

**Type Inference**: TypeScript automatically infers the exact metadata type from the object you pass!

---

### 4. Access Metadata

Access metadata using the `getMetadata()` method:

```typescript
const temp = createUnit(25, dimensions.temperature, Celsius);

// Get full metadata object
const metadata = temp.getMetadata();
//    ^? {name: 'Celsius', symbol: string, description: string, ...}

// Access properties (fully typed!)
metadata.name;        // Type: 'Celsius' (literal type)
metadata.symbol;      // Type: string
metadata.description; // Type: string
metadata.baseUnit;    // Type: string
metadata.offset;      // Type: number
```

**Type Safety**: Your IDE provides autocomplete and type checking for all metadata properties!

---

### 5. Direct Registry Access

Access metadata directly through registry accessors:

```typescript
// First, augment the Registry interface for type safety
declare module 'unacy' {
  interface Registry {
    Celsius: typeof Celsius;
    Fahrenheit: typeof Fahrenheit;
  }
}

// Now access metadata with full type safety
registry.Celsius.name;        // Type: 'Celsius'
registry.Celsius.symbol;      // Type: '°C'
registry.Celsius.description; // Type: 'Temperature in Celsius'

registry.Fahrenheit.name;     // Type: 'Fahrenheit'
registry.Fahrenheit.symbol;   // Type: '°F'
```

**Benefits**:
- Shorter syntax than `getMetadata()`
- Full TypeScript autocomplete
- Compile-time type checking

---

## Advanced Usage

### Immutable Metadata Updates

Use `withMetadata()` to create a new unit with different metadata:

```typescript
const tempC = createUnit(25, dimensions.temperature, Celsius);

// Create a new unit with Fahrenheit metadata (immutable)
const tempF = tempC.withMetadata(Fahrenheit);

// Original unit unchanged
tempC.getMetadata().name; // 'Celsius'

// New unit has different metadata
tempF.getMetadata().name; // 'Fahrenheit'

// Types reflect the change
tempC; // Unit<typeof Celsius>
tempF; // Unit<typeof Fahrenheit>
```

**Use Cases**:
- Converting units while preserving the same value
- Changing display format
- Testing with different metadata configurations

---

### Custom Metadata Types

Define custom metadata with domain-specific properties:

```typescript
// Scientific metadata
const ScientificCelsius = {
  name: 'Celsius' as const,
  symbol: '°C',
  description: 'Temperature in Celsius',
  baseUnit: 'Kelvin',
  precision: 2,
  significantFigures: 3,
  uncertaintyPercent: 0.1,
  calibrationDate: '2026-01-16',
  instrumentId: 'THERM-001'
};

const measurement = createUnit(25.42, dimensions.temperature, ScientificCelsius);

// Access all custom properties with type safety
measurement.getMetadata().precision;           // Type: number
measurement.getMetadata().significantFigures;  // Type: number
measurement.getMetadata().instrumentId;        // Type: string
```

**Benefits**:
- Attach domain-specific data to units
- Full type safety for custom properties
- No modification to core library needed

---

### Runtime Metadata Lookup

Lookup metadata dynamically by name:

```typescript
const unitName = 'Celsius'; // From user input

const metadata = registry.getMetadata(unitName);
if (metadata) {
  console.log(`Found unit: ${metadata.name}`);
  console.log(`Symbol: ${metadata.symbol || 'N/A'}`);
} else {
  console.error(`Unit not found: ${unitName}`);
}
```

**Use Cases**:
- User-selectable units
- Loading units from configuration
- Dynamic unit systems

---

### Enumerate All Units

Get all registered unit names:

```typescript
const allUnits = registry.getAllNames();
console.log('Registered units:', allUnits);
// ['Celsius', 'Fahrenheit', 'Kelvin', 'meters', 'feet', ...]

// Check if specific unit exists
if (registry.has('Celsius')) {
  console.log('Celsius is registered');
}
```

**Use Cases**:
- Building unit selection dropdowns
- Debugging registration issues
- Validating user input

---

## Migration from Tag System

### Old Tag-Based API

```typescript
// OLD WAY (DEPRECATED)
const temp = new Unit(25, dimensions.temperature, 'Celsius');

// Access tag
const unitName = temp.tag; // 'Celsius'

// Register with string
registry.register('Celsius', 'Kelvin', converter);
```

---

### New Metadata-Based API

```typescript
// NEW WAY
const Celsius = {name: 'Celsius' as const, symbol: '°C'};
const temp = new Unit(25, dimensions.temperature, Celsius);

// Access metadata
const metadata = temp.getMetadata();
const unitName = metadata.name; // 'Celsius'

// Or use registry accessor
registry.Celsius.name; // 'Celsius'

// Register with metadata object
registry.register(Celsius, converter);
```

---

### Migration Steps

#### Step 1: Define Metadata Constants

Replace string literals with metadata objects:

```typescript
// Before
const tag = 'Celsius';

// After
const Celsius = {
  name: 'Celsius' as const,
  symbol: '°C'
};
```

#### Step 2: Update Registry Calls

```typescript
// Before
registry.register('Celsius', 'Kelvin', converter);

// After
registry.register(Celsius, converter);
```

#### Step 3: Update Unit Creation

```typescript
// Before
const temp = new Unit(25, dimensions.temperature, 'Celsius');

// After
const temp = new Unit(25, dimensions.temperature, Celsius);
```

#### Step 4: Update Tag Access

```typescript
// Before
const name = unit.tag;

// After (Option 1: Metadata accessor)
const name = unit.getMetadata().name;

// After (Option 2: Registry accessor)
const name = registry.Celsius.name;
```

#### Step 5: Remove Deprecation Warnings

Once all `.tag` usages are migrated, the deprecation warnings will stop. In the next major version (v2.0.0), the `.tag` property will be removed entirely.

---

### Automated Migration

For large codebases, consider using a codemod or find-replace:

```bash
# Find all .tag usages
grep -r "\.tag" src/

# Replace pattern (manual verification recommended)
# .tag → .getMetadata().name
```

---

## Arithmetic Operations

### Metadata from Result Type

When performing arithmetic, the result's metadata comes from the registry based on the result's unit type:

```typescript
const velocity = createUnit(5, dimensions.velocity, VelocityMetadata);
const time = createUnit(10, dimensions.time, TimeMetadata);

// Multiply: velocity × time = distance
const distance = velocity.multiply(time);

// Result metadata comes from distance unit in registry
distance.getMetadata(); // Returns DistanceMetadata, NOT VelocityMetadata or TimeMetadata

// Access distance metadata
distance.getMetadata().name; // 'meters' (or whatever distance unit is registered)
```

**Key Point**: Operand metadata is NOT preserved or merged. The result's metadata is looked up from the registry based on the result's dimensions.

---

## Type-Safe Patterns

### Pattern 1: Metadata Constraint

Constrain functions to accept specific metadata types:

```typescript
function formatTemperature<T extends {name: 'Celsius' | 'Fahrenheit', symbol: string}>(
  temp: Unit<T>
): string {
  const {name, symbol} = temp.getMetadata();
  return `${temp.getValue()}${symbol} ${name}`;
}

// OK
formatTemperature(celsiusTemp);
formatTemperature(fahrenheitTemp);

// Error: Kelvin doesn't match constraint
formatTemperature(kelvinTemp);
```

---

### Pattern 2: Metadata Union

Accept multiple specific metadata types:

```typescript
type TemperatureMetadata =
  | typeof Celsius
  | typeof Fahrenheit
  | typeof Kelvin;

function isTemperature(unit: Unit): unit is Unit<TemperatureMetadata> {
  const name = unit.getMetadata().name;
  return name === 'Celsius' || name === 'Fahrenheit' || name === 'Kelvin';
}
```

---

### Pattern 3: Metadata Builder

Build metadata programmatically with type safety:

```typescript
function createSIUnit<TName extends string>(
  name: TName,
  symbol: string
) {
  return {
    name: name as TName,
    symbol,
    system: 'SI' as const,
    standard: 'ISO 80000' as const
  };
}

const Meter = createSIUnit('meter', 'm');
//    ^? {name: 'meter', symbol: string, system: 'SI', standard: 'ISO 80000'}
```

---

## Common Patterns

### Display Formatting

```typescript
function formatUnit<T extends BaseMetadata>(unit: Unit<T>): string {
  const metadata = unit.getMetadata();
  const symbol = 'symbol' in metadata ? ` ${metadata.symbol}` : '';
  return `${unit.getValue()}${symbol}`;
}

formatUnit(temp); // "25 °C"
```

---

### Metadata Validation

```typescript
function hasSymbol(metadata: BaseMetadata): metadata is BaseMetadata & {symbol: string} {
  return 'symbol' in metadata && typeof metadata.symbol === 'string';
}

const metadata = unit.getMetadata();
if (hasSymbol(metadata)) {
  console.log(metadata.symbol); // TypeScript knows symbol exists
}
```

---

### Conditional Metadata

```typescript
const Celsius = {
  name: 'Celsius' as const,
  symbol: '°C',
  ...(process.env.SCIENTIFIC === 'true' && {
    precision: 2,
    uncertaintyPercent: 0.1
  })
};
```

---

## Best Practices

### 1. Always Use `as const` on Names

```typescript
// ✅ Good - Literal type inference
const Good = {name: 'Celsius' as const};

// ❌ Bad - Type is widened to string
const Bad = {name: 'Celsius'};
```

### 2. Define Metadata as Constants

```typescript
// ✅ Good - Reusable, consistent
const Celsius = {name: 'Celsius' as const, symbol: '°C'};

// ❌ Bad - Inline metadata is harder to reuse
const temp = new Unit(25, dims, {name: 'Celsius' as const, symbol: '°C'});
```

### 3. Augment Registry Interface

```typescript
// ✅ Good - Type-safe accessors
declare module 'unacy' {
  interface Registry {
    Celsius: typeof Celsius;
  }
}

// ❌ Bad - Runtime access without type safety
const metadata = (registry as any).Celsius;
```

### 4. Use Type Guards

```typescript
// ✅ Good - Type-safe validation
if (validateMetadata(input)) {
  registry.register(input, ...);
}

// ❌ Bad - Unsafe type assertion
registry.register(input as BaseMetadata, ...);
```

---

## Troubleshooting

### Issue: Type Widening

**Problem**: Metadata properties lose literal types

```typescript
const metadata = {name: 'Celsius'}; // Type: {name: string}
```

**Solution**: Use `as const`

```typescript
const metadata = {name: 'Celsius' as const}; // Type: {name: 'Celsius'}
```

---

### Issue: Registry Accessor Not Found

**Problem**: `registry.Celsius` shows TypeScript error

**Solution**: Augment the Registry interface

```typescript
declare module 'unacy' {
  interface Registry {
    Celsius: typeof Celsius;
  }
}
```

---

### Issue: Metadata Not Inferred

**Problem**: Unit type shows `Unit<BaseMetadata>` instead of specific type

**Solution**: Ensure metadata is defined with `as const` and passed directly

```typescript
// ❌ Bad
const name = 'Celsius';
const metadata = {name};

// ✅ Good
const metadata = {name: 'Celsius' as const};
```

---

## Summary

- **Define**: Create metadata with `as const` for type inference
- **Register**: Pass metadata objects to `registry.register()`
- **Create**: Use `createUnit()`, `new Unit()`, or `defineUnit()`
- **Access**: Use `getMetadata()` or registry accessors
- **Update**: Use `withMetadata()` for immutable updates
- **Migrate**: Replace `.tag` with `.getMetadata().name`

---

**Next**: Ready to implement! Run `/speckit.tasks` to generate executable tasks.
