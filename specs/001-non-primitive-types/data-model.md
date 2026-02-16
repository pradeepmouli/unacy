# Data Model: Non-Primitive Type Support

**Date**: 2026-02-15
**Feature**: [Non-Primitive Type Support](./spec.md)
**Research**: [research.md](./research.md)

## Overview

This document defines the complete type system extensions required to support non-primitive types (enums, classes, records, tuples) in the unacy library.

## Core Type Extensions

### Extended Type Union

```typescript
// Current primitive types (unchanged)
export type PrimitiveType = number | string | boolean | bigint;

// New non-primitive type categories
export type EnumType = Record<string, string | number>;
export type ClassType = abstract new (...args: any[]) => any;
export type RecordSchemaValue = string | RecordSchema;
export type RecordSchema = { [key: string]: RecordSchemaValue };
export type TupleSchema = readonly string[];

// Combined type union for all supported types
export type SupportedType = PrimitiveType | EnumType | ClassType | RecordSchema | TupleSchema;
```

## Metadata Type Definitions

### Base Metadata Structure

All metadata types extend the existing `BaseMetadata`:

```typescript
export type BaseMetadata = {
  /** Unique identifier for the unit */
  name: string;
};
```

### TypedMetadata Extension

Extend `TypedMetadata` to support non-primitive types:

```typescript
// Current implementation (primitives only)
export type TypedMetadata<T extends PrimitiveType> = Simplify<{
  name: string;
  type: ToPrimitiveTypeName<T>;
}>;

// Extended implementation (all types)
export type ExtendedTypedMetadata<T extends SupportedType> =
  T extends PrimitiveType ? PrimitiveTypedMetadata<T> :
  T extends EnumType ? EnumTypedMetadata<T> :
  T extends ClassType ? ClassTypedMetadata<T> :
  T extends RecordSchema ? RecordTypedMetadata :
  T extends TupleSchema ? TupleTypedMetadata :
  never;

// Primitive metadata (unchanged)
export type PrimitiveTypedMetadata<T extends PrimitiveType> = Simplify<{
  name: string;
  type: ToPrimitiveTypeName<T>;
}>;
```

### Enum Metadata

```typescript
export type EnumTypedMetadata<E extends EnumType> = Simplify<{
  name: string;
  type: 'enum';
  /** The enum object itself at runtime */
  value: E;
  /** Derived: whether the enum is numeric (true) or string (false) */
  enumType: 'numeric' | 'string';
}>;

// Type guard for enum metadata
export function isEnumMetadata(meta: unknown): meta is EnumTypedMetadata<any> {
  return (
    typeof meta === 'object' &&
    meta !== null &&
    'type' in meta &&
    meta.type === 'enum'
  );
}
```

