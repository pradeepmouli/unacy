/**
 * Core type branding utilities for unit and format safety
 * @packageDocumentation
 */

import type { GetTagMetadata, Tagged } from 'type-fest';

export const UNITS: unique symbol = Symbol('UNITS');

export const DEFINITION: unique symbol = Symbol('DEFINITION');
/**
 * Brand a value with a unit identifier for compile-time unit safety.
 *
 * @template T - Base type (e.g., number, bigint)
 * @template U - Unit identifier (e.g., 'Celsius', 'meters')
 * @template M - Metadata type (must extend BaseMetadata with required name property)
 *
 * @example
 * ```typescript
 * type Celsius = WithUnits<number, 'Celsius'>;
 * const temp: Celsius = 25 as Celsius;
 * ```
 *
 * @example With metadata
 * ```typescript
 * const CelsiusMetadata = { name: 'Celsius' as const, symbol: '°C' } satisfies BaseMetadata;
 * type CelsiusWithMeta = WithUnits<number, 'Celsius', typeof CelsiusMetadata>;
 * ```
 */
export type WithUnits<
  T extends PrimitiveType = number,
  U extends string = string,
  M extends BaseMetadata = BaseMetadata
> = Tagged<T, typeof UNITS, U>;

export type WithDefinition<
  T extends PrimitiveType,
  U extends string,
  D extends UnitDefinition<T, U, unknown, any>,
  M extends BaseMetadata = BaseMetadata
> = Tagged<WithUnits<T, U, M>, typeof DEFINITION, D>;

export type PrimitiveType = number;

export type PrimitiveTypeMap = {
  string: string;
  number: number;
  boolean: boolean;
  bigint: bigint;
};

export type ToPrimitiveType<T extends keyof PrimitiveTypeMap> = PrimitiveTypeMap[T];

export type ToPrimitiveTypeName<T extends PrimitiveType> =
  T extends ToPrimitiveType<infer U> ? U : never;

export type OptionalWithUnits<
  T extends PrimitiveType,
  U extends string,
  M extends BaseMetadata = BaseMetadata
> = T | WithUnits<T, U, M>;

export type Unwrap<T> = T extends WithUnits<infer U, string, BaseMetadata> ? U : T;

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

export type UnitsOf<T extends WithUnits<PrimitiveType, string, BaseMetadata>> = GetTagMetadata<
  T,
  typeof UNITS
>;

export type UnitsFor<T extends WithUnits<PrimitiveType, string, BaseMetadata>> =
  T extends WithUnits<infer A, infer N extends string, BaseMetadata> ? N : UnitsOf<T>;
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
} & Record<string, unknown>;

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
