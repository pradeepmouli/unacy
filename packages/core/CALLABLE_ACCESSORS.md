# Callable Unit Accessors

## Overview

Unit accessors in the registry are now callable functions that create branded unit values, providing a cleaner and more ergonomic API for creating type-safe unit values.

## What Changed

### Before (Manual Casting)

```typescript
type Celsius = WithUnits<number, 'Celsius'>;
const temp: Celsius = 25 as Celsius;
const fahrenheit = registry.Celsius.to.Fahrenheit(temp);
```

### After (Callable Accessor)

```typescript
// More ergonomic - no manual casting needed
const temp = registry.Celsius(25);  // Returns WithUnits<number, 'Celsius'>
const fahrenheit = registry.Celsius.to.Fahrenheit(temp);

// Or in a fluent chain
const fahrenheit = registry.Celsius.to.Fahrenheit(registry.Celsius(25));
```

## Implementation Details

### Type Signature

```typescript
export type UnitAccessor<From extends string, Edges extends readonly Edge[]> = {
  /**
   * Create a branded value with this unit
   * @param value - The numeric value to brand
   * @returns The value branded with this unit type
   */
  (value: number): WithUnits<number, From>;
  
  to: { /* ... conversion methods ... */ };
  addMetadata: (metadata: UnitMetadata) => /* ... */;
  register: <To extends string>(/* ... */) => /* ... */;
  // ... other properties
};
```

### Runtime Implementation

The implementation uses `Object.assign()` to combine a function with properties:

```typescript
// Create a callable function that brands a value with the unit
const brandFunction = (value: number) => value as WithUnits<number, any>;

// Combine function with accessor properties
const unitAccessor = Object.assign(brandFunction, {
  to: toProxy,
  addMetadata: (metadata) => { /* ... */ },
  register: (to, converter) => { /* ... */ }
});
```

This creates a callable object that:
1. Can be invoked as a function: `registry.Celsius(25)`
2. Has properties that can be accessed: `registry.Celsius.to`, `registry.Celsius.addMetadata`, etc.
3. Works with TypeScript's callable interface type

## Usage Examples

### Creating Branded Values

```typescript
const registry = createRegistry()
  .register('Celsius', 'Fahrenheit', (c) => (c * 9/5 + 32) as Fahrenheit);

// Create a Celsius value
const temp = registry.Celsius(25);  // Type: WithUnits<number, 'Celsius'>

// Convert it
const f = registry.Celsius.to.Fahrenheit(temp);
```

### Fluent Conversion Chain

```typescript
// All in one expression
const fahrenheit = registry.Celsius.to.Fahrenheit(registry.Celsius(0));
// Result: 32
```

### Multi-Unit Registry

```typescript
const registry = createRegistry()
  .register('meters', 'kilometers', {
    to: (m) => m / 1000,
    from: (km) => km * 1000
  });

// Create values for different units
const distance1 = registry.meters(5000);    // 5000 meters
const distance2 = registry.kilometers(5);   // 5 kilometers

// Convert
const km = registry.meters.to.kilometers(distance1);  // 5
const m = registry.kilometers.to.meters(distance2);   // 5000
```

### With Metadata

```typescript
const registry = createRegistry()
  .register('Celsius', 'Fahrenheit', (c) => (c * 9/5 + 32) as Fahrenheit)
  .Celsius.addMetadata({
    abbreviation: '°C',
    format: '${value}°C'
  });

// Use callable accessor
const temp = registry.Celsius(23);
console.log(temp);  // 23

// Access metadata
console.log(registry.Celsius.abbreviation);  // '°C'
```

## Benefits

1. **Cleaner Syntax**: No need for verbose `as Type` casting
2. **More Ergonomic**: Feels natural to "construct" a unit value
3. **Type-Safe**: Returns properly branded types
4. **Consistent API**: Works seamlessly with existing conversion methods
5. **Backward Compatible**: Old manual casting still works

## Testing

All functionality is covered by tests in `registry.test.ts`:

- `unit accessor is callable to create branded values`
- `callable unit accessor works for unit-centric workflow`

Run tests with:
```bash
pnpm test
```

## Demo Files

Two demo files showcase the feature:

1. `demo-callable-accessors.ts` - Dedicated demo of callable accessors
2. `demo-unit-accessor.ts` - Updated to include callable accessor examples

Run demos with:
```bash
npx tsx demo-callable-accessors.ts
npx tsx demo-unit-accessor.ts
```

## Documentation

Updated documentation:
- `README.md` - Quick start and usage examples updated
- `CALLABLE_ACCESSORS.md` - This file (detailed feature documentation)
