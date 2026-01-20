/**
 * Core type branding utilities for unit and format safety
 * @packageDocumentation
 */

import type { GetTagMetadata, Simplify, Tagged, UnwrapTagged } from 'type-fest';

export const UNITS: unique symbol = Symbol('UNITS');

export const DEFINITION: unique symbol = Symbol('DEFINITION');

/**
 * Extract the name property from a metadata type
 * @internal
 */
type ExtractName<M extends BaseMetadata> = M extends { name: infer N extends string } ? N : string;

export type WithTypedUnits<M extends TypedMetadata<any>> = WithUnits<ToPrimitiveType<M['type']>, M>;

/**
 * Brand a value with a unit identifier for compile-time unit safety.
 *
 * @template T - Base type (e.g., number, bigint)
 * @template M - Metadata type (must extend BaseMetadata with required name property)
 *
 * @example
 * ```typescript
 * const Celsius = { name: 'Celsius' as const, symbol: '°C' } satisfies BaseMetadata;
 * type Celsius = WithUnits<number, typeof Celsius>;
 * const temp: Celsius = 25 as Celsius;
 * ```
 */
export type WithUnits<T extends PrimitiveType, M extends BaseMetadata = TypedMetadata<T>> = Tagged<
  T,
  typeof UNITS,
  M
>;

export type PrimitiveType = number | string | boolean | bigint;

export type PrimitiveTypeMap = {
  string: string;
  number: number;
  boolean: boolean;
  bigint: bigint;
};

export type ToPrimitiveType<T extends keyof PrimitiveTypeMap> = PrimitiveTypeMap[T];

export type ToPrimitiveTypeName<T extends PrimitiveType> =
  T extends ToPrimitiveType<infer U> ? U : never;

export type OptionalWithUnits<T extends PrimitiveType, M extends BaseMetadata = BaseMetadata> =
  | T
  | WithUnits<T, M>;
``;
export type Unwrap<T> = T extends WithUnits<PrimitiveType, any> ? UnwrapTagged<T> : T;

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

export type UnitsOf<T extends WithUnits<PrimitiveType, BaseMetadata>> = GetTagMetadata<
  T,
  typeof UNITS
>;

export type NameFor<T extends WithUnits<PrimitiveType, BaseMetadata>> =
  T extends WithUnits<infer A, infer M extends BaseMetadata> ? ExtractName<M> : never;

/** Alias for NameFor - returns the unit name type */
export type UnitsFor<T extends WithUnits<PrimitiveType, BaseMetadata>> = NameFor<T>;

/** Extract metadata from a WithUnits type */
export type MetadataOf<T extends WithUnits<PrimitiveType, BaseMetadata>> =
  T extends WithUnits<any, infer M extends BaseMetadata> ? M : BaseMetadata;
export type UnitDefinition<T extends PrimitiveType, U, A, F extends string = never> = {
  type: ToPrimitiveTypeName<T>;
  name: U;
  abbreviation?: A;
  format?: F;
};

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

export type TypedMetadata<T extends PrimitiveType = number> = Simplify<{
  name: string;
  /** Data type name (e.g., "number", "string") */
  type: ToPrimitiveTypeName<T>;
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
