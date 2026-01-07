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
git clone <repository-url>
cd unacy
pnpm install
```

## Quick Start

### Basic Usage

```typescript
import { createRegistry, type WithUnits } from '@unacy/core';

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
import { createRegistry, type WithUnits } from '@unacy/core';

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
# Start development
pnpm run dev

# Run tests
pnpm run test

# Lint and format
pnpm run lint
pnpm run format
```

## Project Structure

This project uses pnpm workspaces for managing multiple packages:

```
unacy/
├── packages/
│   └── [your packages here]
├── docs/
├── .github/workflows/
├── package.json
└── README.md
```

## Creating Your First Package

See [docs/WORKSPACE.md](docs/WORKSPACE.md) for detailed instructions on adding packages.

## Documentation

- [Workspace Guide](docs/WORKSPACE.md) - Managing packages
- [Development Workflow](docs/DEVELOPMENT.md) - Development process
- [Testing Guide](docs/TESTING.md) - Testing setup
- [Examples](docs/EXAMPLES.md) - Usage examples

## Contributing

Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT - See [LICENSE](LICENSE) for details

---

**Author**: Pradeep Mouli
**Created**: January 06, 2026
