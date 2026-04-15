# Usage

## Define units and register converters

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

## Convert values

```ts
const body = 37 as Celsius;
const fahrenheit = registry.Celsius.to.Fahrenheit(body); // 98.6
```

The compiler prevents:

- Assigning a `Fahrenheit` value to a `Celsius` variable
- Calling `Celsius.to.Meters` (cross-dimension)
- Passing the wrong unit into a converter

## Multi-hop conversions

When you register converters forming a graph, `unacy` uses BFS shortest-path to resolve multi-hop conversions automatically — no manual chaining required.

## API reference

See the full [API reference](../api/) for every exported symbol.