**Validation Rules**:
- Enum object must have at least one member (allow empty per clarification #6, but must still be a valid enum)
- All enum values must be either all numbers OR all strings (reject mixed per clarification #1)
- Enum cannot have circular references (inherently prevented by enum structure)

### Class Metadata

```typescript
export type ClassTypedMetadata<C extends ClassType> = Simplify<{
  name: string;
  type: 'class';
  /** The class prototype at runtime */
  value: C;
  /** Optional: Class constructor name for debugging */
  className?: string;
}>;

// Type guard for class metadata
export function isClassMetadata(meta: unknown): meta is ClassTypedMetadata<any> {
  return (
    typeof meta === 'object' &&
    meta !== null &&
    'type' in meta &&
    meta.type === 'class'
  );
}
```

**Validation Rules**:
- Value must be a function (constructor)
- Value must have a `prototype` property
- Constructor may have any parameter signature (per clarification #5)
- No requirement for methods on prototype (allow empty per clarification #6)
- Only direct prototype stored; inheritance chain accessible at runtime (per clarification #2)

### Record Metadata

```typescript
export type RecordTypedMetadata = Simplify<{
  name: string;
  type: 'record';
  /** Schema object mapping properties to type descriptors */
  value: RecordSchema;
}>;

// RecordSchema is recursively defined
export type RecordSchema = {
  [key: string]: string | RecordSchema;
};

// Type guard for record metadata
export function isRecordMetadata(meta: unknown): meta is RecordTypedMetadata {
  return (
    typeof meta === 'object' &&
    meta !== null &&
    'type' in meta &&
    meta.type === 'record'
  );
}
```

**Schema Format**:
- Property keys are property names (strings)
- Property values are either:
  - Primitive type name strings: `"number"`, `"string"`, `"boolean"`, `"bigint"`
  - Nested `RecordSchema` objects for nested structures

**Validation Rules**:
- Schema must be a plain object
- All property values must be valid type names or nested plain objects
- No circular references allowed (reject per clarification #3)
- Empty records allowed (per clarification #6)

**Example**:
```typescript
// Simple record
const PointSchema = {
  x: "number",
  y: "number"
};

// Nested record
const PersonSchema = {
  name: "string",
  age: "number",
  address: {
    street: "string",
    city: "string",
    coordinates: {
      lat: "number",
      lng: "number"
    }
  }
};
```

### Tuple Metadata

```typescript
export type TupleTypedMetadata = Simplify<{
  name: string;
  type: 'tuple';
  /** Array of type strings with optional ? suffix and ... prefix */
  value: readonly string[];
}>;

// Type guard for tuple metadata
export function isTupleMetadata(meta: unknown): meta is TupleTypedMetadata {
  return (
    typeof meta === 'object' &&
    meta !== null &&
    'type' in meta &&
    meta.type === 'tuple'
  );
}
```

**Tuple Format** (per clarification #4):
- Array of type name strings
- Optional elements indicated with `?` suffix: `"string?"`
- Rest elements indicated with `...` prefix: `"...number"`
- Example: `["number", "string?", "...boolean"]` represents `[number, string?, ...boolean[]]`

**Validation Rules**:
- Value must be an array
- All elements must be strings
- Strings must be valid type names with optional `?` or `...` modifiers
- Empty tuples allowed (per clarification #6)

**Examples**:
```typescript
// Basic tuple
const RGBTuple = ["number", "number", "number"];

// Tuple with optional
const CoordTuple = ["number", "number", "number?"];  // [number, number, number?]

// Tuple with rest
const VersionTuple = ["number", "number", "...number"];  // [number, number, ...number[]]
```

## Type Inference Utilities

### Schema-to-Type Inference

```typescript
// Infer TypeScript type from RecordSchema
export type InferFromRecordSchema<S extends RecordSchema> = Simplify<{
  [K in keyof S]: S[K] extends string
    ? PrimitiveTypeFromName<S[K]>
    : S[K] extends RecordSchema
      ? InferFromRecordSchema<S[K]>
      : never;
}>;

// Infer TypeScript type from TupleSchema
export type InferFromTupleSchema<T extends readonly string[]> = Simplify<{
  [K in keyof T]: T[K] extends `${infer Base}?`
    ? PrimitiveTypeFromName<Base> | undefined
    : T[K] extends `...${infer Base}`
      ? Array<PrimitiveTypeFromName<Base>>
      : T[K] extends string
        ? PrimitiveTypeFromName<T[K]>
        : never;
}>;

// Map type name strings to TypeScript types
export type PrimitiveTypeFromName<T extends string> =
  T extends 'number' ? number :
  T extends 'string' ? string :
  T extends 'boolean' ? boolean :
  T extends 'bigint' ? bigint :
  never;
```

## Validation Functions

### Enum Validation

```typescript
export function validateEnum(value: unknown): value is EnumType {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const enumObj = value as Record<string, unknown>;
  const values = Object.values(enumObj);

  // Check if empty (allow per clarification #6)
  if (values.length === 0) {
    return true;
  }

  // Check if all values are numbers or all are strings
  const numericValues = values.filter(v => typeof v === 'number');
  const stringValues = values.filter(v => typeof v === 'string');

  // Reject mixed enums (per clarification #1)
  if (numericValues.length > 0 && stringValues.length > 0) {
    throw new Error(
      'Mixed enums (with both numeric and string members) are not supported. ' +
      'Please use either numeric or string values consistently.'
    );
  }

  return numericValues.length > 0 || stringValues.length > 0;
}
```

### Class Validation

```typescript
export function validateClass(value: unknown): value is ClassType {
  if (typeof value !== 'function') {
    return false;
  }

  // Check for prototype (per clarification #2 and #5)
  if (!('prototype' in value)) {
    return false;
  }

  // Allow classes with any constructor signature (per clarification #5)
  // Allow classes without methods (per clarification #6)
  return true;
}
```

### Record Schema Validation

```typescript
export function validateRecordSchema(
  value: unknown,
  visited: Set<unknown> = new Set()
): value is RecordSchema {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }

  // Detect circular references (reject per clarification #3)
  if (visited.has(value)) {
    throw new Error(
      'Circular references in record schemas are not supported. ' +
      'Please restructure your schema to avoid self-referential structures.'
    );
  }

  visited.add(value);

  const schema = value as Record<string, unknown>;

  // Allow empty records (per clarification #6)
  if (Object.keys(schema).length === 0) {
    return true;
  }

  // Validate all property values (per clarification #7)
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
```

### Tuple Schema Validation

```typescript
export function validateTupleSchema(value: unknown): value is TupleSchema {
  if (!Array.isArray(value)) {
    return false;
  }

  // Allow empty tuples (per clarification #6)
  if (value.length === 0) {
    return true;
  }

  // Validate each element (per clarification #4)
  for (let i = 0; i < value.length; i++) {
    const element = value[i];

    if (typeof element !== 'string') {
      throw new Error(
        `Tuple element at index ${i} must be a string, got ${typeof element}.`
      );
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
```

## Backward Compatibility

All existing types and APIs remain unchanged:

- `PrimitiveType` still defined as `number | string | boolean | bigint`
- `WithUnits<T extends PrimitiveType, M>` continues to work for all primitive types
- Existing `TypedMetadata<T extends PrimitiveType>` unchanged
- New types extend, don't replace:
  - `SupportedType = PrimitiveType | NonPrimitiveType`
  - `ExtendedTypedMetadata<T>` wraps both primitive and non-primitive cases

## Summary

This data model provides:

1. **Type-safe extensions** for enums, classes, records, and tuples
2. **Clear validation rules** based on clarification decisions
3. **Runtime metadata structures** matching specification requirements
4. **Type inference utilities** to derive TypeScript types from schemas
5. **Full backward compatibility** with existing primitive type system
6. **Comprehensive validation** with helpful error messages for rejected patterns

All design decisions align with the clarifications and maintain the library's goals of type safety, developer ergonomics, and minimal runtime overhead.
