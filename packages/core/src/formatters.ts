/**
 * Formatter and parser types for format-tagged values
 * @packageDocumentation
 */

import type { WithFormat } from './types.js';

/**
 * Formatter converts a format-tagged value to a string representation.
 *
 * @template TInput - Format-tagged type to format (must extend `WithFormat<T, F>`)
 *
 * @param input - Value tagged with the format brand
 * @returns Plain string representation (format brand is stripped in the output)
 *
 * @remarks
 * - Output string should be parseable by the corresponding `Parser<TInput>` to
 *   ensure round-trip integrity
 * - The format brand carried by `TInput` is lost in the string output; callers
 *   must re-parse to recover a branded value
 *
 * @example
 * ```typescript
 * type ISO8601Date = WithFormat<Date, 'ISO8601'>;
 * const formatISO: Formatter<ISO8601Date> = (date) => date.toISOString();
 * ```
 *
 * @useWhen You need a typed function that can only receive format-validated
 * values (via `WithFormat<T, F>`) before serialising them.
 *
 * @avoidWhen The value needs no format brand — accept a plain `T` and format
 * without the tag overhead.
 *
 * @pitfalls
 * NEVER call a `Formatter` on a plain (untagged) value without first wrapping
 * it in the appropriate `WithFormat<T, F>` brand via a `Parser` — the brand
 * exists to guarantee the value has been validated before formatting.
 *
 * NEVER assume formatter output is stable across timezone environments —
 * `Date.toISOString()` uses UTC but other formatters may be locale-sensitive.
 *
 * @category Formatters
 * @see Parser
 * @see FormatterParser
 */
export type Formatter<TInput extends WithFormat<unknown, string>> = (input: TInput) => string;

/**
 * Parser converts a plain string into a format-tagged value with validation.
 *
 * Parsers are the gatekeeper that transforms raw (unbranded) string input into
 * a `WithFormat<T, F>` branded value. They must validate the input fully before
 * applying the brand — invalid inputs must throw, never produce tagged garbage.
 *
 * @template TOutput - Format-tagged type to produce (must extend `WithFormat<T, F>`)
 *
 * @param input - Plain string to parse and validate
 * @returns Value tagged with the format brand
 *
 * @throws {ParseError} When the input string is invalid or does not match the
 * expected format
 *
 * @remarks
 * - Must validate input before tagging — never cast without checking
 * - Must throw `ParseError` (or a subclass) on invalid input, not return `undefined`
 * - Use `createParserWithSchema` for Zod-backed validation
 *
 * @example
 * ```typescript
 * type ISO8601Date = WithFormat<Date, 'ISO8601'>;
 * const parseISO: Parser<ISO8601Date> = (input) => {
 *   const d = new Date(input);
 *   if (isNaN(d.getTime())) throw new ParseError('ISO8601', input, 'Invalid date');
 *   return d as ISO8601Date;
 * };
 * ```
 *
 * @useWhen Accepting user or external-system input that must be validated and
 * branded before entering type-safe internal APIs.
 *
 * @avoidWhen The input is already validated and branded — passing it through
 * a `Parser` again is redundant and incurs unnecessary validation overhead.
 *
 * @pitfalls
 * NEVER return a silently cast invalid value (`return invalid as TOutput`) —
 * doing so breaks the invariant that all `WithFormat<T, F>` values are valid,
 * corrupting every downstream consumer that trusts the brand.
 *
 * NEVER swallow parse errors with an empty catch block — callers rely on
 * thrown `ParseError` instances to distinguish validation failures from other
 * runtime errors.
 *
 * @category Formatters
 * @see Formatter
 * @see FormatterParser
 * @see createParserWithSchema
 */
export type Parser<TOutput extends WithFormat<unknown, string>> = (input: string) => TOutput;

/**
 * Paired formatter/parser for round-trip format transformations.
 *
 * Encapsulates both directions of a format contract in a single object:
 * `format` converts a branded value to a string; `parse` validates and
 * re-brands a string back to the same type.
 *
 * @template T - Format-tagged type (must extend `WithFormat<unknown, string>`)
 *
 * - `format` — Converts tagged value → plain string
 * - `parse` — Converts plain string → validated tagged value
 *
 * @remarks
 * Round-trip invariant: for all valid inputs `x`, `parse(format(x))` should
 * equal `x` (or be equivalent within the format's precision). Verify this
 * invariant in tests — floating-point or timezone edge cases can break it.
 *
 * @example
 * ```typescript
 * type ISO8601Date = WithFormat<Date, 'ISO8601'>;
 *
 * const iso8601: FormatterParser<ISO8601Date> = {
 *   format: (date) => date.toISOString(),
 *   parse: (str) => {
 *     const d = new Date(str);
 *     if (isNaN(d.getTime())) throw new ParseError('ISO8601', str, 'Invalid date');
 *     return d as ISO8601Date;
 *   }
 * };
 * ```
 *
 * @useWhen You need a self-contained codec that can be passed as a single
 * dependency to functions that need both formatting and parsing.
 *
 * @avoidWhen Only one direction is needed — pass a plain `Formatter<T>` or
 * `Parser<T>` to avoid carrying unused code.
 *
 * @pitfalls
 * NEVER assume round-trip losslessness without testing — date precision,
 * floating-point rounding, and locale-sensitive serialisers can all produce
 * values where `parse(format(x)) !== x` in subtle cases.
 *
 * @category Formatters
 * @see Formatter
 * @see Parser
 */
export type FormatterParser<T extends WithFormat<unknown, string>> = {
  format: Formatter<T>;
  parse: Parser<T>;
};
