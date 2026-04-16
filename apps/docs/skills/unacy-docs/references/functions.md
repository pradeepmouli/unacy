# Functions

## Registry

### `createRegistry`
Create a new, empty converter registry.

The factory entry point for unacy. Returns an empty `UnitRegistry` that can
be grown incrementally via chained `.register()` calls. Each call produces a
new registry instance with an expanded type signature reflecting the new edge.
```ts
createRegistry<Edges>(): UnitRegistry<Edges extends readonly E[] ? E[] : never> & UnitMap<Edges>
```
**Returns:** `UnitRegistry<Edges extends readonly E[] ? E[] : never> & UnitMap<Edges>` — Empty converter registry with full type-safe unit accessor support
**See:** - UnitRegistry
 - UnitMap
```typescript
import { createRegistry, type WithUnits, type BaseMetadata } from 'unacy';

const CelsiusMeta = { name: 'Celsius' as const, symbol: '°C' } satisfies BaseMetadata;
const FahrenheitMeta = { name: 'Fahrenheit' as const, symbol: '°F' } satisfies BaseMetadata;
const KelvinMeta = { name: 'Kelvin' as const, symbol: 'K' } satisfies BaseMetadata;

type Celsius = WithUnits<number, typeof CelsiusMeta>;
type Fahrenheit = WithUnits<number, typeof FahrenheitMeta>;
type Kelvin = WithUnits<number, typeof KelvinMeta>;

const registry = createRegistry()
  .register(CelsiusMeta, FahrenheitMeta, { to: c => (c * 9/5) + 32, from: f => (f - 32) * 5/9 })
  .register(CelsiusMeta, KelvinMeta, c => c + 273.15)
  .allow(KelvinMeta, FahrenheitMeta); // lift BFS-composed path into types

const f = registry.Celsius.to.Fahrenheit(25 as Celsius); // 77
const k = registry.Celsius.to.Kelvin(0 as Celsius);      // 273.15
```

## Validation

### `createParserWithSchema`
Create a `Parser<WithFormat<T, F>>` backed by a Zod-compatible schema.

Wraps a Zod (or Zod-compatible) schema's `.parse()` method to produce a
typed `Parser`. On schema rejection, the Zod error message is re-thrown
as a `ParseError` so callers always receive a consistent error type.
```ts
createParserWithSchema<F, T>(schema: any, format: F): Parser<WithFormat<T, F>>
```
**Parameters:**
- `schema: any` — Any object with a `.parse(input: string)` method (Zod schema)
- `format: F` — Format identifier used in thrown `ParseError` instances
**Returns:** `Parser<WithFormat<T, F>>` — Parser function that validates and tags values as `WithFormat<T, F>`
**Throws:** When `schema.parse` rejects the input
**See:** - Parser
 - ParseError
```typescript
import { z } from 'zod';
import { createParserWithSchema } from 'unacy';

type HexColor = WithFormat<string, 'HexColor'>;
const parseHex = createParserWithSchema<'HexColor', string>(
  z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  'HexColor'
);

parseHex('#ff0000'); // OK → tagged as HexColor
parseHex('red');     // throws ParseError
```

### `validateEnum`
Validate that a runtime value is a valid TypeScript enum object.

Accepts numeric enums (with reverse-mapped keys filtered out) and
string enums. Rejects empty objects and mixed enums whose forward
entries contain both string and number values.
```ts
validateEnum(value: unknown): value is EnumType
```
**Parameters:**
- `value: unknown` — The value to validate
**Returns:** `value is EnumType` — `true` if `value` is a valid `EnumType`
**Throws:** If the enum contains both numeric and string members
```typescript
enum LogLevel { DEBUG = 0, INFO = 1 }
validateEnum(LogLevel); // true
validateEnum({}); // false
```

### `validateClass`
Validate that a runtime value is a valid class constructor.

Checks that the value is a function with a `prototype` property.
Arrow functions and bound functions without prototypes are rejected.
```ts
validateClass(value: unknown): value is ClassType
```
**Parameters:**
- `value: unknown` — The value to validate
**Returns:** `value is ClassType` — `true` if `value` is a valid `ClassType` constructor

