# Research: Non-Primitive Type Support

**Date**: 2026-02-15  
**Feature**: [Non-Primitive Type Support](./spec.md)  
**Status**: Complete

## Overview

This document consolidates research findings for extending the unacy type system to support TypeScript non-primitive types (enums, classes, records, tuples). All ambiguities from the original specification have been resolved through the clarification session.

## Design Decisions (from Clarifications)

### 1. Mixed Enum Handling
**Decision**: Reject mixed enums at registration time with clear error message  
**Rationale**: TypeScript discourages mixed enums as an anti-pattern. Rejecting them:
- Simplifies implementation (no need to handle heterogeneous member types)
- Guides developers toward better practices
- Prevents ambiguity in type inference
**Alternatives Considered**: 
- Support with normalization to strings (adds complexity)
- Support with separate handling per member type (breaks type consistency)

### 2. Class Inheritance
**Decision**: Store only the direct class prototype; natural prototype chain remains accessible  
**Rationale**: 
- Aligns with JavaScript's native inheritance mechanism
- Developers can traverse prototype chain at runtime when needed
- Avoids storage overhead of flattening or duplicating inherited methods
- Maintains flexibility for advanced use cases
**Alternatives Considered**:
- Store full prototype chain array (unnecessary duplication)
- Flatten inherited properties (loses inheritance semantics)
- Reject classes with inheritance (too restrictive)

### 3. Circular References in Records
**Decision**: Reject circular references at registration time with clear error message  
**Rationale**:
- Prevents infinite recursion during schema validation
- Simplifies implementation significantly
- Circular structures are rarely needed in unit type definitions
- Most valid use cases can be restructured to avoid circularity
**Alternatives Considered**:
- Support with `$ref` markers (adds schema complexity)
- Support with depth limits (arbitrary cutoff creates inconsistency)

### 4. Tuple Optional and Rest Elements
**Decision**: Represent optional elements with "?" suffix, rest elements with "..." prefix  
**Rationale**:
- Familiar syntax from TypeScript/JavaScript conventions
- Compact and readable representation
- Easy to parse programmatically
- Example: `["number", "string?", "...boolean"]` maps to `[number, string?, ...boolean[]]`
**Alternatives Considered**:
- Metadata objects per position (verbose, harder to read)
- Reject optional/rest elements (too restrictive)
- Ignore optional/rest (loses important type information)

### 5. Class Constructor Parameters
**Decision**: Allow any class regardless of constructor signature  
**Rationale**:
- Unit system stores prototypes, not instances
- Constructor parameters are irrelevant to type branding
- Developers create their own instances with appropriate parameters
- Maximizes flexibility without implementation complexity
**Alternatives Considered**:
- Require parameterless constructors (unnecessarily restrictive)
- Require factory functions (adds API complexity)
- Store constructor parameter types (adds metadata complexity without clear benefit)

### 6. Empty Types
**Decision**: Allow all empty types (empty enums, classes without methods, empty records)  
**Rationale**:
- Empty types still provide type branding value for compile-time safety
- Common pattern in type-driven design for marker types
- No implementation cost to support (validation passes trivially)
- Enables phantom types and other advanced type patterns
**Alternatives Considered**:
- Reject empty types (prevents valid use cases)
- Allow with warnings (adds noise without benefit)

### 7. Complex Nested Structures in Records
**Decision**: Recursively support nested structures using same schema format rules  
**Important Clarification**: Schemas are **provided by developers** in the required format. The system **infers TypeScript types from schemas** rather than generating schemas from types.
**Rationale**:
- Consistent with overall design: developers define schemas, system provides types
- Enables rich compositional type definitions
- Natural extension of primitive type name string approach
- Example: `{x: "number", y: {lat: "number", lng: "number"}}` represents nested coordinate structure
**Alternatives Considered**:
- Reject non-primitive nested properties (too restrictive)
- Limit nesting depth (arbitrary limit creates inconsistency)
- Treat nested as "unknown" (loses type safety)

## Technical Approach

### Type System Extensions

**Current State** (packages/core/src/types.ts):
```typescript
export type PrimitiveType = number | string | boolean | bigint;
export type WithUnits<T extends PrimitiveType, M extends BaseMetadata> = Tagged<T, typeof UNITS, M>;
```

