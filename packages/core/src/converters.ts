/**
 * Type-safe converter function signatures
 * @packageDocumentation
 */

import type { Primitive, UnwrapTagged } from 'type-fest';

import type { PrimitiveType, Unwrap, WithUnits, Relax as BaseRelax } from './types';

/**
 * Unidirectional converter from one unit to another.
 *
 * @template TInput - Source unit-tagged type
 * @template TOutput - Destination unit-tagged type
 *
 * @param input - Value tagged with source unit
 * @returns Value tagged with destination unit
 *
 * @remarks
 * - Must be a pure function (no side effects)
 * - Should be deterministic (same input → same output)
 * - Document precision loss if applicable
 *
 * @example
 * ```typescript
 * const c2f: Converter<Celsius, Fahrenheit> = (c) =>
 *   ((c * 9/5) + 32) as Fahrenheit;
 * ```
 */
export type Converter<
  TInput extends WithUnits<PrimitiveType, string>,
  TOutput extends WithUnits<PrimitiveType, string>
> = (input: TInput) => TOutput;

export type RelaxConverter<ConverterType> =
  ConverterType extends Converter<infer A, infer B>
    ? (input: BaseRelax<A>) => BaseRelax<B>
    : (input: PrimitiveType) => PrimitiveType;

export type Relax<
  T extends PrimitiveType | Converter<any, any> | BidirectionalConverter<any, any>
> = T extends PrimitiveType
  ? BaseRelax<T>
  : T extends Converter<infer A, infer B>
    ? RelaxConverter<T>
    : RelaxBidirectionalConverter<T>;

/**
 * Bidirectional converter with forward and reverse transformations.
 *
 * @template TInput - First unit type
 * @template TOutput - Second unit type
 *
 * @property to - Forward converter (TInput → TOutput)
 * @property from - Reverse converter (TOutput → TInput)
 *
 * @remarks
 * - Round-trip conversions should preserve value within acceptable tolerance
 * - Both converters must be deterministic
 * - Use when both conversion directions are commonly needed
 *
 * @example
 * ```typescript
 * const meterKilometer: BidirectionalConverter<Meters, Kilometers> = {
 *   to: (m) => (m / 1000) as Kilometers,
 *   from: (km) => (km * 1000) as Meters
 * };
 * ```
 */
export type BidirectionalConverter<
  TInput extends WithUnits<PrimitiveType, string>,
  TOutput extends WithUnits<PrimitiveType, string>
> = {
  to: Converter<TInput, TOutput>;
  from: Converter<TOutput, TInput>;
};

export type RelaxBidirectionalConverter<ConverterType> =
  ConverterType extends BidirectionalConverter<infer A, infer B>
    ? {
        to: (input: Unwrap<A> | A) => Unwrap<B> | B;
        from: (input: Unwrap<B> | B) => Unwrap<A> | A;
      }
    : {
        to: (input: PrimitiveType) => PrimitiveType;
        from: (input: PrimitiveType) => PrimitiveType;
      };
