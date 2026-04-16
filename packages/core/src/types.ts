/**
 * Core type branding utilities for unit and format safety
 * @packageDocumentation
 */

import type { GetTagMetadata, Simplify, Tagged, UnwrapTagged } from 'type-fest';

/**
 * Constraint type for any tagged unit value.
 * `Tagged<unknown, K, V>` resolves to `Tag<K, V>` (since `unknown & X = X`),
 * giving us the `Tag` constraint without importing the internal `Tag` type.
 */
type AnyTaggedUnit = Tagged<unknown, typeof UNITS, any>;

/**
 * Internal phantom-type brand key used to tag values with unit metadata.
 * Consumers should not use this symbol directly — use `WithUnits<T, M>` instead.
 *
 * @category Branding
 * @internal
 */
export const UNITS: unique symbol = Symbol('UNITS');

/**
 * Reserved symbol for future definition attachment on unit metadata.
 * Not used in the current public API.
 *
 * @category Branding
 * @internal
 */
export const DEFINITION: unique symbol = Symbol('DEFINITION');

/**
 * Resolve a schema/constructor/enum type to its runtime value type.
 *
 * - **Tuple schemas** → `InferFromTupleSchema` (`['number', 'string']` → `[number, string]`)
 * - **Class constructors** → `InstanceType` (constructor → instance)
 * - **Record schemas** → `InferFromRecordSchema` (`{ x: 'number' }` → `{ x: number }`)
 * - **Enum objects** → `T[keyof T]` (enum value type)
 * - **Primitives** → passed through unchanged
 *
 * @category Type Utilities
 */
export type ResolveValueType<T> = T extends readonly string[]
  ? InferFromTupleSchema<T>
  : T extends ClassType
    ? InstanceType<T>
    : T extends RecordSchema
      ? T[keyof T] extends keyof PrimitiveTypeMap | RecordSchema
        ? InferFromRecordSchema<T>
        : T[keyof T]
      : T extends EnumType
        ? T[keyof T]
        : T;

/**
 * Resolve a branded unit type from a `TypedMetadata` object.
 *
 * For primitive metadata (where `type` is a name string like `'number'`),
 * maps back through `PrimitiveTypeMap` to recover the base primitive.
 * For non-primitive metadata (enum, class, record, tuple), resolves to
 * the actual runtime value type via `ResolveValueType`.
 *
 * @template M - A `TypedMetadata` instance (e.g., `typeof CelsiusMetadata`)
 *
 * @example
 * ```typescript
 * const CelsiusMeta = { name: 'Celsius', type: 'number' } as const;
 * type Celsius = WithTypedUnits<typeof CelsiusMeta>;
 * // Celsius = Tagged<number, UNITS, typeof CelsiusMeta>
 * ```
 *
 * @useWhen You have a metadata object with an explicit `type` field and want
 * the branded type to reflect the correct base type automatically.
 *
 * @avoidWhen You only have a `BaseMetadata` object without a `type` field — use
 * `WithUnits<T, M>` directly, specifying the base type explicitly.
 *
 * @pitfalls
 * NEVER pass `any` as the type parameter — `WithTypedUnits<any>` widens to
 * `WithUnits<any, any>`, bypassing all type checks.
 *
 * @category Branding
 */
export type WithTypedUnits<M extends TypedMetadata<any>> = unknown extends M
  ? WithUnits<any, any> // Handle M = any
  : M extends { name: string; type: infer TypeField }
    ? TypeField extends keyof PrimitiveTypeMap
      ? WithUnits<PrimitiveTypeMap[TypeField], M>
      : TypeField extends SupportedType
        ? WithUnits<ResolveValueType<TypeField>, M>
        : never
    : never;

