# API Contracts: Type Metadata API

**Date**: 2026-02-15  
**Feature**: [Non-Primitive Type Support](../spec.md)  
**Data Model**: [data-model.md](../data-model.md)

## Overview

This document defines the API contracts for registering, accessing, and introspecting non-primitive unit types in the unacy library. All APIs maintain backward compatibility with existing primitive type registrations.

## Registration API

### Enum Registration

**Signature**:
```typescript
register<E extends EnumType>(
  metadata: EnumTypedMetadata<E>
): UnitRegistry<[...Edges, EnumUnit<E>]>
```

**Contract**:
```typescript
// Input
const LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3
} as const;

// Registration
registry.register({
  name: 'LogLevel',
  type: 'enum',
  value: LogLevel,
  enumType: 'numeric'
});

// Expected behavior:
// ✓ Stores enum object itself in metadata
// ✓ Validates that enum is homogeneous (all numeric or all string)
// ✗ Rejects mixed enums with clear error message
// ✓ Infers branded type: WithUnits<number, EnumTypedMetadata<typeof LogLevel>>
```

**Validation Rules**:
1. Value must be a valid enum object
2. Enum must be homogeneous (all numeric OR all string values)
3. Mixed enums throw: `"Mixed enums (with both numeric and string members) are not supported..."`
4. Empty enums are allowed

**Error Messages**:
```typescript
// Mixed enum error
"Mixed enums (with both numeric and string members) are not supported. Please use either numeric or string values consistently."

// Invalid enum object error
"Invalid enum value. Expected an object with numeric or string values."
```

### Class Registration

**Signature**:
```typescript
register<C extends ClassType>(
  metadata: ClassTypedMetadata<C>
): UnitRegistry<[...Edges, ClassUnit<C>]>
```

**Contract**:
```typescript
// Input
class Temperature {
  constructor(public value: number, public scale: string) {}
  
  toCelsius(): number {
    return this.scale === 'F' 
      ? (this.value - 32) * 5/9 
      : this.value;
  }
}

// Registration
registry.register({
  name: 'Temperature',
  type: 'class',
  value: Temperature,
  className: 'Temperature'
});

// Expected behavior:
// ✓ Stores class prototype in metadata
// ✓ Accepts classes with any constructor signature
// ✓ Accepts classes with or without methods
// ✓ Stores only direct prototype (inheritance chain accessible)
// ✓ Infers branded type: WithUnits<Temperature, ClassTypedMetadata<typeof Temperature>>
```

**Validation Rules**:
1. Value must be a function (constructor)
2. Value must have a `prototype` property
3. Constructor may have any parameter signature
4. Class may have zero methods
5. Inheritance is supported (only direct prototype stored)

**Error Messages**:
```typescript
// Invalid class error
"Invalid class value. Expected a constructor function with a prototype."

// Not a function error
"Invalid class value. Expected a function, got ${typeof value}."
```

### Record Registration

**Signature**:
```typescript
register<S extends RecordSchema>(
  metadata: RecordTypedMetadata<S>
): UnitRegistry<[...Edges, RecordUnit<InferFromRecordSchema<S>>]>
```

**Contract**:
```typescript
// Input: Simple record
const PointSchema = {
  x: "number",
  y: "number"
} as const;

// Registration
registry.register({
  name: 'Point',
  type: 'record',
  value: PointSchema
});

// Expected behavior:
// ✓ Stores schema object in metadata
// ✓ Infers branded type: WithUnits<{x: number, y: number}, RecordTypedMetadata>
// ✓ Validates schema recursively

// Input: Nested record
const PersonSchema = {
  name: "string",
  age: "number",
  address: {
    street: "string",
    city: "string"
  }
} as const;

// Registration
registry.register({
  name: 'Person',
  type: 'record',
  value: PersonSchema
});

// Expected behavior:
// ✓ Handles nested structures recursively
// ✓ Infers correct nested type
// ✗ Rejects circular references with clear error

// Circular reference (rejected)
const CircularSchema = {
  name: "string",
  parent: CircularSchema  // ERROR!
};
```

