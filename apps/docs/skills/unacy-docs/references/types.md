# Types & Enums

## Branding

### `WithUnits`
Brand a value with a unit identifier for compile-time unit safety.

The branding is purely a compile-time phantom — at runtime, values are plain
`T` (number, string, etc.) with zero overhead. Branded values extend their
base type, so they are assignable to plain `T` but not vice versa.
```ts
Tagged<T, typeof UNITS, M>
```

### `WithTypedUnits`
Resolve a branded unit type from a `TypedMetadata` object.

For primitive metadata (where `type` is a name string like `'number'`),
maps back through `PrimitiveTypeMap` to recover the base primitive.
For non-primitive metadata (enum, class, record, tuple), resolves to
the actual runtime value type via `ResolveValueType`.
```ts
unknown extends M ? WithUnits<any, any> : M extends { name: string; type: infer TypeField } ? TypeField extends keyof PrimitiveTypeMap ? WithUnits<PrimitiveTypeMap[TypeField], M> : TypeField extends SupportedType ? WithUnits<ResolveValueType<TypeField>, M> : never : never
```

### `WithFormat`
Brand a value with a format identifier for compile-time format safety.

Analogous to `WithUnits<T, M>` but for format tags rather than unit
metadata. Ensures a formatted string, `Date`, or number cannot be
passed to a formatter/parser expecting a different format.
```ts
Tagged<T, typeof UNITS, F>
```

### `Relax`
Relax a branded unit type to accept either the branded form or its raw unwrapped value.
Useful for APIs that should accept both `WithUnits<T, M>` and plain `T` interchangeably.
```ts
T | Unwrap<T>
```

## Metadata

### `BaseMetadata`
Base metadata type that all unit metadata must extend.
Requires a `name` property and allows arbitrary additional properties.

### `TypedMetadata`
Metadata type for units with explicit type information.

For primitive types, `type` is the type name string (e.g., `'number'`).
For non-primitive types, `type` IS the actual value:
- Enum: the enum object itself
- Class: the class constructor
- Record: the schema object `{ x: 'number', y: 'string' }`
- Tuple: the tuple schema array `['number', 'string']`
```ts
Simplify<{ name: string; type: T extends PrimitiveType ? ToPrimitiveTypeName<T> : T }>
```

### `UnitMetadata`
Display and descriptive metadata that can be attached to units in the registry.

Supports common properties like abbreviation, format template, description,
and symbol, plus an index signature for arbitrary custom fields.
**Properties:**
- `abbreviation: string` (optional) — Short abbreviation for the unit (e.g., "°C", "m", "kg")
- `format: string` (optional) — Format string for displaying values (e.g., "${value}°C")
- `description: string` (optional) — Human-readable description of the unit
- `symbol: string` (optional) — Symbol representation of the unit

## Types

### `PrimitiveType`
Primitive JavaScript types that can be used as unit base types.
```ts
number | string | boolean | bigint
```

### `SupportedType`
Union of all types that can be used as a unit's base type.
Includes primitives and non-primitive categories (enum, class, record, tuple).
```ts
PrimitiveType | EnumType | ClassType | RecordSchema | TupleSchema
```

### `EnumType`
A TypeScript enum object at runtime — an object whose values are all
strings (string enum) or all numbers (numeric enum).
Mixed enums (both string and number values) are rejected at validation.
```ts
Record<string, string | number>
```

### `ClassType`
A class constructor (including abstract classes) that can serve as a
unit's type identity. At runtime, the constructor itself is stored
in the metadata `type` field.
```ts
(args: any[]) => any
```

### `RecordSchema`
A schema describing an object shape. Keys are property names;
values are primitive type name strings (`'number'`, `'string'`, etc.)
or nested `RecordSchema` objects.
```ts
{ [key: string]: RecordSchemaValue }
```

### `TupleSchema`
A schema describing a tuple as an array of primitive type name strings.
Supports optional (`'number?'`) and rest (`'...number'`) modifiers.
```ts
readonly string[]
```

## types

### `ToPrimitiveTypeName`
Map a primitive TypeScript type to its corresponding type name string.
For example, `number` → `'number'`, `string` → `'string'`, `boolean` → `'boolean'`, `bigint` → `'bigint'`.
Returns `never` for non-primitive types.
```ts
T extends PrimitiveTypeMap[infer U extends keyof PrimitiveTypeMap] ? U : never
```

