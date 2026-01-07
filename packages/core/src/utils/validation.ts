/**
 * Runtime validation helpers for parsers
 * @packageDocumentation
 */

import type { ZodSchema } from 'zod';
import type { Parser } from '../formatters';
import type { WithFormat } from '../types';
import { ParseError } from '../errors';

/**
 * Create a parser with Zod schema validation.
 *
 * @template F - Format identifier
 * @template T - Base type
 * @param schema - Zod schema for validation
 * @param format - Format identifier string
 * @returns Parser function that validates and tags values
 *
 * @example
 * ```typescript
 * const parseHex = createParserWithSchema(
 *   z.string().regex(/^#[0-9A-Fa-f]{6}$/),
 *   'HexColor'
 * );
 * ```
 */
export function createParserWithSchema<F extends string, T>(
  schema: ZodSchema<T>,
  format: F
): Parser<WithFormat<T, F>> {
  return (input: string): WithFormat<T, F> => {
    try {
      const validated = schema.parse(input);
      return validated as WithFormat<T, F>;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      throw new ParseError(format, input, message);
    }
  };
}
