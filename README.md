# unacy

> Type-safe unit, format, and dimensional conversion for TypeScript — catch "Fahrenheit into Celsius" bugs at compile time, compose multi-hop conversions automatically, and pay zero runtime cost for the safety.

> **⚠️ Pre-1.0 software** — APIs are subject to change between minor versions. Pin to exact versions in production. See the [CHANGELOG](./CHANGELOG.md) for breaking changes between releases.

<p align="center">
  <a href="https://www.npmjs.com/package/unacy"><img src="https://img.shields.io/npm/v/unacy?style=flat-square&label=unacy" alt="npm version" /></a>
  <a href="https://github.com/pradeepmouli/unacy/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/pradeepmouli/unacy/ci.yml?style=flat-square" alt="ci" /></a>
  <img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="license" />
  <img src="https://img.shields.io/badge/node-%3E%3D20-brightgreen?style=flat-square" alt="node" />
</p>

📚 **Documentation:** <https://pradeepmouli.github.io/unacy/>

## Overview

Unit conversions are one of those problems that look trivial until a `number` flagged as one unit slips into a function expecting another and ships to production. `unacy` solves that class of bug the way TypeScript solves most bugs: by making the mistake impossible to express. Values are branded with their unit via phantom types (`Celsius`, `Meters`, `USD`), and the converter registry exposes a nested accessor (`registry.Celsius.to.Fahrenheit(value)`) whose callable surface is determined by the edges you actually registered.

The branding is purely compile-time — there is no wrapper object, no runtime tag, no proxy dispatching, and no bundle-size tax for units that never get used. At runtime a conversion is the function you registered, called directly. At type-check time, passing a `Fahrenheit` to `registry.Celsius.to.Fahrenheit(...)` is a type error, passing it to a cross-dimension converter like `Celsius.to.Meters(...)` is a type error, and assigning a `Fahrenheit` to a variable typed `Celsius` is a type error.

When conversions don't exist as a single edge, the registry composes them automatically via a BFS shortest-path search (`Celsius → Kelvin → Fahrenheit`), and an `allow()` API lifts composed paths into the type system so the direct accessor `registry.Celsius.to.Fahrenheit(...)` becomes type-safe even when the edge was synthesized.

## Features

- **Full compile-time type safety** — invalid assignments, wrong-direction conversions, and cross-dimension conversions are all TypeScript errors, not runtime failures.
- **Phantom-typed values** — `WithUnits<number, Metadata>` brands values without boxing them; zero runtime overhead.
- **Unit accessor API** — intuitive nested syntax: `registry.Celsius.to.Fahrenheit(value)`.
- **Extensible metadata** — attach symbol, abbreviation, description, or custom fields to each unit via `BaseMetadata` and read them back off the registry (`registry.Celsius.symbol`).
- **Dynamic registration** — grow the registry incrementally with `.register(A, B, fn)` or the accessor form `registry.Celsius.register(KelvinMetadata, fn)`; each call returns a new registry type that includes the new edge.
- **Bidirectional converters** — register `{ to, from }` pairs in a single call to get both directions typed.
- **Auto-composed multi-hop paths** — runtime BFS finds `A → B → C` automatically; `allow(A, C)` lifts the composed path into the static type.
- **Tree-shakeable** — destructure individual unit converters (`export const { Celsius, Fahrenheit } = registry`) so bundlers can drop what you don't import.
- **Dimension safety** — units from different dimensions (temperature vs. length) have disjoint accessor namespaces; the compiler won't let you mix them.
- **ESM-only, dependency-light** — per the project constitution, the core ships with no runtime dependencies.

## Install

```bash
pnpm add unacy
# or
npm install unacy
```

Requires **Node.js ≥ 20** and a TypeScript version new enough for template literal types and const type parameters (5.x).

## Quick Start

```typescript
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

const temp = 25 as Celsius;
const fahrenheit = registry.Celsius.to.Fahrenheit(temp);
console.log(fahrenheit); // 77
```

## Usage

### Type safety guarantees

```typescript
type Meters = WithUnits<number, 'Meters'>;

const celsiusTemp = 25 as Celsius;
const fahrenheitTemp = 77 as Fahrenheit;

// ❌ Invalid value assignment
const invalid: Celsius = fahrenheitTemp;                    // TS error

// ❌ Wrong direction — passing Fahrenheit to Celsius converter
registry.Celsius.to.Fahrenheit(fahrenheitTemp);             // TS error

// ❌ Cross-dimension — Meters isn't in the temperature registry
registry.Celsius.to.Meters(celsiusTemp);                    // TS error
```

### Multi-hop conversions

Register each hop once; the registry composes the rest via BFS at runtime. Use `allow()` to lift a composed path into the accessor's static type:

