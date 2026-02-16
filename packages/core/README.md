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
- 🎯 **Typed Metadata** - Native support for `number`, `string`, `boolean`, and `bigint` units
- 🧩 **Non-Primitive Types** - First-class support for enums, classes, records, and tuples

## Installation

```bash
pnpm add @unacy/core
```

## Quick Start

```typescript
import { createRegistry } from '@unacy/core';
import type { WithTypedUnits } from '@unacy/core';

// Define metadata for your units (name + type)
const CelsiusMetadata = {
  name: 'Celsius' as const,
  type: 'number' as const
};

const FahrenheitMetadata = {
  name: 'Fahrenheit' as const,
  type: 'number' as const
};

// Define your unit types with metadata
type Celsius = WithTypedUnits<typeof CelsiusMetadata>;
type Fahrenheit = WithTypedUnits<typeof FahrenheitMetadata>;

// Create a registry and register converters
const tempRegistry = createRegistry()
  .register(CelsiusMetadata, FahrenheitMetadata, (c) => ((c * 9/5) + 32));

// Create branded values using callable accessors (NEW!)
const temp = tempRegistry.Celsius(25); // Returns Celsius type

// Convert with type safety - two ways:

// Method 1: unit accessor API
const fahrenheit1 = tempRegistry.Celsius.to.Fahrenheit(temp);

// Method 2: fluent callable accessor API
const fahrenheit2 = tempRegistry.Celsius.to.Fahrenheit(tempRegistry.Celsius(30));

console.log(fahrenheit1); // 77
console.log(fahrenheit2); // 86

// Old way still works (manual casting)
const tempOld: Celsius = 25 as Celsius;
```

## Usage Examples

### Callable Unit Accessors

Unit accessors are now callable functions that create branded values:

```typescript
// Create branded values without manual type casting
const temp = registry.Celsius(25);        // Returns WithTypedUnits<typeof CelsiusMetadata>
const distance = registry.meters(100);    // Returns WithTypedUnits<typeof MetersMetadata>

// Fluent workflow
const fahrenheit = registry.Celsius.to.Fahrenheit(registry.Celsius(20));

// Compare with old way (still works)
const tempOld: Celsius = 25 as Celsius;

// Benefits:
// - Cleaner syntax
// - Less verbose than manual casting
// - Type-safe by design
// - Works seamlessly with conversions
```

### Typed Metadata

Define metadata with minimal required fields (name + type):

```typescript
const CelsiusMetadata = {
  name: 'Celsius' as const,
  type: 'number' as const
};

const EtherMetadata = {
  name: 'ether' as const,
  type: 'bigint' as const
};

const FlagMetadata = {
  name: 'enabled' as const,
  type: 'boolean' as const
};
```

### Basic Unit Conversions

```typescript
// Same registry as above
const distance: Meters = 10 as Meters;

// Access units directly via property syntax
const feet = distanceRegistry.meters.to.feet(distance);
console.log(feet); // 32.8084

// Or use callable accessors
const feet2 = distanceRegistry.meters.to.feet(distanceRegistry.meters(10));

// Works in both directions
const meters = distanceRegistry.feet.to.meters(32.8084 as Feet) satisfies Meters;
console.log(meters); // 10
```

### Bidirectional Converters

```typescript
import { createRegistry } from '@unacy/core';
import type { WithTypedUnits } from '@unacy/core';

const MetersMetadata = {
  name: 'meters' as const,
  type: 'number' as const
};

const KilometersMetadata = {
  name: 'kilometers' as const,
  type: 'number' as const
};

type Meters = WithTypedUnits<typeof MetersMetadata>;
type Kilometers = WithTypedUnits<typeof KilometersMetadata>;

const registry = createRegistry()
  .register(MetersMetadata, KilometersMetadata, {
    to: (m: number) => (m / 1000),
    from: (km: number) => (km * 1000)
  });

// Both directions work automatically
const km = registry.convert(5000 as Meters, 'meters').to('kilometers'); // 5
const m = registry.convert(5 as Kilometers, 'kilometers').to('meters'); // 5000
```

### Multi-Hop Auto-Composition

The registry automatically composes converters via shortest path:

```typescript
const MetersMetadata = { name: 'meters' as const, type: 'number' as const };
const KilometersMetadata = { name: 'kilometers' as const, type: 'number' as const };
const MilesMetadata = { name: 'miles' as const, type: 'number' as const };

type Meters = WithTypedUnits<typeof MetersMetadata>;
type Kilometers = WithTypedUnits<typeof KilometersMetadata>;
type Miles = WithTypedUnits<typeof MilesMetadata>;

const registry = createRegistry()
  .register(MetersMetadata, KilometersMetadata, {
    to: (m: number) => (m / 1000),
    from: (km: number) => (km * 1000)
  })
  .register(KilometersMetadata, MilesMetadata, {
    to: (km: number) => (km * 0.621371),
    from: (mi: number) => (mi / 0.621371)
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

### Non-Primitive Types

Beyond primitives, the registry supports enums, classes, records, and tuples
as unit types. The `type` field in metadata IS the runtime value itself.

#### Enum Units

```typescript
import { createRegistry } from '@unacy/core';
import type { WithTypedUnits, TypedMetadata } from '@unacy/core';

enum LogLevel { DEBUG = 0, INFO = 1, WARN = 2, ERROR = 3 }

const LogLevelMeta = { name: 'LogLevel', type: LogLevel } as const;
type LogLevelUnit = WithTypedUnits<typeof LogLevelMeta>;

const registry = createRegistry()
  .register(LogLevelMeta, /* ... */);
```

#### Class Units

```typescript
class Temperature {
  constructor(public value: number, public scale: string) {}
}

const TempMeta = { name: 'Temperature', type: Temperature } as const;
type TempUnit = WithTypedUnits<typeof TempMeta>;
```

#### Record Units

```typescript
const PointSchema = { x: 'number', y: 'number' } as const;
const PointMeta = { name: 'Point', type: PointSchema } as const;
type PointUnit = WithTypedUnits<typeof PointMeta>;

// Nested schemas
const LineMeta = {
  name: 'Line',
  type: { start: { x: 'number', y: 'number' }, end: { x: 'number', y: 'number' } }
} as const;
```

#### Tuple Units

```typescript
const RGBSchema = ['number', 'number', 'number'] as const;
const RGBMeta = { name: 'RGB', type: RGBSchema } as const;
type RGBUnit = WithTypedUnits<typeof RGBMeta>;

// Optional and rest elements
const HeaderSchema = ['string', 'number?', '...string'] as const;
```

#### Runtime Type Guards

```typescript
import {
  isEnumMetadata, isClassMetadata,
  isRecordMetadata, isTupleMetadata,
  detectMetadataKind
} from '@unacy/core';

detectMetadataKind(LogLevelMeta);  // 'enum'
detectMetadataKind(TempMeta);      // 'class'
detectMetadataKind(PointMeta);     // 'record'
detectMetadataKind(RGBMeta);       // 'tuple'

if (isEnumMetadata(meta)) {
  // meta.type is narrowed to EnumType
}
```

## API Reference

### Types

#### `WithTypedUnits<M extends TypedMetadata<T>>`
Brand a value with strongly-typed metadata for compile-time unit safety.

```typescript
const CelsiusMetadata = { name: 'Celsius' as const, type: 'number' as const };
type Celsius = WithTypedUnits<typeof CelsiusMetadata>;
const temp: Celsius = tempRegistry.Celsius(25);
```

#### `WithUnits<T, U>`
Legacy: Brand a value with a unit identifier for compile-time safety.

```typescript
type Celsius = WithUnits<number, 'Celsius'>;
const temp: Celsius = 25 as Celsius;
```

#### `TypedMetadata<T>`
Minimal metadata type with name and type information.

```typescript
type NumericMetadata = TypedMetadata<number>;
// { name: string; type: 'number' }

type StringMetadata = TypedMetadata<string>;
// { name: string; type: 'string' }

// Non-primitive: type IS the value itself
type EnumMetadata = TypedMetadata<typeof LogLevel>;
// { name: string; type: typeof LogLevel }
```

#### `SupportedType`
Union of all types that can be used as a unit base:
`number | string | boolean | bigint | EnumType | ClassType | RecordSchema | TupleSchema`

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
  to: (m: number) => (m / 1000),
  from: (km: number) => (km * 1000)
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
registry.register(CelsiusMetadata, FahrenheitMetadata, celsiusToFahrenheit);
```

#### `register(from, to, converter)` (bidirectional)
Register both directions at once.

```typescript
registry.register(MetersMetadata, KilometersMetadata, meterKm);
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

1. **Define metadata as const at module boundaries** for consistency
2. **Use bidirectional converters** when both directions are needed
3. **Document precision loss** in converters
4. **Cache registries** for performance
5. **Use `WithTypedUnits`** for brand-new code; leverage type inference
6. **Validate with Zod** in parsers

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
