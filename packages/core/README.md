# @unacy/core

Type-safe unit and format conversion library with automatic multi-hop composition.

## Features

- 🔒 **Type-safe conversions** - Compile-time checks prevent mixing incompatible units
- 🔄 **Auto-composition** - Automatically chains converters (A→B→C for A→C)
- 🚀 **Zero runtime overhead** - Phantom types have no performance cost
- 🎯 **Shortest path** - BFS finds optimal conversion routes
- 🛡️ **Cycle detection** - Prevents infinite conversion loops
- 📦 **Tree-shakeable** - Only bundle converters you use
- ✨ **Fluent API** - Clean, readable conversion syntax

## Installation

```bash
pnpm add @unacy/core
```

## Quick Start

```typescript
import { createRegistry, type WithUnits } from '@unacy/core';

// Define your unit types
type Celsius = WithUnits<number, 'Celsius'>;
type Fahrenheit = WithUnits<number, 'Fahrenheit'>;

// Create a registry
const tempRegistry = createRegistry()
  .register('Celsius', 'Fahrenheit', (c) => ((c * 9/5) + 32) as Fahrenheit);

// Convert with type safety - two ways:
const temp: Celsius = 25 as Celsius;

// Method 1: unit accessor API
const fahrenheit2 = tempRegistry.Celsius.to.Fahrenheit(temp as Celsius) satisfies Fahrenheit;

console.log(fahrenheit2); // 77
```

## Usage Examples

### Basic Unit Conversions

```typescript
// Same registry as above
const distance: Meters = 10 as Meters;

// Access units directly via property syntax
const feet = distanceRegistry.meters.to.feet(distance);
console.log(feet); // 32.8084

// Works in both directions
const meters = distanceRegistry.feet.to.meters(32.8084 as Feet) satisfies Meters;
console.log(meters); // 10
```

### Bidirectional Converters

```typescript
import { createRegistry, type WithUnits } from '@unacy/core';

type Meters = WithUnits<number, 'meters'>;
type Kilometers = WithUnits<number, 'kilometers'>;

const registry = createRegistry<'meters' | 'kilometers'>()
  .registerBidirectional('meters', 'kilometers', {
    to: (m) => (m / 1000) as Kilometers,
    from: (km) => (km * 1000) as Meters
  });

// Both directions work automatically
const km = registry.convert(5000 as Meters, 'meters').to('kilometers'); // 5
const m = registry.convert(5 as Kilometers, 'kilometers').to('meters'); // 5000
```

### Multi-Hop Auto-Composition

The registry automatically composes converters via shortest path:

```typescript
type Meters = WithUnits<number, 'meters'>;
type Kilometers = WithUnits<number, 'kilometers'>;
type Miles = WithUnits<number, 'miles'>;

const registry = createRegistry<'meters' | 'kilometers' | 'miles'>()
  .registerBidirectional('meters', 'kilometers', {
    to: (m) => (m / 1000) as Kilometers,
    from: (km) => (km * 1000) as Meters
  })
  .registerBidirectional('kilometers', 'miles', {
    to: (km) => (km * 0.621371) as Miles,
    from: (mi) => (mi / 0.621371) as Kilometers
  });

// No direct meters→miles converter registered!
// Registry auto-composes: meters → kilometers → miles
const meters: Meters = 5000 as Meters;
const miles = registry.convert(meters, 'meters').to('miles');
console.log(miles); // 3.106855
```

### Format-Tagged Values

```typescript
import { type WithFormat, type FormatterParser, ParseError } from '@unacy/core';
import { z } from 'zod';

type ISO8601 = WithFormat<Date, 'ISO8601'>;

const iso8601: FormatterParser<ISO8601> = {
  format: (date) => date.toISOString(),
  parse: (input) => {
    const schema = z.string().datetime();
    try {
      return new Date(schema.parse(input)) as ISO8601;
    } catch {
      throw new ParseError('ISO8601', input, 'Invalid date format');
    }
  }
};

// Format
const now: ISO8601 = new Date() as ISO8601;
const str = iso8601.format(now); // "2026-01-06T12:00:00.000Z"

// Parse
const date = iso8601.parse('2026-01-06T12:00:00.000Z');
```

## API Reference

### Types

#### `WithUnits<T, U>`
Brand a value with a unit identifier for compile-time safety.

```typescript
type Celsius = WithUnits<number, 'Celsius'>;
const temp: Celsius = 25 as Celsius;
```

#### `WithFormat<T, F>`
Brand a value with a format identifier for serialization safety.

```typescript
type ISO8601 = WithFormat<Date, 'ISO8601'>;
const date: ISO8601 = new Date() as ISO8601;
```

#### `Converter<TInput, TOutput>`
Unidirectional converter function.

```typescript
const c2f: Converter<Celsius, Fahrenheit> = (c) =>
  ((c * 9/5) + 32) as Fahrenheit;
```

#### `BidirectionalConverter<TInput, TOutput>`
Pair of converters for two-way transformations.

```typescript
const meterKm: BidirectionalConverter<Meters, Kilometers> = {
  to: (m) => (m / 1000) as Kilometers,
  from: (km) => (km * 1000) as Meters
};
```

### Registry

#### `createRegistry<Units>()`
Create a new converter registry.

```typescript
const registry = createRegistry<'A' | 'B' | 'C'>();
```

#### `register(from, to, converter)`
Register a unidirectional converter.

```typescript
registry.register('Celsius', 'Fahrenheit', celsiusToFahrenheit);
```

#### `registerBidirectional(from, to, converter)`
Register both directions at once.

```typescript
registry.registerBidirectional('meters', 'kilometers', meterKm);
```

#### `convert(value, fromUnit).to(toUnit)`
Fluent API for type-safe conversions.

```typescript
const result = registry.convert(value, 'Celsius').to('Fahrenheit');
```

### Errors

- `UnacyError` - Base error class
- `CycleError` - Cycle detected in conversion graph
- `MaxDepthError` - Exceeded maximum conversion depth (5 hops)
- `ConversionError` - No conversion path found
- `ParseError` - Invalid input during parsing

## Best Practices

1. **Define unit types at module boundaries** for consistency
2. **Use bidirectional converters** when both directions are needed
3. **Document precision loss** in converters
4. **Cache registries** for performance
5. **Validate with Zod** in parsers

## Performance

- Direct conversions: O(1) lookup
- Multi-hop conversions: O(V+E) BFS with caching
- Type checking: <1s for typical graphs (<100 units)
- Zero runtime overhead for type brands

## License

MIT

## Links

- [Specification](../../specs/001-unacy-core/spec.md)
- [Quickstart Guide](../../specs/001-unacy-core/quickstart.md)
- [API Contracts](../../specs/001-unacy-core/contracts/api.md)