```typescript
const KelvinMetadata = { name: 'Kelvin' as const, symbol: 'K' } satisfies BaseMetadata;
type Kelvin = WithUnits<number, typeof KelvinMetadata>;

const registry = createRegistry()
  .register(CelsiusMetadata, KelvinMetadata, (c: Celsius) => c + 273.15)
  .register(KelvinMetadata, FahrenheitMetadata, (k: Kelvin) => (k - 273.15) * 9 / 5 + 32);

// Runtime: walks Celsius → Kelvin → Fahrenheit automatically
const f1 = registry.convert(0 as Celsius, 'Celsius').to('Fahrenheit'); // 32

// Lift the composed path into the type system
const typed = registry.allow(CelsiusMetadata, FahrenheitMetadata);
const f2 = typed.Celsius.to.Fahrenheit(0 as Celsius); // now type-safe
```

### Unit metadata

Attach symbol, abbreviation, description, or any extra field to a unit and read it off the registry:

```typescript
const CelsiusMetadata = {
  name: 'Celsius' as const,
  symbol: '°C',
  abbreviation: '°C',
  description: 'Degrees Celsius'
} satisfies BaseMetadata;

const registry = createRegistry().register(CelsiusMetadata, FahrenheitMetadata, {
  to: (c: Celsius) => (c * 9 / 5) + 32,
  from: (f: Fahrenheit) => (f - 32) * 5 / 9
});

registry.Celsius.symbol;       // '°C'
registry.Celsius.description;  // 'Degrees Celsius'
registry.Fahrenheit.abbreviation; // '°F'
```

### Dynamic registration via the accessor

```typescript
const updated = registry
  .Celsius.register(KelvinMetadata, (c: Celsius) => c + 273.15)
  .Kelvin.register(CelsiusMetadata, (k: Kelvin) => k - 273.15);

const kelvin = updated.Celsius.to.Kelvin(25 as Celsius); // 298.15
```

### Tree-shakeable exports

Destructure per-unit accessors so bundlers drop unused conversions:

```typescript
// temperature.ts
export const CelsiusMetadata    = { name: 'Celsius' as const, symbol: '°C' } satisfies BaseMetadata;
export const FahrenheitMetadata = { name: 'Fahrenheit' as const, symbol: '°F' } satisfies BaseMetadata;
export const KelvinMetadata     = { name: 'Kelvin' as const, symbol: 'K' } satisfies BaseMetadata;

export type Celsius    = WithUnits<number, typeof CelsiusMetadata>;
export type Fahrenheit = WithUnits<number, typeof FahrenheitMetadata>;
export type Kelvin     = WithUnits<number, typeof KelvinMetadata>;

const Temperature = createRegistry()
  .register(CelsiusMetadata, FahrenheitMetadata, {
    to: (c: Celsius) => (c * 9 / 5) + 32,
    from: (f: Fahrenheit) => (f - 32) * 5 / 9
  })
  .register(CelsiusMetadata, KelvinMetadata, (c: Celsius) => c + 273.15)
  .register(KelvinMetadata, CelsiusMetadata, (k: Kelvin) => k - 273.15)
  .allow(KelvinMetadata, FahrenheitMetadata);

export const { Celsius, Fahrenheit, Kelvin } = Temperature;

// Consumer — only pulls in what it imports
import { Celsius } from './temperature';
const f = Celsius.to.Fahrenheit(25 as Celsius);
```

## How it works

The core trick is that `WithUnits<T, M>` is `T & { readonly __unit: M }` — a phantom intersection that exists only in the type system. At runtime, values are plain `number`s (or `string`s, etc.). Converters you register are plain functions, stored in a graph keyed by metadata `name`.

`createRegistry()` returns an object whose static type is a mapping over the registered edges: each `.register(A, B, fn)` call threads through a type-level accumulator that adds `A.to.B` (and, for bidirectional registrations, `B.to.A`) to the accessor. At runtime, the registry stores edges in an adjacency map and runs a BFS over it when `.convert(...).to(...)` is called on a path that wasn't registered directly. `allow(A, B)` asserts to the type system that a path exists so the accessor form becomes available without widening runtime behavior.

The net effect: you get F#-units-of-measure-style compile-time safety in TypeScript, with no runtime boxing and bundle sizes that scale only with the units you actually import.

## Packages

| Package | Description |
|---|---|
| [`unacy`](packages/core) | Core library — registry, converters, formatters, type utilities, BFS pathfinding |

## Related projects

- **[js-quantities](https://github.com/gentooboontoo/js-quantities)** / **[convert-units](https://github.com/convert-units/convert-units)** — runtime-first conversion libraries with predefined unit catalogs. `unacy` inverts that: no catalog, no runtime wrappers, type-safety-first, bring your own units.
- **[ts-units](https://github.com/bheisig/ts-units)** — similar philosophy; `unacy` differs in its registry-and-accessor model, multi-hop BFS composition, and metadata reflection (`registry.Celsius.symbol`).
- **F# units of measure** — the inspiration. `unacy` is the closest TypeScript approximation the author could find.

## Development

```bash
pnpm install
pnpm test          # run tests
pnpm test:watch    # watch mode
pnpm build
pnpm lint
pnpm type-check
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

MIT — see [LICENSE](./LICENSE).