**Validation Rules**:
1. Schema must be a plain object
2. Property values must be primitive type names OR nested schemas
3. Valid type names: `"number"`, `"string"`, `"boolean"`, `"bigint"`
4. Nested schemas validated recursively
5. Circular references are rejected
6. Empty records are allowed

**Error Messages**:
```typescript
// Circular reference error
"Circular references in record schemas are not supported. Please restructure your schema to avoid self-referential structures."

// Invalid type name error
"Invalid type name \"${typeName}\" for property \"${key}\". Expected: \"number\", \"string\", \"boolean\", or \"bigint\"."

// Invalid schema value error
"Invalid schema value for property \"${key}\". Expected a type name string or nested schema object."
```

### Tuple Registration

**Signature**:
```typescript
register<T extends TupleSchema>(
  metadata: TupleTypedMetadata<T>
): UnitRegistry<[...Edges, TupleUnit<InferFromTupleSchema<T>>]>
```

**Contract**:
```typescript
// Input: Basic tuple
const RGBSchema = ["number", "number", "number"] as const;

// Registration
registry.register({
  name: 'RGB',
  type: 'tuple',
  value: RGBSchema
});

// Expected behavior:
// ✓ Stores array of type strings in metadata
// ✓ Infers branded type: WithUnits<[number, number, number], TupleTypedMetadata>

// Input: Tuple with optional
const CoordSchema = ["number", "number", "number?"] as const;

// Registration
registry.register({
  name: 'Coordinate',
  type: 'tuple',
  value: CoordSchema
});

// Expected behavior:
// ✓ Parses ? suffix correctly
// ✓ Infers branded type: WithUnits<[number, number, number?], TupleTypedMetadata>

// Input: Tuple with rest
const VersionSchema = ["number", "number", "...number"] as const;

// Registration
registry.register({
  name: 'Version',
  type: 'tuple',
  value: VersionSchema
});

// Expected behavior:
// ✓ Parses ... prefix correctly
// ✓ Infers branded type: WithUnits<[number, number, ...number[]], TupleTypedMetadata>
```

**Validation Rules**:
1. Value must be an array
2. All elements must be strings
3. Strings must be valid type names with optional `?` or `...` modifiers
4. Format: `"type"`, `"type?"`, or `"...type"`
5. Empty tuples are allowed

**Error Messages**:
```typescript
// Non-string element error
"Tuple element at index ${i} must be a string, got ${typeof element}."

// Invalid type name error
"Invalid type name \"${typeName}\" at tuple index ${i}. Expected: \"number\", \"string\", \"boolean\", or \"bigint\"."

// Invalid tuple value error
"Invalid tuple schema. Expected an array of type name strings."
```

## Introspection API

### Getting Unit Metadata

**Signature**:
```typescript
getMetadata(unitName: string): ExtendedTypedMetadata<SupportedType> | undefined
```

**Contract**:
```typescript
// For enum units
const enumMeta = registry.getMetadata('LogLevel');
/* Returns:
{
  name: 'LogLevel',
  type: 'enum',
  value: LogLevel,
  enumType: 'numeric'
}
*/

// For class units
const classMeta = registry.getMetadata('Temperature');
/* Returns:
{
  name: 'Temperature',
  type: 'class',
  value: Temperature,
  className: 'Temperature'
}
*/

// For record units
const recordMeta = registry.getMetadata('Point');
/* Returns:
{
  name: 'Point',
  type: 'record',
  value: { x: "number", y: "number" }
}
*/

// For tuple units
const tupleMeta = registry.getMetadata('RGB');
/* Returns:
{
  name: 'RGB',
  type: 'tuple',
  value: ["number", "number", "number"]
}
*/
```

### Type Guards

**Signatures**:
```typescript
isEnumMetadata(meta: unknown): meta is EnumTypedMetadata<any>
isClassMetadata(meta: unknown): meta is ClassTypedMetadata<any>
isRecordMetadata(meta: unknown): meta is RecordTypedMetadata
isTupleMetadata(meta: unknown): meta is TupleTypedMetadata
isPrimitiveMetadata(meta: unknown): meta is PrimitiveTypedMetadata<PrimitiveType>
```