/**
 * Brand a value with a unit identifier for compile-time unit safety.
 *
 * The branding is purely a compile-time phantom — at runtime, values are plain
 * `T` (number, string, etc.) with zero overhead. Branded values extend their
 * base type, so they are assignable to plain `T` but not vice versa.
 *
 * @template T - Base type (e.g., number, bigint, record, tuple, class instance)
 * @template M - Metadata type (must extend BaseMetadata with required name property)
 *
 * @example
 * ```typescript
 * const CelsiusMeta = { name: 'Celsius' as const, symbol: '°C' } satisfies BaseMetadata;
 * type Celsius = WithUnits<number, typeof CelsiusMeta>;
 * const temp: Celsius = 25 as Celsius;
 *
 * // Celsius is assignable to number, but number is not assignable to Celsius
 * const raw: number = temp; // OK
 * const invalid: Celsius = raw; // TS error
 * ```
 *
 * @useWhen You need a branded unit type and your metadata does not have a `type`
 * field (or you want to specify the base type explicitly).
 *
 * @avoidWhen Your metadata already carries a `type` field — prefer `WithTypedUnits<M>`
 * to let the compiler infer the correct base type automatically.
 *
 * @pitfalls
 * NEVER use `as` to cast a plain `number` to `WithUnits<number, M>` in
 * application code without validating the value first — the cast bypasses
 * every compile-time guarantee that `WithUnits` provides.
 *
 * NEVER assign a value of `WithUnits<number, CelsiusMetadata>` to a variable
 * typed `WithUnits<number, FahrenheitMetadata>` via `as` — the phantom types
 * become meaningless if the brand is forged at assignment sites.
 *
 * @category Branding
 * @see WithTypedUnits
 */
export type WithUnits<T, M extends BaseMetadata = BaseMetadata> = Tagged<T, typeof UNITS, M>;

/**
 * Primitive JavaScript types that can be used as unit base types.
 *
 * @remarks
 * Covers the four scalar primitive types that unacy supports as direct base
 * types for `WithUnits<T, M>`. Non-primitive base types (classes, enums,
 * records, tuples) are handled via `SupportedType`.
 *
 * @category Types
 */
export type PrimitiveType = number | string | boolean | bigint;

/**
 * A TypeScript enum object at runtime — an object whose values are all
 * strings (string enum) or all numbers (numeric enum).
 * Mixed enums (both string and number values) are rejected at validation.
 *
 * @remarks
 * TypeScript numeric enums produce reverse-mapped keys at runtime
 * (e.g., `{ DEBUG: 0, 0: 'DEBUG' }`). `validateEnum` filters those out
 * automatically — you do not need to handle them yourself.
 *
 * @pitfalls
 * NEVER use an empty object (`{}`) as an enum type — `validateEnum` rejects
 * it, and the registry will throw at registration time.
 *
 * NEVER mix numeric and string values in a single enum — unacy rejects mixed
 * enums at validation time because the value type would be ambiguous.
 *
 * @category Types
 */
export type EnumType = Record<string, string | number>;

/**
 * A class constructor (including abstract classes) that can serve as a
 * unit's type identity. At runtime, the constructor itself is stored
 * in the metadata `type` field.
 *
 * @remarks
 * When the registry detects a class-typed unit (via `isClassMetadata`), the
 * unit accessor's brand function calls `new Constructor(...args)` so that
 * `registry.MyUnit(arg1, arg2)` returns a properly constructed instance.
 *
 * @pitfalls
 * NEVER pass an arrow function or a bound function as a `ClassType` — they
 * lack a `prototype` property and will fail `validateClass` at registration.
 *
 * @category Types
 */
export type ClassType = abstract new (...args: any[]) => any;

/** A record schema value — either a primitive type name or a nested schema. */
export type RecordSchemaValue = string | RecordSchema;

/**
 * A schema describing an object shape. Keys are property names;
 * values are primitive type name strings (`'number'`, `'string'`, etc.)
 * or nested `RecordSchema` objects.
 *
 * @example
 * ```typescript
 * const PointSchema = { x: 'number', y: 'number' } satisfies RecordSchema;
 * const NestedSchema = { pos: { x: 'number', y: 'number' }, label: 'string' } satisfies RecordSchema;
 * ```
 *
 * @pitfalls
 * NEVER use a circular schema object — `validateRecordSchema` detects circular
 * references and throws, so the registry will refuse to register such a unit.
 *
 * NEVER use non-primitive type names as leaf values (e.g., `'Date'`) — only
 * `'number'`, `'string'`, `'boolean'`, and `'bigint'` are accepted.
 *
 * @category Types
 */
export type RecordSchema = { [key: string]: RecordSchemaValue };

