# Getting Started

> **⚠️ Pre-1.0 software** — APIs are subject to change between minor versions. Pin to exact versions in production.

`unacy` is a type-safe unit, format and type conversion library for TypeScript. It uses phantom types to brand values with their unit so the compiler can prevent cross-dimension mistakes — and it composes multi-hop conversions automatically via BFS over a typed registry.

## Install

```bash
pnpm add unacy
```

## Quick start

```ts
import { createRegistry, type WithUnits, type BaseMetadata } from 'unacy';

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

type Celsius = WithUnits<number, typeof CelsiusMetadata>;
type Fahrenheit = WithUnits<number, typeof FahrenheitMetadata>;

const registry = createRegistry()
  .register(CelsiusMetadata, FahrenheitMetadata, {
    to: (c: Celsius) => (c * 9 / 5) + 32,
    from: (f: Fahrenheit) => (f - 32) * 5 / 9
  });
```

## Next steps

- [Installation](./installation.md)
- [Usage](./usage.md)
- [API Reference](../api/)