### `PrimitiveTypeFromName`
Map type name strings to TypeScript primitive types.
```ts
T extends "number" ? number : T extends "string" ? string : T extends "boolean" ? boolean : T extends "bigint" ? bigint : never
```

### `InferFromRecordSchema`
Infer TypeScript type from a `RecordSchema`.
Recursively processes nested schemas.
```ts
Simplify<{ [K in keyof S]: S[K] extends string ? PrimitiveTypeFromName<S[K]> : S[K] extends RecordSchema ? InferFromRecordSchema<S[K]> : never }>
```

### `InferFromTupleSchema`
Infer TypeScript type from a `TupleSchema`.
Handles optional (`?`) and rest (`...`) elements.
```ts
T extends readonly [] ? [] : T extends readonly [infer Head extends string, ...(infer Rest extends readonly string[])] ? Head extends `...${infer Base}` ? Rest extends readonly [] ? [...PrimitiveTypeFromName<Base>[]] : never : Head extends `${infer Base}?` ? [PrimitiveTypeFromName<Base>?, ...InferFromTupleSchema<Rest>] : [PrimitiveTypeFromName<Head>, ...InferFromTupleSchema<Rest>] : never
```

## Converters

### `Converter`
Unidirectional converter from one unit to another.

A pure function that takes a value tagged with a source unit and returns a
value tagged with a destination unit. Converters are registered in the
`UnitRegistry` and composed automatically via BFS when no direct edge exists.
```ts
(input: TInput) => TOutput
```

### `BidirectionalConverter`
Bidirectional converter with forward and reverse transformations.

Registers both directions in a single `registry.register(A, B, converter)` call.
Under the hood, the registry splits `{ to, from }` into two unidirectional
edges in the adjacency map.

### `RelaxedConverter`
A converter that accepts the branded input type but returns
unwrapped (plain) output. This eliminates the need to cast return values
to branded types inside converter functions, while preserving
full autocompletion on the input parameter.

Since `Tagged<T, ...> extends T`, strict converters returning branded
types are also assignable to this type.
```ts
(input: TInput) => Unwrap<TOutput>
```

### `RelaxedBidirectionalConverter`
A bidirectional converter with relaxed (unwrapped) output types.
Input remains branded for full autocompletion and type safety;
return values are plain base types without branding.

## Formatters

### `Formatter`
Formatter converts a format-tagged value to a string representation.
```ts
(input: TInput) => string
```

### `Parser`
Parser converts a plain string into a format-tagged value with validation.

Parsers are the gatekeeper that transforms raw (unbranded) string input into
a `WithFormat<T, F>` branded value. They must validate the input fully before
applying the brand — invalid inputs must throw, never produce tagged garbage.
```ts
(input: string) => TOutput
```

### `FormatterParser`
Paired formatter/parser for round-trip format transformations.

Encapsulates both directions of a format contract in a single object:
`format` converts a branded value to a string; `parse` validates and
re-brands a string back to the same type.

## Registry

### `UnitRegistry`
Registry for managing and composing unit converters.

The central API of unacy. Each `register()` call returns a **new** registry
instance (immutable accumulator pattern) whose static type reflects the newly
added edge(s). At runtime, the registry stores edges in an adjacency map and
runs BFS when a direct edge is absent.

### `UnitMap`
A map of unit name → `UnitAccessor` for all registered source units.

Provides the fluent accessor shape:
`registry.Celsius.to.Fahrenheit(value)`
Only units that appear as the `From` side of a registered edge appear here.
```ts
{ [FU in FromUnits<Edges> as UnitsFor<FU>]: UnitAccessor<FU, Edges> }
```

### `UnitAccessor`
Callable accessor object returned per unit from the registry.

Provides three capabilities in one surface:
1. **Callable** — call it to brand a plain value: `registry.Celsius(25)` → `Celsius`
2. **`.to.<Unit>(value)`** — convert to another registered unit
3. **`.register(toMeta, converter)`** — extend the registry from this unit

Also reflects the unit's metadata properties directly (e.g., `registry.Celsius.symbol`).
```ts
{ (args: InferCallableArgs<From>): From; to: { [To in ToUnitsFor<Edges, From> as UnitsFor<To>]: (value: Relax<From>) => To }; addMetadata: any; register: any } & UnitsOf<From>
```