/**
 * A schema describing a tuple as an array of primitive type name strings.
 * Supports optional (`'number?'`) and rest (`'...number'`) modifiers.
 *
 * @example
 * ```typescript
 * const RGBSchema = ['number', 'number', 'number'] as const satisfies TupleSchema;
 * const FlexSchema = ['string', 'number?', '...boolean'] as const satisfies TupleSchema;
 * ```
 *
 * @remarks
 * When the registry detects a tuple-typed unit (via `isTupleMetadata`), the
 * brand function collects spread arguments into an array. Pass each tuple
 * member as a separate argument: `registry.RGB(255, 128, 0)` instead of
 * `registry.RGB([255, 128, 0])`.
 *
 * @pitfalls
 * NEVER declare a rest element (`'...type'`) in a non-terminal position —
 * `validateTupleSchema` accepts it syntactically, but `InferFromTupleSchema`
 * only handles rest at the last position and returns `never` otherwise.
 *
 * @category Types
 */
export type TupleSchema = readonly string[];

/**
 * Union of all types that can be used as a unit's base type.
 * Includes primitives and non-primitive categories (enum, class, record, tuple).
 *
 * @remarks
 * `SupportedType` is the constraint on the `T` parameter of `WithUnits<T, M>`
 * and on the `type` field of `TypedMetadata<T>`. The registry uses
 * `detectMetadataKind` to dispatch on which member of the union is present.
 *
 * @category Types
 */
export type SupportedType = PrimitiveType | EnumType | ClassType | RecordSchema | TupleSchema;

export type PrimitiveTypeMap = {
  string: string;
  number: number;
  boolean: boolean;
  bigint: bigint;
};

/**
 * Map a primitive TypeScript type to its corresponding type name string.
 * For example, `number` → `'number'`, `string` → `'string'`, `boolean` → `'boolean'`, `bigint` → `'bigint'`.
 * Returns `never` for non-primitive types.
 */
export type ToPrimitiveTypeName<T> = T extends PrimitiveTypeMap[infer U extends
  keyof PrimitiveTypeMap]
  ? U
  : never;

export type OptionalWithUnits<T, M extends BaseMetadata = BaseMetadata> = T | WithUnits<T, M>;

export type Unwrap<T> = T extends AnyTaggedUnit ? UnwrapTagged<T> : T;

/**
 * Resolve the callable argument types from a branded unit type.
 *
 * Uses the metadata's `type` field (the original schema/constructor) to
 * determine the kind, then produces the appropriate parameter tuple:
 * - **Tuple schemas** → spread members: `['number', 'string']` → `[number, string]`
 * - **Class constructors** → spread constructor params: `ConstructorParameters<C>`
 * - **Record schemas** → single object arg: `[{ x: number; y: number }]`
 * - **Enum objects** → single value arg: `[LogLevel.WARN]`
 * - **Primitives** → single arg: `[number]`
 */
export type InferCallableArgs<From> = From extends AnyTaggedUnit
  ? GetTagMetadata<From, typeof UNITS> extends { type: infer TypeField }
    ? TypeField extends readonly string[]
      ? InferFromTupleSchema<TypeField>
      : TypeField extends ClassType
        ? ConstructorParameters<TypeField>
        : TypeField extends RecordSchema
          ? TypeField[keyof TypeField] extends keyof PrimitiveTypeMap | RecordSchema
            ? [InferFromRecordSchema<TypeField>]
            : [TypeField[keyof TypeField]]
          : TypeField extends EnumType
            ? [TypeField[keyof TypeField]]
            : [Unwrap<From>]
    : [Unwrap<From>]
  : [Unwrap<From>];

/**
 * Relax a branded unit type to accept either the branded form or its raw unwrapped value.
 * Useful for APIs that should accept both `WithUnits<T, M>` and plain `T` interchangeably.
 *
 * @remarks
 * Use `Relax<T>` in converter or utility signatures where callers may hold a
 * plain value (e.g., coming from a JSON payload) alongside properly branded
 * values. The type still communicates intent while remaining ergonomic.
 *
 * @example
 * ```typescript
 * function display(temp: Relax<Celsius>): string {
 *   return `${temp}°C`; // accepts both: Celsius brand or plain number
 * }
 * display(25);           // OK — plain number
 * display(25 as Celsius); // OK — branded
 * ```
 *
 * @useWhen Writing utility functions that wrap or log branded values and
 * should remain usable before the caller has set up a full registry.
 *
 * @avoidWhen Writing converter functions that must enforce the source brand —
 * use the explicit branded type (`Celsius`) to preserve the safety guarantee.
 *
 * @category Branding
 */