**Contract**:
```typescript
const meta = registry.getMetadata('LogLevel');

if (isEnumMetadata(meta)) {
  // TypeScript knows: meta.type === 'enum'
  // TypeScript knows: meta.value is the enum object
  // TypeScript knows: meta.enumType is 'numeric' | 'string'
  console.log(meta.value);  // Enum object
}

if (isClassMetadata(meta)) {
  // TypeScript knows: meta.type === 'class'
  // TypeScript knows: meta.value is the class prototype
  console.log(meta.value.prototype);  // Access prototype
}

if (isRecordMetadata(meta)) {
  // TypeScript knows: meta.type === 'record'
  // TypeScript knows: meta.value is RecordSchema
  console.log(Object.keys(meta.value));  // Property names
}

if (isTupleMetadata(meta)) {
  // TypeScript knows: meta.type === 'tuple'
  // TypeScript knows: meta.value is readonly string[]
  console.log(meta.value.length);  // Tuple length
}
```

## Unit Creation API

### Creating Branded Values

**Enum Units**:
```typescript
// After registration
const logLevel = LogLevel.INFO as WithUnits<number, EnumTypedMetadata<typeof LogLevel>>;

// Type-safe: logLevel is branded with LogLevel enum metadata
// Runtime value: 1 (the enum member value)
```

**Class Units**:
```typescript
// After registration
const temp = new Temperature(100, 'F') as WithUnits<Temperature, ClassTypedMetadata<typeof Temperature>>;

// Type-safe: temp is branded with Temperature class metadata
// Runtime value: Temperature instance with methods accessible
```

**Record Units**:
```typescript
// After registration
const point = { x: 10, y: 20 } as WithUnits<InferFromRecordSchema<typeof PointSchema>, RecordTypedMetadata>;

// Type-safe: point is branded with Point record metadata
// Runtime value: { x: 10, y: 20 }
```

**Tuple Units**:
```typescript
// After registration
const rgb = [255, 128, 0] as WithUnits<InferFromTupleSchema<typeof RGBSchema>, TupleTypedMetadata>;

// Type-safe: rgb is branded with RGB tuple metadata
// Runtime value: [255, 128, 0]
```

## Conversion API

### Converter Registration

Non-primitive types can have converters registered just like primitive types:

```typescript
// Enum to enum conversion
registry.LogLevel.register('Priority', (logLevel: number) => {
  // Convert log level to priority
  return logLevel >= 2 ? Priority.HIGH : Priority.LOW;
});

// Class to primitive conversion
registry.Temperature.register('Celsius', (temp: Temperature) => {
  return temp.toCelsius();
});

// Record to record conversion
registry.Point.register('Point3D', (point: {x: number, y: number}) => {
  return { x: point.x, y: point.y, z: 0 };
});
```

## Backward Compatibility Guarantees

1. **Existing primitive type API unchanged**:
   ```typescript
   // Still works exactly as before
   registry.register({ name: 'Meter', type: 'number' });
   ```

2. **Existing type guards work**:
   ```typescript
   // isPrimitiveMetadata distinguishes from non-primitive
   if (isPrimitiveMetadata(meta)) {
     // Old behavior preserved
   }
   ```

3. **Existing registrations unaffected**:
   - All existing unit registrations continue to work
   - No migration needed for existing code
   - New validation only applies to non-primitive types

4. **Type inference backward compatible**:
   ```typescript
   // Existing type inference still works
   type MeterUnit = WithUnits<number, TypedMetadata<number>>;
   ```

## Summary

This API contract ensures:

1. **Type-safe registration** for all four non-primitive types
2. **Clear validation** with helpful error messages
3. **Comprehensive introspection** with type guards
4. **Consistent patterns** across all type categories
5. **Full backward compatibility** with existing primitive type APIs
6. **Integration with existing converter infrastructure**

All contracts align with the data model and clarification decisions, providing a complete and consistent API surface for non-primitive type support.
