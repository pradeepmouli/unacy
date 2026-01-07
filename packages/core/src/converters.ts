/**
 * Type-safe converter function signatures
 * @packageDocumentation
 */

import type { WithUnits } from './types';

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
  TInput extends WithUnits<unknown, string>,
  TOutput extends WithUnits<unknown, string>
> = (input: TInput) => TOutput;

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
  TInput extends WithUnits<unknown, string>,
  TOutput extends WithUnits<unknown, string>
> = {
  to: Converter<TInput, TOutput>;
  from: Converter<TOutput, TInput>;
};