export type Relax<T> = T | Unwrap<T>;
/**
 * Brand a value with a format identifier for compile-time format safety.
 *
 * Analogous to `WithUnits<T, M>` but for format tags rather than unit
 * metadata. Ensures a formatted string, `Date`, or number cannot be
 * passed to a formatter/parser expecting a different format.
 *
 * @template T - Base type (e.g., Date, number, string)
 * @template F - Format identifier string literal (e.g., `'ISO8601'`, `'UnixTimestamp'`)
 *
 * @example
 * ```typescript
 * type ISO8601Date = WithFormat<Date, 'ISO8601'>;
 * type UnixTimestamp = WithFormat<number, 'UnixTimestamp'>;
 *
 * const parseISO: Parser<ISO8601Date> = (s) => new Date(s) as ISO8601Date;
 * const formatISO: Formatter<ISO8601Date> = (d) => d.toISOString();
 * ```
 *
 * @useWhen You need compile-time guarantees that a value has been validated
 * and tagged with a specific serialisation format before it can be formatted
 * or passed into format-aware APIs.
 *
 * @avoidWhen The value is plain and needs no format guarantee — use the bare
 * base type (`Date`, `number`, `string`) directly.
 *
 * @pitfalls
 * NEVER cast an unvalidated value to `WithFormat<T, F>` — use a `Parser`
 * that validates the input string first and only then tags the result.
 *
 * NEVER assume that round-tripping through `format` then `parse` is
 * lossless for all inputs — floating-point serialisation and timezone
 * handling can introduce discrepancies.
 *
 * @category Branding
 * @see Formatter
 * @see Parser
 * @see FormatterParser
 */
export type WithFormat<T, F extends string> = Tagged<T, typeof UNITS, F>;

export type UnitsOf<T> = T extends AnyTaggedUnit ? GetTagMetadata<T, typeof UNITS> : never;

export type NameFor<T> = T extends AnyTaggedUnit
  ? GetTagMetadata<T, typeof UNITS> extends { name: infer N extends string }
    ? N
    : string
  : string;

/** Alias for NameFor - returns the unit name type */
export type UnitsFor<T> = NameFor<T>;

/** Extract metadata from a WithUnits type */
export type MetadataOf<T> = T extends AnyTaggedUnit
  ? GetTagMetadata<T, typeof UNITS> extends infer M
    ? M
    : BaseMetadata
  : BaseMetadata;

/**
 * Base metadata type that all unit metadata must extend.
 * Requires a `name` property and allows arbitrary additional properties.
 *
 * @remarks
 * `name` is the registry key — it must be a string literal (`as const`) so
 * that the type-level accessor map (`UnitMap`) can index by it. At runtime it
 * is also the adjacency-map key used for BFS path finding, so names must be
 * unique within a registry.
 *
 * @example
 * ```typescript
 * const CelsiusMeta = {
 *   name: 'Celsius' as const,    // must be a literal
 *   symbol: '°C',
 *   description: 'Temperature in Celsius'
 * } satisfies BaseMetadata;
 * ```
 *
 * @useWhen Defining metadata for a unit that only needs a name and optional
 * display fields (symbol, abbreviation, description). For units where the
 * base type matters in conversions, use `TypedMetadata<T>`.
 *
 * @pitfalls
 * NEVER use a non-literal string for `name` (e.g., `name: string` instead of
 * `name: 'Celsius' as const`) — the registry key becomes `string` and the
 * compile-time accessor `registry.Celsius.to.Fahrenheit` stops resolving.
 *
 * NEVER reuse the same `name` value across two different unit objects in the
 * same registry — the second registration silently overwrites the first.
 *
 * @config
 * Additional properties (e.g., `symbol`, `abbreviation`, `description`) are
 * accessible as `registry.<UnitName>.<property>` after registration.
 *
 * @category Metadata
 */
export type BaseMetadata = {
  /** Unique identifier for the unit (replaces tag) */
  name: string;
};

