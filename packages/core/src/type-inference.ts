/**
 * Type inference utilities for schema-to-type conversion
 * @packageDocumentation
 */

import type { RecordSchema } from './types.js';
import type { Simplify } from 'type-fest';

/**
 * Map type name strings to TypeScript primitive types
 */
export type PrimitiveTypeFromName<T extends string> = T extends 'number'
  ? number
  : T extends 'string'
    ? string
    : T extends 'boolean'
      ? boolean
      : T extends 'bigint'
        ? bigint
        : never;

/**
 * Infer TypeScript type from RecordSchema
 * Recursively processes nested schemas
 */
export type InferFromRecordSchema<S extends RecordSchema> = Simplify<{
  [K in keyof S]: S[K] extends string
    ? PrimitiveTypeFromName<S[K]>
    : S[K] extends RecordSchema
      ? InferFromRecordSchema<S[K]>
      : never;
}>;

/**
 * Infer TypeScript type from TupleSchema
 * Handles optional (?) and rest (...) elements
 */
export type InferFromTupleSchema<T extends readonly string[]> = Simplify<{
  [K in keyof T]: T[K] extends `${infer Base}?`
    ? PrimitiveTypeFromName<Base> | undefined
    : T[K] extends `...${infer Base}`
      ? Array<PrimitiveTypeFromName<Base>>
      : T[K] extends string
        ? PrimitiveTypeFromName<T[K]>
        : never;
}>;
