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

export const UNITS: unique symbol = Symbol('UNITS');

export const DEFINITION: unique symbol = Symbol('DEFINITION');

/**
 * Resolve a schema/constructor/enum type to its runtime value type.
 *
 * - **Tuple schemas** → `InferFromTupleSchema` (`['number', 'string']` → `[number, string]`)
 * - **Class constructors** → `InstanceType` (constructor → instance)
 * - **Record schemas** → `InferFromRecordSchema` (`{ x: 'number' }` → `{ x: number }`)
 * - **Enum objects** → `T[keyof T]` (enum value type)
 * - **Primitives** → passed through unchanged
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
 * @template T - Base type (e.g., number, bigint, record, tuple, class instance)
 * @template M - Metadata type (must extend BaseMetadata with required name property)
 *
 * @example
 * ```typescript
 * const Celsius = { name: 'Celsius' as const, symbol: '°C' } satisfies BaseMetadata;
 * type Celsius = WithUnits<number, typeof Celsius>;
 * const temp: Celsius = 25 as Celsius;
 * ```
 */
export type WithUnits<T, M extends BaseMetadata = BaseMetadata> = Tagged<T, typeof UNITS, M>;

/** Primitive JavaScript types that can be used as unit base types. */
export type PrimitiveType = number | string | boolean | bigint;

/**
 * A TypeScript enum object at runtime — an object whose values are all
 * strings (string enum) or all numbers (numeric enum).
 * Mixed enums (both string and number values) are rejected at validation.
 */
export type EnumType = Record<string, string | number>;

/**
 * A class constructor (including abstract classes) that can serve as a
 * unit's type identity. At runtime, the constructor itself is stored
 * in the metadata `type` field.
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
 * ```
 */
export type RecordSchema = { [key: string]: RecordSchemaValue };

/**
 * A schema describing a tuple as an array of primitive type name strings.
 * Supports optional (`'number?'`) and rest (`'...number'`) modifiers.
 *
 * @example
 * ```typescript
 * const RGBSchema = ['number', 'number', 'number'] as const satisfies TupleSchema;
 * ```
 */
export type TupleSchema = readonly string[];

/**
 * Union of all types that can be used as a unit's base type.
 * Includes primitives and non-primitive categories (enum, class, record, tuple).
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
 */
export type Relax<T> = T | Unwrap<T>;
/**
 * Brand a value with a format identifier for compile-time format safety.
 *
 * @template T - Base type (e.g., Date, number, string)
 * @template F - Format identifier (e.g., 'ISO8601', 'UnixTimestamp')
 *
 * @example
 * ```typescript
 * type ISO8601 = WithFormat<Date, 'ISO8601'>;
 * const date: ISO8601 = new Date() as ISO8601;
 * ```
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
 * @example
 * ```typescript
 * const Celsius = {
 *   name: 'Celsius' as const,
 *   symbol: '°C',
 *   description: 'Temperature in Celsius'
 * } satisfies BaseMetadata;
 * ```
 */
export type BaseMetadata = {
  /** Unique identifier for the unit (replaces tag) */
  name: string;
};

/**
 * Metadata type for units with type information.
 *
 * For primitive types, `type` is the type name string (e.g., `'number'`).
 * For non-primitive types, `type` IS the actual value:
 * - Enum: the enum object itself
 * - Class: the class constructor
 * - Record: the schema object `{ x: 'number', y: 'string' }`
 * - Tuple: the tuple schema array `['number', 'string']`
 */
export type TypedMetadata<T extends SupportedType> = Simplify<{
  name: string;
  type: T extends PrimitiveType ? ToPrimitiveTypeName<T> : T;
}>;

/**
 * Metadata that can be attached to units in the registry
 * Supports common properties like abbreviation, format, description,
 * and allows arbitrary custom properties via index signature
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
