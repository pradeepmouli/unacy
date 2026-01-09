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
 *
 * @example
 * ```typescript
 * type Celsius = WithUnits<number, 'Celsius'>;
 * const temp: Celsius = 25 as Celsius;
 * ```
 */
export type WithUnits<T extends PrimitiveType, U extends string> = Tagged<T, typeof UNITS, U>;

export type WithDefinition<
  T extends PrimitiveType,
  U extends string,
  D extends UnitDefinition<T, U, unknown, any>
> = Tagged<WithUnits<T, U>, typeof DEFINITION, D>;

export type PrimitiveType = string | number | boolean | bigint;

export type PrimitiveTypeMap = {
  string: string;
  number: number;
  boolean: boolean;
  bigint: bigint;
};

export type ToPrimitiveType<T extends keyof PrimitiveTypeMap> = PrimitiveTypeMap[T];

export type ToPrimitiveTypeName<T extends PrimitiveType> =
  T extends ToPrimitiveType<infer U> ? U : never;

export type OptionalWithUnits<T extends PrimitiveType, U extends string> = T | WithUnits<T, U>;

export type Unwrap<T> = T extends WithUnits<infer U, string> ? U : T;

export type Relax<T> = Unwrap<T> | T;

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

export type UnitsOf<T extends WithUnits<PrimitiveType, string>> = GetTagMetadata<T, typeof UNITS>;

export type UnitsFor<T extends WithUnits<PrimitiveType, string>> =
  T extends WithUnits<infer A, infer N extends string> ? N : UnitsOf<T>;
export type UnitDefinition<T extends PrimitiveType, U, A, F extends string = never> = {
  type: ToPrimitiveTypeName<T>;
  name: U;
  abbreviation?: A;
  format?: F;
};
