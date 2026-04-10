# Functions

## registry

### `createRegistry`
Create a new converter registry
```ts
createRegistry<Edges>(): UnitRegistry<Edges extends readonly E[] ? E[] : never> & UnitMap<Edges>
```
**Returns:** `UnitRegistry<Edges extends readonly E[] ? E[] : never> & UnitMap<Edges>` — Empty converter registry with unit-based accessors
```typescript
type Celsius = WithUnits<PrimitiveType, 'Celsius'>;
type Fahrenheit = WithUnits<PrimitiveType, 'Fahrenheit'>;
type Meters = WithUnits<PrimitiveType, 'meters'>;
type Kilometers = WithUnits<PrimitiveType, 'kilometers'>;

// Without pre-declared units
const registry = createRegistry()
  .register('Celsius', 'Fahrenheit', (c: Celsius) => ((c * 9/5) + 32) as Fahrenheit);

// With pre-declared edges (for unit accessor registration before converters exist)
const registry2 = createRegistry<[Edge<'meters', 'kilometers'>]>()
  .meters.register('kilometers', (m) => (m / 1000) as Kilometers);

const temp: Celsius = 25 as Celsius;
const fahrenheit = registry.Celsius.to.Fahrenheit(temp);
console.log(fahrenheit); // 77
```

## validation

### `createParserWithSchema`
Create a parser with Zod schema validation.
```ts
createParserWithSchema<F, T>(schema: any, format: F): Parser<WithFormat<T, F>>
```
**Parameters:**
- `schema: any` — Zod schema for validation
- `format: F` — Format identifier string
**Returns:** `Parser<WithFormat<T, F>>` — Parser function that validates and tags values
```typescript
const parseHex = createParserWithSchema(
  z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  'HexColor'
);
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
```ts
detectMetadataKind(meta: unknown): "primitive" | "enum" | "class" | "tuple" | "record" | "unknown"
```
**Parameters:**
- `meta: unknown` — Metadata object to categorise
**Returns:** `"primitive" | "enum" | "class" | "tuple" | "record" | "unknown"` — The detected kind string