**Proposed Extensions**:
```typescript
// 1. Extend PrimitiveType to include non-primitive types
export type NonPrimitiveType = 
  | Record<string, unknown>  // For enums (enum object itself), records (schema objects)
  | Function                 // For classes (class prototype)
  | readonly unknown[];      // For tuples (array of type name strings)

export type AnyType = PrimitiveType | NonPrimitiveType;

// 2. Add type-specific metadata structures
export type EnumMetadata<E extends Record<string, unknown>> = BaseMetadata & {
  type: 'enum';
  value: E;  // The enum object itself
};

export type ClassMetadata<C extends Function> = BaseMetadata & {
  type: 'class';
  value: C;  // The class prototype
};

export type RecordSchema = {
  [key: string]: string | RecordSchema;  // Type name string or nested schema
};

export type RecordMetadata = BaseMetadata & {
  type: 'record';
  value: RecordSchema;  // Schema object
};

export type TupleMetadata = BaseMetadata & {
  type: 'tuple';
  value: readonly string[];  // Array of type name strings with ? and ... modifiers
};
```

### Validation Strategy

**Enum Validation**:
- Check that value is an object
- Check that all values are either all numbers or all strings (reject mixed)
- Check that enum is not empty (per clarification #6, allow empty but validate it's still an enum object)

**Class Validation**:
- Check that value is a function (constructor)
- Check that it has a prototype
- No validation of constructor parameters (per clarification #5)
- No validation of methods (per clarification #6, allow empty)

**Record Validation**:
- Check that value is a plain object
- Recursively validate that all property values are either:
  - Primitive type name strings ("number", "string", "boolean", "bigint")
  - Nested plain objects (recursively validated)
- Detect circular references and reject (per clarification #3)

**Tuple Validation**:
- Check that value is an array
- Check that all elements are strings
- Parse "?" suffixes and "..." prefixes
- Allow empty tuples (per clarification #6)

### Type Inference

Since schemas are provided by developers, the system needs to infer TypeScript types from them:

```typescript
// Schema-to-type inference utility types
export type InferFromSchema<S extends RecordSchema> = {
  [K in keyof S]: S[K] extends string 
    ? PrimitiveTypeFromName<S[K]>
    : S[K] extends RecordSchema 
      ? InferFromSchema<S[K]>
      : never;
};

export type PrimitiveTypeFromName<T extends string> = 
  T extends 'number' ? number :
  T extends 'string' ? string :
  T extends 'boolean' ? boolean :
  T extends 'bigint' ? bigint :
  never;

export type InferFromTuple<T extends readonly string[]> = {
  [K in keyof T]: T[K] extends `${infer Base}?` 
    ? PrimitiveTypeFromName<Base> | undefined
    : T[K] extends `...${infer Base}`
      ? PrimitiveTypeFromName<Base>[]
      : T[K] extends string
        ? PrimitiveTypeFromName<T[K]>
        : never;
};
```

## Integration with Existing Infrastructure

### UnitRegistry Extensions

The existing `UnitRegistry` already supports generic registration via:
```typescript
register<From extends WithTypedUnits<FromMeta>, FromMeta extends TypedMetadata<PrimitiveType>>(
  from: string | FromMeta,
  ...
): UnitRegistry<...>
```

**Required Changes**:
1. Extend `TypedMetadata` to support non-primitive metadata types
2. Add validation logic in registration method to detect and validate non-primitive types
3. Maintain backward compatibility: primitive types continue to work as before

### Backward Compatibility Strategy

- Keep all existing types and APIs unchanged
- Extend type unions additively (PrimitiveType | NonPrimitiveType)
- Existing primitive type registrations continue to work identically
- New validation only activates for non-primitive types
- No breaking changes to public API surface

## Open Questions (Resolved)

All open questions from the original specification have been resolved through clarifications:
1. ✅ Mixed enums: Reject with error
2. ✅ Class inheritance: Store direct prototype only
3. ✅ Circular references: Reject with error
4. ✅ Tuple optional/rest: Use "?" and "..." notation
5. ✅ Class constructors: Support any signature
6. ✅ Empty types: Allow all
7. ✅ Complex nested structures: Recursively support with developer-provided schemas

## References

- TypeScript Handbook: Enums - https://www.typescriptlang.org/docs/handbook/enums.html
- TypeScript Handbook: Classes - https://www.typescriptlang.org/docs/handbook/2/classes.html
- TypeScript Handbook: Object Types - https://www.typescriptlang.org/docs/handbook/2/objects.html
- TypeScript Handbook: Tuple Types - https://www.typescriptlang.org/docs/handbook/2/objects.html#tuple-types
- type-fest Documentation: Tagged, GetTagMetadata - Used for existing primitive type system

## Next Steps

Phase 1 (Data Model & Contracts) will expand on these research findings to create:
1. Detailed type definitions and interfaces
2. API contracts for registration and introspection
3. Usage examples demonstrating each non-primitive type
