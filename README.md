# unacy

Type-safe unit, format and type conversion library for TypeScript

## Features

- **Compile-Time Type Safety**: Prevents invalid cross-dimension conversions (e.g., Celsius to Meters)
- **Unit Accessor API**: Intuitive `registry.Celsius.to.Fahrenheit(value)` syntax
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
import { createRegistry, type WithUnits } from 'unacy';

// Define unit types
type Celsius = WithUnits<number, 'Celsius'>;
type Fahrenheit = WithUnits<number, 'Fahrenheit'>;

// Create registry and register converters
const registry = createRegistry()
  .register('Celsius', 'Fahrenheit', {
    to: (c: Celsius) => ((c * 9 / 5) + 32) as Fahrenheit,
    from: (f: Fahrenheit) => ((f - 32) * 5 / 9) as Celsius
  });

// Use the unit accessor API
const temp = 25 as Celsius;
const fahrenheit = registry.Celsius.to.Fahrenheit(temp);
console.log(fahrenheit); // 77
```

### Preventing Invalid Conversions

The type system prevents cross-dimension conversions at compile-time:

```typescript
type Meters = WithUnits<number, 'Meters'>;

// ❌ TypeScript error: Property 'Meters' does not exist
registry.Celsius.to.Meters(temp);
```

### Multi-Hop Conversions

The registry automatically composes multi-hop conversions via BFS:

```typescript
const registry = createRegistry()
  .register('Celsius', 'Kelvin', (c: Celsius) => (c + 273.15) as Kelvin)
  .register('Kelvin', 'Fahrenheit', (k: Kelvin) => ((k - 273.15) * 9/5 + 32) as Fahrenheit);

// Runtime: Celsius → Kelvin → Fahrenheit (automatic)
const fahrenheit = registry.convert(0 as Celsius, 'Celsius').to('Fahrenheit');
console.log(fahrenheit); // 32

// To enable type-safe accessor syntax for multi-hop paths, use allow():
const typeSafeRegistry = registry.allow('Celsius', 'Fahrenheit');

// Now type-safe:
const f = typeSafeRegistry.Celsius.to.Fahrenheit(0 as Celsius);
```

### Tree-Shakeable Exports

Export individual unit converters for optimal bundle size:

```typescript
// temperature.ts
import { createRegistry, type WithUnits } from 'unacy';

export type Celsius = WithUnits<number, 'Celsius'>;
export type Fahrenheit = WithUnits<number, 'Fahrenheit'>;
export type Kelvin = WithUnits<number, 'Kelvin'>;

const TemperatureRegistry = createRegistry()
  .register('Celsius', 'Fahrenheit', {
    to: (c: Celsius) => ((c * 9 / 5) + 32) as Fahrenheit,
    from: (f: Fahrenheit) => ((f - 32) * 5 / 9) as Celsius
  })
  .register('Celsius', 'Kelvin', (c: Celsius) => (c + 273.15) as Kelvin)
  .register('Kelvin', 'Celsius', (k: Kelvin) => (k - 273.15) as Celsius)
  .allow('Kelvin', 'Fahrenheit');

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
