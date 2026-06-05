# Configuration

## BaseMetadata

Base metadata type that all unit metadata must extend.
Requires a `name` property and allows arbitrary additional properties.

`name` is the registry key — it must be a string literal (`as const`) so
that the type-level accessor map (`UnitMap`) can index by it. At runtime it
is also the adjacency-map key used for BFS path finding, so names must be
unique within a registry.

### Properties

#### name

Unique identifier for the unit (replaces tag)

**Type:** `string`

**Required:** yes

### Use when
- Defining metadata for a unit that only needs a name and optional display fields (symbol, abbreviation, description). For units where the base type matters in conversions, use `TypedMetadata<T>`.

## TypedMetadata

Metadata type for units with explicit type information.

For primitive types, `type` is the type name string (e.g., `'number'`).
For non-primitive types, `type` IS the actual value:
- Enum: the enum object itself
- Class: the class constructor
- Record: the schema object `{ x: 'number', y: 'string' }`
- Tuple: the tuple schema array `['number', 'string']`

### Use when
- You want `WithTypedUnits<M>` to automatically resolve the correct base type from the metadata, avoiding the need to specify it manually.

## UnitMetadata

Display and descriptive metadata that can be attached to units in the registry.

Supports common properties like abbreviation, format template, description,
and symbol, plus an index signature for arbitrary custom fields.

`UnitMetadata` is the internal store type used by `ConverterRegistryImpl`.
Access registered metadata via the unit accessor:
`registry.Celsius.symbol`, `registry.Celsius.abbreviation`, etc.

### Properties

#### abbreviation

Short abbreviation for the unit (e.g., "°C", "m", "kg")

**Type:** `string`

#### format

Format string for displaying values (e.g., "${value}°C")

**Type:** `string`

#### description

Human-readable description of the unit

**Type:** `string`

#### symbol

Symbol representation of the unit

**Type:** `string`

### Use when
- You want to attach human-readable labels or display hints to a unit so consumers can render values without hard-coding strings.