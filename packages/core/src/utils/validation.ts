/**
 * Runtime validation helpers for parsers
 * @packageDocumentation
 */

import type { Parser } from '../formatters.js';
import type { WithFormat } from '../types.js';
import type { EnumType, ClassType, RecordSchema, TupleSchema, TypedMetadata } from '../types.js';
import { ParseError } from '../errors.js';

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
  schema: any,
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

// ============================================================================
// Non-Primitive Type Validation
// ============================================================================

/**
 * Validate that a runtime value is a valid TypeScript enum object.
 *
 * Accepts numeric enums (with reverse-mapped keys filtered out) and
 * string enums. Rejects empty objects and mixed enums whose forward
 * entries contain both string and number values.
 *
 * @param value - The value to validate
 * @returns `true` if `value` is a valid `EnumType`
 * @throws {Error} If the enum contains both numeric and string members
 *
 * @example
 * ```typescript
 * enum LogLevel { DEBUG = 0, INFO = 1 }
 * validateEnum(LogLevel); // true
 * validateEnum({}); // false
 * ```
 */
export function validateEnum(value: unknown): value is EnumType {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const enumObj = value as Record<string, unknown>;
  const entries = Object.entries(enumObj);

  // Reject empty objects that aren't real enums
  if (entries.length === 0) {
    return false;
  }

  // For numeric enums, TypeScript creates reverse mappings:
  // enum LogLevel { DEBUG = 0 } becomes { DEBUG: 0, 0: 'DEBUG' }
  // We need to filter out the reverse mappings to detect actual mixed enums

  // Separate forward and reverse mappings
  const forwardEntries = entries.filter(([key, _val]) => {
    // Forward mapping: string key -> number/string value
    return isNaN(Number(key));
  });

  // If no forward entries, this isn't a valid enum
  if (forwardEntries.length === 0) {
    return false;
  }

  // Check if all forward values are numbers or all are strings
  const values = forwardEntries.map(([, val]) => val);
  const numericValues = values.filter((v) => typeof v === 'number');
  const stringValues = values.filter((v) => typeof v === 'string');

  // Reject true mixed enums (not counting reverse mappings)
  if (numericValues.length > 0 && stringValues.length > 0) {
    throw new Error(
      'Mixed enums (with both numeric and string members) are not supported. ' +
        'Please use either numeric or string values consistently.'
    );
  }

  return numericValues.length > 0 || stringValues.length > 0;
}

/**
 * Validate that a runtime value is a valid class constructor.
 *
 * Checks that the value is a function with a `prototype` property.
 * Arrow functions and bound functions without prototypes are rejected.
 *
 * @param value - The value to validate
 * @returns `true` if `value` is a valid `ClassType` constructor
 */
export function validateClass(value: unknown): value is ClassType {
  if (typeof value !== 'function') {
    return false;
  }

  // Check for prototype
  if (!('prototype' in value)) {
    return false;
  }

  return true;
}

/**
 * Validate that a runtime value is a valid record schema.
 *
 * A valid record schema is a plain object whose leaf values are primitive
 * type name strings (`'number'`, `'string'`, `'boolean'`, `'bigint'`) or
 * nested record schema objects. Empty objects are accepted.
 *
 * @param value - The value to validate
 * @param visited - Internal set for circular reference detection
 * @returns `true` if `value` is a valid `RecordSchema`
 * @throws {Error} If circular references or invalid type names are found
 *
 * @example
 * ```typescript
 * validateRecordSchema({ x: 'number', y: 'number' }); // true
 * validateRecordSchema({ pos: { x: 'number' } }); // true (nested)
 * ```
 */
export function validateRecordSchema(
  value: unknown,
  visited: Set<unknown> = new Set()
): value is RecordSchema {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }

  // Detect circular references
  if (visited.has(value)) {
    throw new Error(
      'Circular references in record schemas are not supported. ' +
        'Please restructure your schema to avoid self-referential structures.'
    );
  }

  visited.add(value);

  const schema = value as Record<string, unknown>;

  // Allow empty records
  if (Object.keys(schema).length === 0) {
    return true;
  }

  // Validate all property values
  for (const [key, propValue] of Object.entries(schema)) {
    if (typeof propValue === 'string') {
      // Must be a valid primitive type name
      if (!['number', 'string', 'boolean', 'bigint'].includes(propValue)) {
        throw new Error(
          `Invalid type name "${propValue}" for property "${key}". ` +
            'Expected: "number", "string", "boolean", or "bigint".'
        );
      }
    } else if (typeof propValue === 'object' && propValue !== null) {
      // Recursively validate nested schema
      if (!validateRecordSchema(propValue, new Set(visited))) {
        return false;
      }
    } else {
      throw new Error(
        `Invalid schema value for property "${key}". ` +
          'Expected a type name string or nested schema object.'
      );
    }
  }

  return true;
}

/**
 * Validate that a runtime value is a valid tuple schema.
 *
 * A valid tuple schema is an array of primitive type name strings,
 * optionally annotated with `?` (optional) or `...` (rest) modifiers.
 * Empty arrays are accepted.
 *
 * @param value - The value to validate
 * @returns `true` if `value` is a valid `TupleSchema`
 * @throws {Error} If elements are not strings or contain invalid type names
 *
 * @example
 * ```typescript
 * validateTupleSchema(['number', 'number', 'number']); // true
 * validateTupleSchema(['string', 'number?']); // true (optional)
 * validateTupleSchema(['number', '...string']); // true (rest)
 * ```
 */
