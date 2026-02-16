/**
 * Core type branding utilities for unit and format safety
 * @packageDocumentation
 */

import type { GetTagMetadata, Simplify, Tagged, UnwrapTagged } from 'type-fest';

export const UNITS: unique symbol = Symbol('UNITS');

export const DEFINITION: unique symbol = Symbol('DEFINITION');

/**
 * Resolve a branded unit type from a `TypedMetadata` object.
 *
 * For primitive metadata (where `type` is a name string like `'number'`),
 * maps back through `PrimitiveTypeMap` to recover the base primitive.
 * For non-primitive metadata (enum, class, record, tuple), uses `type` directly.
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
        ? WithUnits<TypeField, M>
        : never
    : never;

/**
 * Brand a value with a unit identifier for compile-time unit safety.
 *
 * @template T - Base type (e.g., number, bigint, enum, class)
 * @template M - Metadata type (must extend BaseMetadata with required name property)
 *
 * @example
 * ```typescript
 * const Celsius = { name: 'Celsius' as const, symbol: '°C' } satisfies BaseMetadata;
 * type Celsius = WithUnits<number, typeof Celsius>;
 * const temp: Celsius = 25 as Celsius;
 * ```
 */
export type WithUnits<T extends SupportedType, M extends BaseMetadata = TypedMetadata<T>> = Tagged<
  T,
  typeof UNITS,
  M
>;

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

export type ToPrimitiveTypeName<T> = T extends PrimitiveTypeMap[infer U extends
  keyof PrimitiveTypeMap]
  ? U
  : never;

export type OptionalWithUnits<T extends SupportedType, M extends BaseMetadata = BaseMetadata> =
  | T
  | WithUnits<T, M>;

export type Unwrap<T> = T extends WithUnits<SupportedType, any> ? UnwrapTagged<T> : T;

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

export type UnitsOf<T extends WithUnits<SupportedType, BaseMetadata>> = GetTagMetadata<
  T,
  typeof UNITS
>;

export type NameFor<T extends WithUnits<SupportedType, BaseMetadata>> =
  GetTagMetadata<T, typeof UNITS> extends {
    name: infer N extends string;
  }
    ? N
    : string;

/** Alias for NameFor - returns the unit name type */
export type UnitsFor<T extends WithUnits<SupportedType, BaseMetadata>> = NameFor<T>;

/** Extract metadata from a WithUnits type */
export type MetadataOf<T extends WithUnits<SupportedType, BaseMetadata>> =
  GetTagMetadata<T, typeof UNITS> extends infer M ? M : BaseMetadata;

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