### `validateRecordSchema`
Validate that a runtime value is a valid record schema.

A valid record schema is a plain object whose leaf values are primitive
type name strings (`'number'`, `'string'`, `'boolean'`, `'bigint'`) or
nested record schema objects. Empty objects are accepted.
```ts
validateRecordSchema(value: unknown, visited: Set<unknown>): value is RecordSchema
```
**Parameters:**
- `value: unknown` — The value to validate
- `visited: Set<unknown>` — default: `...` — Internal set for circular reference detection
**Returns:** `value is RecordSchema` — `true` if `value` is a valid `RecordSchema`
**Throws:** If circular references or invalid type names are found
```typescript
validateRecordSchema({ x: 'number', y: 'number' }); // true
validateRecordSchema({ pos: { x: 'number' } }); // true (nested)
```

### `validateTupleSchema`
Validate that a runtime value is a valid tuple schema.

A valid tuple schema is an array of primitive type name strings,
optionally annotated with `?` (optional) or `...` (rest) modifiers.
Empty arrays are accepted.
```ts
validateTupleSchema(value: unknown): value is TupleSchema
```
**Parameters:**
- `value: unknown` — The value to validate
**Returns:** `value is TupleSchema` — `true` if `value` is a valid `TupleSchema`
**Throws:** If elements are not strings or contain invalid type names
```typescript
validateTupleSchema(['number', 'number', 'number']); // true
validateTupleSchema(['string', 'number?']); // true (optional)
validateTupleSchema(['number', '...string']); // true (rest)
```

### `isEnumMetadata`
Type guard: returns `true` when `meta.type` is an enum object.

Distinguishes enums from record schemas by first checking whether the
value passes `validateRecordSchema`; if it does, the metadata is
classified as a record, not an enum.
```ts
isEnumMetadata(meta: unknown): meta is { name: string; type: EnumType }
```
**Parameters:**
- `meta: unknown` — Metadata object to inspect
**Returns:** `meta is { name: string; type: EnumType }`

### `isClassMetadata`
Type guard: returns `true` when `meta.type` is a class constructor.
```ts
isClassMetadata(meta: unknown): meta is { name: string; type: ClassType }
```
**Parameters:**
- `meta: unknown` — Metadata object to inspect
**Returns:** `meta is { name: string; type: ClassType }`

### `isRecordMetadata`
Type guard: returns `true` when `meta.type` is a record schema object.
```ts
isRecordMetadata(meta: unknown): meta is { name: string; type: RecordSchema }
```
**Parameters:**
- `meta: unknown` — Metadata object to inspect
**Returns:** `meta is { name: string; type: RecordSchema }`

### `isTupleMetadata`
Type guard: returns `true` when `meta.type` is a tuple schema array.
```ts
isTupleMetadata(meta: unknown): meta is { name: string; type: TupleSchema }
```
**Parameters:**
- `meta: unknown` — Metadata object to inspect
**Returns:** `meta is { name: string; type: TupleSchema }`

### `detectMetadataKind`
Detect the kind of a metadata object by inspecting its `type` field.

Resolution priority: `primitive` → `class` → `tuple` → `record` → `enum`.
Returns `'unknown'` when the value is not a recognised metadata shape.

Resolution priority order: `primitive` → `class` → `tuple` → `record` → `enum` → `unknown`.
This ordering is important: a class constructor would otherwise match the object check,
and a tuple schema (array) would match the record check, so the dispatcher checks
the more specific types first.
```ts
detectMetadataKind(meta: unknown): "primitive" | "enum" | "class" | "tuple" | "record" | "unknown"
```
**Parameters:**
- `meta: unknown` — Metadata object to categorise
**Returns:** `"primitive" | "enum" | "class" | "tuple" | "record" | "unknown"` — The detected kind string
```typescript
detectMetadataKind({ name: 'Celsius', type: 'number' }); // 'primitive'
detectMetadataKind({ name: 'Point', type: { x: 'number', y: 'number' } }); // 'record'
detectMetadataKind({ name: 'RGB', type: ['number', 'number', 'number'] }); // 'tuple'
detectMetadataKind({ name: 'Direction', type: Direction }); // 'enum' (if Direction is an enum)
```