export function validateTupleSchema(value: unknown): value is TupleSchema {
  if (!Array.isArray(value)) {
    return false;
  }

  // Allow empty tuples
  if (value.length === 0) {
    return true;
  }

  // Validate each element
  for (let i = 0; i < value.length; i++) {
    const element = value[i];

    if (typeof element !== 'string') {
      throw new Error(`Tuple element at index ${i} must be a string, got ${typeof element}.`);
    }

    // Parse optional (?) and rest (...) modifiers
    let typeName = element;
    if (element.endsWith('?')) {
      typeName = element.slice(0, -1);
    } else if (element.startsWith('...')) {
      typeName = element.slice(3);
    }

    // Validate base type name
    if (!['number', 'string', 'boolean', 'bigint'].includes(typeName)) {
      throw new Error(
        `Invalid type name "${typeName}" at tuple index ${i}. ` +
          'Expected: "number", "string", "boolean", or "bigint".'
      );
    }
  }

  return true;
}

// ============================================================================
// Type Guards for Metadata
// ============================================================================

/**
 * Type guard: returns `true` when `meta.type` is an enum object.
 *
 * Distinguishes enums from record schemas by first checking whether the
 * value passes `validateRecordSchema`; if it does, the metadata is
 * classified as a record, not an enum.
 *
 * @param meta - Metadata object to inspect
 */
export function isEnumMetadata(meta: unknown): meta is TypedMetadata<EnumType> {
  if (typeof meta !== 'object' || meta === null || !('type' in meta)) {
    return false;
  }

  const { type } = meta as { type: unknown };

  // Enum type is an object (not array, not null) that passes validateEnum
  if (typeof type !== 'object' || type === null || Array.isArray(type)) {
    return false;
  }

  // If the object is a valid record schema, it's NOT an enum.
  // Record schemas have values from {'number','string','boolean','bigint'} or nested objects,
  // which would also pass validateEnum (looks like a string enum). Disambiguate here.
  try {
    if (validateRecordSchema(type)) {
      return false;
    }
  } catch {
    // Circular ref or invalid record schema — not a record, continue to enum check
  }

  // Use validateEnum but catch errors (mixed enums throw)
  try {
    return validateEnum(type);
  } catch {
    return false;
  }
}

/**
 * Type guard: returns `true` when `meta.type` is a class constructor.
 *
 * @param meta - Metadata object to inspect
 */
export function isClassMetadata(meta: unknown): meta is TypedMetadata<ClassType> {
  if (typeof meta !== 'object' || meta === null || !('type' in meta)) {
    return false;
  }

  const { type } = meta as { type: unknown };
  return validateClass(type);
}

/**
 * Type guard: returns `true` when `meta.type` is a record schema object.
 *
 * @param meta - Metadata object to inspect
 */
export function isRecordMetadata(meta: unknown): meta is TypedMetadata<RecordSchema> {
  if (typeof meta !== 'object' || meta === null || !('type' in meta)) {
    return false;
  }

  const { type } = meta as { type: unknown };

  // Must be a non-null object (not array)
  if (typeof type !== 'object' || type === null || Array.isArray(type)) {
    return false;
  }

  // Use validateRecordSchema but catch errors
  try {
    return validateRecordSchema(type);
  } catch {
    return false;
  }
}

/**
 * Type guard: returns `true` when `meta.type` is a tuple schema array.
 *
 * @param meta - Metadata object to inspect
 */
export function isTupleMetadata(meta: unknown): meta is TypedMetadata<TupleSchema> {
  if (typeof meta !== 'object' || meta === null || !('type' in meta)) {
    return false;
  }

  const { type } = meta as { type: unknown };

  // Use validateTupleSchema but catch errors
  try {
    return validateTupleSchema(type);
  } catch {
    return false;
  }
}

/**
 * Detect the kind of a metadata object by inspecting its `type` field.
 *
 * Resolution priority: `primitive` → `class` → `tuple` → `record` → `enum`.
 * Returns `'unknown'` when the value is not a recognised metadata shape.
 *
 * @param meta - Metadata object to categorise
 * @returns The detected kind string
 */
export function detectMetadataKind(
  meta: unknown
): 'primitive' | 'enum' | 'class' | 'tuple' | 'record' | 'unknown' {
  if (typeof meta !== 'object' || meta === null || !('type' in meta)) {
    return 'unknown';
  }

  const { type } = meta as { type: unknown };

  // Primitive: type is a string like 'number', 'string', 'boolean', 'bigint'
  if (typeof type === 'string') {
    return 'primitive';
  }

  // Class: type is a function (constructor)
  if (typeof type === 'function') {
    return 'class';
  }

  // Tuple: type is an array
  if (Array.isArray(type)) {
    return 'tuple';
  }

  // Object: could be enum or record
  if (typeof type === 'object' && type !== null) {
    // Try record first (stricter: values must be type-name strings or nested objects)
    try {
      if (validateRecordSchema(type)) {
        return 'record';
      }
    } catch {
      // Not a valid record schema
    }

    // Try enum
    try {
      if (validateEnum(type)) {
        return 'enum';
      }
    } catch {
      // Not a valid enum either
    }
  }

  return 'unknown';
}
