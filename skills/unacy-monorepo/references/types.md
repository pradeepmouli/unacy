# Types & Enums

## Types

### `WithUnits`
Brand a value with a unit identifier for compile-time unit safety.
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
```ts
Tagged<T, typeof UNITS, F>
```

### `BaseMetadata`
Base metadata type that all unit metadata must extend.
Requires a `name` property and allows arbitrary additional properties.

### `TypedMetadata`
Metadata type for units with type information.

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
Metadata that can be attached to units in the registry
Supports common properties like abbreviation, format, description,
and allows arbitrary custom properties via index signature

### `Relax`
```ts
T | Unwrap<T>
```

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

### `ToPrimitiveTypeName`
```ts
T extends PrimitiveTypeMap[infer U extends keyof PrimitiveTypeMap] ? U : never
```

### `Converter`
Unidirectional converter from one unit to another.
```ts
(input: TInput) => TOutput
```

### `BidirectionalConverter`
Bidirectional converter with forward and reverse transformations.

### `RelaxedConverter`
A converter that accepts the branded input type but returns
unwrapped output. This eliminates the need to cast return values
to branded types inside converter functions, while preserving
full autocompletion on the input parameter.

Since `Tagged<T, ...> extends T`, strict converters returning branded
types are also assignable to this type.
```ts
(input: TInput) => Unwrap<TOutput>
```

### `RelaxedBidirectionalConverter`
A bidirectional converter with relaxed (unwrapped) output types.
Input remains branded for full autocompletion.

### `Formatter`
Formatter converts a format-tagged value to a string representation.
```ts
(input: TInput) => string
```

### `Parser`
Parser converts a string into a format-tagged value with validation.
```ts
(input: string) => TOutput
```

### `FormatterParser`
Paired formatter/parser for round-trip format transformations.

### `UnitRegistry`
Registry for managing and composing unit converters

### `UnitMap`
Type for unit-based conversion accessors
Provides the shape: registry.Celsius.to.Fahrenheit(value)
Only allows conversions that have been registered
```ts
{ [FU in FromUnits<Edges> as UnitsFor<FU>]: UnitAccessor<FU, Edges> }
```

### `UnitAccessor`
Type for unit accessor with metadata and conversion methods
Can be called as a function to create branded unit values
```ts
{ (args: InferCallableArgs<From>): From; to: { [To in ToUnitsFor<Edges, From> as UnitsFor<To>]: (value: Relax<From>) => To }; addMetadata: any; register: any } & UnitsOf<From>
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
