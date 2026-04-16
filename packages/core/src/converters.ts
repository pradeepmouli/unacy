/**
 * Type-safe converter function signatures
 * @packageDocumentation
 */

import type { PrimitiveType, Relax as BaseRelax, Unwrap } from './types.js';

/**
 * Unidirectional converter from one unit to another.
 *
 * A pure function that takes a value tagged with a source unit and returns a
 * value tagged with a destination unit. Converters are registered in the
 * `UnitRegistry` and composed automatically via BFS when no direct edge exists.
 *
 * @template TInput - Source unit-tagged type (e.g., `Celsius`)
 * @template TOutput - Destination unit-tagged type (e.g., `Fahrenheit`)
 *
 * @param input - Value tagged with source unit
 * @returns Value tagged with destination unit
 *
 * @remarks
 * - Must be a pure function (no side effects, no external state reads)
 * - Must be deterministic (same input always produces the same output)
 * - Float arithmetic on chained conversions accumulates rounding error;
 *   document precision characteristics in the function's JSDoc
 *
 * @example
 * ```typescript
 * const c2f: Converter<Celsius, Fahrenheit> = (c) => (c * 9/5) + 32;
 * const f2k: Converter<Fahrenheit, Kelvin> = (f) => ((f - 32) * 5/9) + 273.15;
 * ```
 *
 * @useWhen You need a named, reusable conversion function to pass to
 * `registry.register(from, to, converter)`.
 *
 * @avoidWhen You need both forward and reverse directions — use
 * `BidirectionalConverter<A, B>` to register both in a single call.
 *
 * @pitfalls
 * NEVER mutate the input value inside a converter — because values are
 * primitives or phantom-typed plain objects, mutation is silent and will
 * corrupt the original branded value at the call site.
 *
 * NEVER rely on closure state inside a converter for caching — the registry
 * caches composed converters by path key, so stateful closures can lead to
 * incorrect results on subsequent calls.
 *
 * @category Converters
 * @see BidirectionalConverter
 * @see RelaxedConverter
 */
export type Converter<TInput, TOutput> = (input: TInput) => TOutput;

export type RelaxConverter<ConverterType> =
  ConverterType extends Converter<infer A extends PrimitiveType, infer B extends PrimitiveType>
    ? (input: BaseRelax<A>) => BaseRelax<B>
    : (input: PrimitiveType) => PrimitiveType;

export type Relax<
  T extends PrimitiveType | Converter<any, any> | BidirectionalConverter<any, any>
> = T extends PrimitiveType
  ? BaseRelax<T>
  : T extends Converter<unknown, unknown>
    ? RelaxConverter<T>
    : RelaxBidirectionalConverter<T>;

/**
 * Bidirectional converter with forward and reverse transformations.
 *
 * Registers both directions in a single `registry.register(A, B, converter)` call.
 * Under the hood, the registry splits `{ to, from }` into two unidirectional
 * edges in the adjacency map.
 *
 * @template TInput - First unit type (the "from" direction)
 * @template TOutput - Second unit type (the "to" direction)
 *
 * @property to - Forward converter (TInput → TOutput)
 * @property from - Reverse converter (TOutput → TInput)
 *
 * @remarks
 * - Round-trip conversions should preserve value within acceptable floating-point
 *   tolerance; test with `Math.abs(parse(format(x)) - x) < epsilon`
 * - Both converters must be deterministic pure functions
 *
 * @example
 * ```typescript
 * const celsiusFahrenheit: BidirectionalConverter<Celsius, Fahrenheit> = {
 *   to: (c) => (c * 9/5) + 32,
 *   from: (f) => (f - 32) * 5/9
 * };
 *
 * const registry = createRegistry().register(CelsiusMeta, FahrenheitMeta, celsiusFahrenheit);
 * registry.Celsius.to.Fahrenheit(0 as Celsius); // 32
 * registry.Fahrenheit.to.Celsius(32 as Fahrenheit); // 0
 * ```
 *
 * @useWhen Both conversion directions are commonly needed and you want to
 * minimise the number of `register` calls.
 *
 * @avoidWhen Only one direction is needed — registering both wastes a graph
 * edge and slightly enlarges the type-level union. Use a plain `Converter`
 * and call `register` once.
 *
 * @pitfalls
 * NEVER swap `to` and `from` in the object literal — the names are just
 * conventions; the registry trusts the object structure, so a transposed
 * pair silently registers the wrong direction for each edge.
 *
 * NEVER assume chained round-trips are exact — floating-point rounding means
 * `from(to(x))` may differ from `x` by epsilon; use toleranced comparisons.
 *
 * @category Converters
 * @see Converter
 * @see RelaxedBidirectionalConverter
 */
export type BidirectionalConverter<TInput, TOutput> = {
  to: Converter<TInput, TOutput>;
  from: Converter<TOutput, TInput>;
};

export type RelaxBidirectionalConverter<ConverterType> =
  ConverterType extends BidirectionalConverter<
    infer A extends PrimitiveType,
    infer B extends PrimitiveType
  >
    ? {
        to: (input: BaseRelax<A>) => B;
        from: (input: BaseRelax<B>) => A;
      }
    : {
        to: (input: PrimitiveType) => PrimitiveType;
        from: (input: PrimitiveType) => PrimitiveType;
      };

/**
 * A converter that accepts the branded input type but returns
 * unwrapped (plain) output. This eliminates the need to cast return values
 * to branded types inside converter functions, while preserving
 * full autocompletion on the input parameter.
 *
 * Since `Tagged<T, ...> extends T`, strict converters returning branded
 * types are also assignable to this type.
 *
 * @template TInput - Source unit-tagged type
 * @template TOutput - Destination unit-tagged type
 *
 * @example
 * ```typescript
 * // No cast needed on the return value
 * const c2f: RelaxedConverter<Celsius, Fahrenheit> = (c) => (c * 9/5) + 32;
 *                                                            // returns number, not Fahrenheit
 * ```
 *
 * @useWhen Writing converter implementations where casting the return value
 * to a branded type is inconvenient. The registry handles branding internally.
 *
 * @avoidWhen The converter is used outside the registry — callers of a
 * standalone `RelaxedConverter` receive an unwrapped value with no unit brand.
 *
 * @pitfalls
 * NEVER pass a `RelaxedConverter` result directly to another function that
 * expects a branded type without going through the registry — the unbranded
 * return value defeats the type safety guarantee at the call site.
 *
 * @category Converters
 * @see Converter
 * @see RelaxedBidirectionalConverter
 */
export type RelaxedConverter<TInput, TOutput> = (input: TInput) => Unwrap<TOutput>;

/**
 * A bidirectional converter with relaxed (unwrapped) output types.
 * Input remains branded for full autocompletion and type safety;
 * return values are plain base types without branding.
 *
 * @template TInput - First unit-tagged type
 * @template TOutput - Second unit-tagged type
 *
 * @example
 * ```typescript
 * const celsiusFahrenheit: RelaxedBidirectionalConverter<Celsius, Fahrenheit> = {
 *   to: (c) => (c * 9/5) + 32,   // returns number, not Fahrenheit
 *   from: (f) => (f - 32) * 5/9  // returns number, not Celsius
 * };
 * ```
 *
 * @useWhen You want the ergonomics of `RelaxedConverter` (no return-value cast)
 * for both directions in a single object, typically for `registry.register()`.
 *
 * @category Converters
 * @see BidirectionalConverter
 * @see RelaxedConverter
 */
export type RelaxedBidirectionalConverter<TInput, TOutput> = {
  to: RelaxedConverter<TInput, TOutput>;
  from: RelaxedConverter<TOutput, TInput>;
};
