# unacy

Type-safe unit, format and type conversion library for TypeScript

## Features

- **Full Compile-Time Type Safety**:
  - Prevents invalid value assignments (e.g., can't assign a Fahrenheit value to a Celsius variable)
  - Prevents invalid conversions (e.g., can't pass a Fahrenheit value to a Celsius converter)
  - Prevents cross-dimension conversions (e.g., Celsius to Meters)
  - No explicit type casting needed when registering converters
- **Unit Accessor API**: Intuitive `registry.Celsius.to.Fahrenheit(value)` syntax
- **Extensible Units**: Add metadata to units and register new converters dynamically
- **Auto-Composition**: Multi-hop conversions via BFS shortest path algorithm
- **Tree-Shakeable**: Export individual unit converters for optimal bundle size
- **Zero Runtime Overhead**: Type branding uses phantom types with no runtime cost

## Getting Started

### Prerequisites

- Node.js >= 20.0.0
- pnpm >= 10.0.0

### Installation

```bash
# Install from npm
npm install unacy

# Or with pnpm
pnpm add unacy

# Or with yarn
yarn add unacy
```

For development:

```bash
git clone https://github.com/pradeepmouli/unacy.git
cd unacy
pnpm install
```

## Quick Start

### Basic Usage

```typescript
import { createRegistry, type WithUnits, type BaseMetadata } from 'unacy';

// Define metadata for units
const CelsiusMetadata = {
  name: 'Celsius' as const,
  symbol: '°C',
  description: 'Temperature in Celsius'
} satisfies BaseMetadata;

const FahrenheitMetadata = {
  name: 'Fahrenheit' as const,
  symbol: '°F',
  description: 'Temperature in Fahrenheit'
} satisfies BaseMetadata;

// Define unit types with metadata
type Celsius = WithUnits<number, typeof CelsiusMetadata>;
type Fahrenheit = WithUnits<number, typeof FahrenheitMetadata>;

// Create registry and register converters using metadata objects
// Note: No explicit type casting needed in converter functions!
const registry = createRegistry()
  .register(CelsiusMetadata, FahrenheitMetadata, {
    to: (c: Celsius) => (c * 9 / 5) + 32,
    from: (f: Fahrenheit) => (f - 32) * 5 / 9
  });

// Use the unit accessor API
const temp = 25 as Celsius;
const fahrenheit = registry.Celsius.to.Fahrenheit(temp);
console.log(fahrenheit); // 77
```

### Type Safety Guarantees

The type system provides comprehensive compile-time safety:

```typescript
type Meters = WithUnits<number, 'Meters'>;

// ❌ Type safety for value assignments
const celsiusTemp = 25 as Celsius;
const fahrenheitTemp = 77 as Fahrenheit;
const invalidTemp: Celsius = fahrenheitTemp; // TypeScript error!

// ❌ Type safety for conversions
registry.Celsius.to.Fahrenheit(fahrenheitTemp); // TypeScript error!
// Can't pass a Fahrenheit value to a converter that expects Celsius

// ❌ Type safety for cross-dimension conversions
registry.Celsius.to.Meters(temp); // TypeScript error!
// Property 'Meters' does not exist
```

### Multi-Hop Conversions

The registry automatically composes multi-hop conversions via BFS:

```typescript
// Define metadata
const KelvinMetadata = {
  name: 'Kelvin' as const,
  symbol: 'K'
} satisfies BaseMetadata;

const registry = createRegistry()
  .register(CelsiusMetadata, KelvinMetadata, (c: Celsius) => c + 273.15)
  .register(KelvinMetadata, FahrenheitMetadata, (k: Kelvin) => (k - 273.15) * 9/5 + 32);

// Runtime: Celsius → Kelvin → Fahrenheit (automatic)
const fahrenheit = registry.convert(0 as Celsius, 'Celsius').to('Fahrenheit');
console.log(fahrenheit); // 32

// To enable type-safe accessor syntax for multi-hop paths, use allow():
const typeSafeRegistry = registry.allow(CelsiusMetadata, FahrenheitMetadata);

// Now type-safe:
const f = typeSafeRegistry.Celsius.to.Fahrenheit(0 as Celsius);
```

### Recent Enhancements

#### Unit Metadata

Add custom metadata to units for richer context:

```typescript
import { createRegistry, type WithUnits, type BaseMetadata } from 'unacy';

// Define metadata objects with unit information
const CelsiusMetadata = {
  name: 'Celsius' as const,
  symbol: '°C',
  abbreviation: '°C',
  description: 'Degrees Celsius'
} satisfies BaseMetadata;

const FahrenheitMetadata = {
  name: 'Fahrenheit' as const,
  symbol: '°F',
  abbreviation: '°F',
  description: 'Degrees Fahrenheit'
} satisfies BaseMetadata;

type Celsius = WithUnits<number, typeof CelsiusMetadata>;
type Fahrenheit = WithUnits<number, typeof FahrenheitMetadata>;

// Register converters with metadata objects - metadata is automatically stored
const registry = createRegistry()
  .register(CelsiusMetadata, FahrenheitMetadata, {
    to: (c: Celsius) => (c * 9 / 5) + 32,
    from: (f: Fahrenheit) => (f - 32) * 5 / 9
  });

// Access metadata properties directly
console.log(registry.Celsius.symbol); // '°C'
console.log(registry.Celsius.description); // 'Degrees Celsius'
console.log(registry.Fahrenheit.abbreviation); // '°F'
```

#### Dynamic Converter Registration via Unit Accessor

Register new converters using the intuitive unit accessor API:

```typescript
// Define Kelvin metadata
const KelvinMetadata = {
  name: 'Kelvin' as const,
  symbol: 'K',
  description: 'Absolute temperature'
} satisfies BaseMetadata;

type Kelvin = WithUnits<number, typeof KelvinMetadata>;

// Register converters directly through the unit accessor using metadata objects
const updatedRegistry = registry
  .Celsius.register(KelvinMetadata, (c: Celsius) => c + 273.15)
  .Kelvin.register(CelsiusMetadata, (k: Kelvin) => k - 273.15);

// Now use the newly registered converters
const kelvin = updatedRegistry.Celsius.to.Kelvin(25 as Celsius);
console.log(kelvin); // 298.15
```

### Tree-Shakeable Exports

Export individual unit converters for optimal bundle size:

```typescript
// temperature.ts
import { createRegistry, type WithUnits, type BaseMetadata } from 'unacy';

// Define and export metadata
export const CelsiusMetadata = {
  name: 'Celsius' as const,
  symbol: '°C'
} satisfies BaseMetadata;

export const FahrenheitMetadata = {
  name: 'Fahrenheit' as const,
  symbol: '°F'
} satisfies BaseMetadata;

export const KelvinMetadata = {
  name: 'Kelvin' as const,
  symbol: 'K'
} satisfies BaseMetadata;

export type Celsius = WithUnits<number, typeof CelsiusMetadata>;
export type Fahrenheit = WithUnits<number, typeof FahrenheitMetadata>;
export type Kelvin = WithUnits<number, typeof KelvinMetadata>;

const TemperatureRegistry = createRegistry()
  .register(CelsiusMetadata, FahrenheitMetadata, {
    to: (c: Celsius) => (c * 9 / 5) + 32,
    from: (f: Fahrenheit) => (f - 32) * 5 / 9
  })
  .register(CelsiusMetadata, KelvinMetadata, (c: Celsius) => c + 273.15)
  .register(KelvinMetadata, CelsiusMetadata, (k: Kelvin) => k - 273.15)
  .allow(KelvinMetadata, FahrenheitMetadata);

// Export individual converters using destructuring
export const { Celsius, Fahrenheit, Kelvin } = TemperatureRegistry;

// Usage - only imports what you use
import { Celsius } from './temperature';
const fahrenheit = Celsius.to.Fahrenheit(25 as Celsius);
```

### Development

```bash
# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Build packages
pnpm build

# Lint code
pnpm lint

# Format code
pnpm format

# Type check
pnpm type-check
```

## Packages

This monorepo contains the following packages:

- **[unacy](packages/core)** - Core conversion library with type-safe unit conversions, registry, and formatters

## Project Structure

```
unacy/
├── packages/
│   └── core/           # unacy - Core conversion library
│       ├── src/
│       │   ├── types.ts           # WithUnits, WithFormat types
│       │   ├── converters.ts      # Converter types
│       │   ├── registry.ts        # ConverterRegistry implementation
│       │   ├── formatters.ts      # Formatter/Parser types
│       │   ├── errors.ts          # Error classes
│       │   └── utils/
│       │       ├── graph.ts       # BFS pathfinding
│       │       └── validation.ts  # Runtime validation helpers
│       └── __tests__/             # Test suites
├── specs/                         # Feature specifications
│   └── 001-unacy-core/
├── docs/                          # Documentation
├── .github/workflows/             # CI/CD workflows
└── README.md
```

## Documentation

- [Feature Specification](specs/001-unacy-core/spec.md) - Complete feature specification
- [Implementation Plan](specs/001-unacy-core/plan.md) - Technical implementation details
- [API Documentation](packages/core/README.md) - Core package API reference
- [Type System Architecture](specs/001-unacy-core/spec.md#type-system-architecture) - Edge-based type tracking

## Contributing

Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT - See [LICENSE](LICENSE) for details

---

**Author**: Pradeep Mouli
**Created**: January 06, 2026