/**
 * Metadata type for units with explicit type information.
 *
 * For primitive types, `type` is the type name string (e.g., `'number'`).
 * For non-primitive types, `type` IS the actual value:
 * - Enum: the enum object itself
 * - Class: the class constructor
 * - Record: the schema object `{ x: 'number', y: 'string' }`
 * - Tuple: the tuple schema array `['number', 'string']`
 *
 * @template T - The `SupportedType` that this metadata describes
 *
 * @example
 * ```typescript
 * // Primitive
 * const CelsiusMeta = { name: 'Celsius' as const, type: 'number' as const } satisfies TypedMetadata<number>;
 *
 * // Enum
 * enum Direction { North, South, East, West }
 * const DirectionMeta = { name: 'Direction' as const, type: Direction } satisfies TypedMetadata<typeof Direction>;
 *
 * // Record schema
 * const PointMeta = { name: 'Point' as const, type: { x: 'number', y: 'number' } as const } satisfies TypedMetadata<{ x: number; y: number }>;
 * ```
 *
 * @useWhen You want `WithTypedUnits<M>` to automatically resolve the correct
 * base type from the metadata, avoiding the need to specify it manually.
 *
 * @pitfalls
 * NEVER widen the `type` field to a general `string` or `object` — the type
 * inference chain from `TypedMetadata` → `WithTypedUnits` → `UnitAccessor`
 * depends on the literal or structural type being preserved at compile time.
 *
 * @config
 * Additional fields beyond `name` and `type` (e.g., `symbol`, `description`)
 * are permitted and accessible via the registry accessor.
 *
 * @category Metadata
 * @see WithTypedUnits
 */
export type TypedMetadata<T extends SupportedType> = Simplify<{
  name: string;
  type: T extends PrimitiveType ? ToPrimitiveTypeName<T> : T;
}>;

/**
 * Display and descriptive metadata that can be attached to units in the registry.
 *
 * Supports common properties like abbreviation, format template, description,
 * and symbol, plus an index signature for arbitrary custom fields.
 *
 * @remarks
 * `UnitMetadata` is the internal store type used by `ConverterRegistryImpl`.
 * Access registered metadata via the unit accessor:
 * `registry.Celsius.symbol`, `registry.Celsius.abbreviation`, etc.
 *
 * @example
 * ```typescript
 * const registry = createRegistry()
 *   .register({
 *     name: 'Celsius' as const,
 *     symbol: '°C',
 *     abbreviation: '°C',
 *     description: 'Degrees Celsius',
 *   });
 *
 * registry.Celsius.symbol;       // '°C'
 * registry.Celsius.description;  // 'Degrees Celsius'
 * ```
 *
 * @config
 * - `symbol` — SI / conventional symbol (e.g., `'°C'`, `'m'`, `'kg'`)
 * - `abbreviation` — short display abbreviation
 * - `format` — optional format template string
 * - `description` — human-readable description
 * - `[key: string]` — any additional custom fields
 *
 * @useWhen You want to attach human-readable labels or display hints to a
 * unit so consumers can render values without hard-coding strings.
 *
 * @category Metadata
 */
export interface UnitMetadata {
  /** Short abbreviation for the unit (e.g., "°C", "m", "kg") */
  abbreviation?: string;
  /** Format string for displaying values (e.g., "${value}°C") */
  format?: string;
  /** Human-readable description of the unit */
  description?: string;
  /** Symbol representation of the unit */
  symbol?: string;
  /** Allow arbitrary custom metadata properties */
  [key: string]: unknown;
}

// ============================================================================
// Type Inference Utilities
// ============================================================================

/**
 * Map type name strings to TypeScript primitive types.
 */
export type PrimitiveTypeFromName<T extends string> = T extends 'number'
  ? number
  : T extends 'string'
    ? string
    : T extends 'boolean'
      ? boolean
      : T extends 'bigint'
        ? bigint
        : never;

/**
 * Infer TypeScript type from a `RecordSchema`.
 * Recursively processes nested schemas.
 */
export type InferFromRecordSchema<S extends RecordSchema> = Simplify<{
  [K in keyof S]: S[K] extends string
    ? PrimitiveTypeFromName<S[K]>
    : S[K] extends RecordSchema
      ? InferFromRecordSchema<S[K]>
      : never;
}>;

/**
 * Infer TypeScript type from a `TupleSchema`.
 * Handles optional (`?`) and rest (`...`) elements.
 */
export type InferFromTupleSchema<T extends readonly string[]> = T extends readonly []
  ? []
  : T extends readonly [infer Head extends string, ...infer Rest extends readonly string[]]
    ? Head extends `...${infer Base}`
      ? Rest extends readonly []
        ? [...Array<PrimitiveTypeFromName<Base>>]
        : never
      : Head extends `${infer Base}?`
        ? [PrimitiveTypeFromName<Base>?, ...InferFromTupleSchema<Rest>]
        : [PrimitiveTypeFromName<Head>, ...InferFromTupleSchema<Rest>]
    : never;
