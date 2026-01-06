/**
 * Formatter and parser types for format-tagged values
 * @packageDocumentation
 */

import type { WithFormat } from './types';

/**
 * Formatter converts a format-tagged value to a string representation.
 *
 * @template TInput - Format-tagged type to format
 *
 * @param input - Value tagged with format
 * @returns Plain string representation
 *
 * @remarks
 * - Output string must be parseable by corresponding `Parser`
 * - Should produce human-readable or machine-parseable output
 * - Format tag is lost in the output
 *
 * @example
 * ```typescript
 * const formatISO: Formatter<ISO8601> = (date) => date.toISOString();
 * ```
 */
export type Formatter<TInput extends WithFormat<unknown, string>> = (input: TInput) => string;

/**
 * Parser converts a string into a format-tagged value with validation.
 *
 * @template TOutput - Format-tagged type to produce
 *
 * @param input - Plain string to parse
 * @returns Value tagged with format
 *
 * @throws {ParseError} When input string is invalid
 *
 * @remarks
 * - Must validate input before tagging
 * - Must throw clear errors (not return invalid tagged values)
 * - Should use Zod or similar for schema validation
 * - Never produces invalid tagged values
 *
 * @example
 * ```typescript
 * const parseISO: Parser<ISO8601> = (input) => {
 *   const schema = z.string().datetime();
 *   const validated = schema.parse(input);
 *   return new Date(validated) as ISO8601;
 * };
 * ```
 */
export type Parser<TOutput extends WithFormat<unknown, string>> = (input: string) => TOutput;

/**
 * Paired formatter/parser for round-trip format transformations.
 *
 * @template T - Format-tagged type
 *
 * @property format - Converts tagged value → string
 * @property parse - Converts string → tagged value
 *
 * @remarks
 * - Round-trip must succeed for valid values: `parse(format(x)) ≡ x`
 * - Parser must reject invalid strings with clear errors
 * - Use when both formatting and parsing are needed
 *
 * @example
 * ```typescript
 * const iso8601: FormatterParser<ISO8601> = {
 *   format: (date) => date.toISOString(),
 *   parse: (str) => {
 *     const date = new Date(str);
 *     if (isNaN(date.getTime())) {
 *       throw new ParseError('ISO8601', str, 'Invalid date');
 *     }
 *     return date as ISO8601;
 *   }
 * };
 * ```
 */
export type FormatterParser<T extends WithFormat<unknown, string>> = {
  format: Formatter<T>;
  parse: Parser<T>;
};
