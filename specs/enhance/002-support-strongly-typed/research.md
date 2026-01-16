# Research: Strongly Typed Unit Metadata

**Date**: 2026-01-16
**Feature**: Support for Strongly Typed Unit Metadata
**Status**: Complete

## Research Questions & Decisions

### 1. TypeScript Generic Type Parameter Patterns

**Decision**: Use optional generic parameter with default type `{name: string} & Record<string, unknown>`

**Rationale**:
- Default type parameter provides backward compatibility - existing code without explicit metadata types continues to work
- Intersection type `{name: string} & Record<string, unknown>` ensures `name` property always exists while allowing extension
- Generic parameter enables full type inference and compile-time safety for custom metadata shapes

**Alternatives Considered**:
- Function overloads: Rejected due to complexity and poor type inference for chained operations
- Multiple type parameters: Rejected as overly complex for this use case
- No default (require explicit type): Rejected as breaks backward compatibility

**Implementation Pattern**:
```typescript
// Before
interface Unit {
  // ...
}

// After
interface Unit<TMetadata extends {name: string} & Record<string, unknown> = {name: string} & Record<string, unknown>> {
  // ...
}
```

**References**:
- TypeScript Handbook: Generic Constraints
- Pattern: Default type parameters for backward compatibility

---

### 2. Immutable Data Patterns in TypeScript

**Decision**: Use `withMetadata<T>()` pattern returning new Unit instance with updated metadata

**Rationale**:
- Immutability promotes functional programming patterns and predictability
- Prevents accidental mutations that could cause bugs in concurrent contexts
- Aligns with TypeScript best practices and React-style state management patterns
- Type inference works naturally - `withMetadata({name: 'foo'})` infers the new metadata type

**Alternatives Considered**:
- `setMetadata()` (mutable): Rejected as promotes mutation and side effects
- `Readonly<T>` wrapper: Rejected as adds complexity and doesn't prevent runtime mutation
- Frozen objects: Rejected as performance overhead and doesn't integrate with TypeScript types

**Implementation Pattern**:
```typescript
class Unit<TMetadata extends Metadata = Metadata> {
  withMetadata<TNewMetadata extends Metadata>(
    metadata: TNewMetadata
  ): Unit<TNewMetadata> {
    return new Unit(this.value, this.dimensions, metadata);
  }
}
```

**References**:
- Functional Programming in TypeScript
- React's useState pattern (returns new state)
- Immer.js immutable update patterns

---

### 3. Type Inference from Values

**Decision**: TypeScript automatically infers metadata type from `const` objects with `as const` assertions

**Rationale**:
- `as const` creates readonly literals, enabling precise type inference
- No explicit type annotations required - developer experience is seamless
- Works naturally with registry pattern: `const Celsius = {name: 'Celsius' as const, unit: 'K', ...}`
- TypeScript infers the specific literal type `{name: 'Celsius', ...}` not just `{name: string, ...}`

**Alternatives Considered**:
- Explicit type annotations everywhere: Rejected as verbose and poor DX
- Template literal types: Rejected as limited to string manipulation
- Conditional types for inference: Rejected as overly complex

**Implementation Pattern**:
```typescript
// User code - TypeScript infers metadata type automatically
const Celsius = {
  name: 'Celsius' as const,
  symbol: '°C',
  description: 'Temperature in Celsius'
};

// register() infers TMetadata = typeof Celsius
register(Celsius, ...);

// Later access is fully typed
registry.Celsius.name; // Type: 'Celsius' (literal type)
registry.Celsius.symbol; // Type: string
```

**References**:
- TypeScript 3.4+ `const` assertions
- Literal type narrowing
- Type inference from values

---

### 4. Registry Map Structure

**Decision**: Use `Map<string, Metadata>` keyed by `metadata.name` property, storing full metadata object

**Rationale**:
- `Map` provides O(1) lookups by name (string key)
- Stores complete metadata object as value - no information loss
- String keys enable runtime lookup by name
- TypeScript can provide strong typing for known keys through declaration merging or index signatures

**Alternatives Considered**:
- `Record<string, Metadata>`: Rejected as less flexible for runtime additions
- `WeakMap`: Rejected as requires object keys (metadata objects can't be keys for their own lookup)
- Dual Map (name + signature): Rejected as adds complexity without clear benefit for MVP

**Implementation Pattern**:
```typescript
class Registry {
  private metadataMap: Map<string, Metadata> = new Map();

  register<T extends Metadata>(metadata: T): void {
    this.metadataMap.set(metadata.name, metadata);
  }

  get<T extends Metadata>(name: string): T | undefined {
    return this.metadataMap.get(name) as T | undefined;
  }
}

// Type-safe accessor pattern (through declaration merging)
interface Registry {
  Celsius: typeof Celsius;
  Kelvin: typeof Kelvin;
}
```

**References**:
- MDN Map documentation
- TypeScript declaration merging for type-safe registries
- Pattern: Registry with Map backing store

---

### 5. Backward Compatibility Strategies

**Decision**: Clean migration path with deprecation warnings and compatibility layer for transition period

**Rationale**:
- Tag system is replaced by `metadata.name` - this is a breaking change requiring major version bump
- Provide deprecation warnings when accessing old `tag` property
- Temporary compatibility layer: `unit.tag` returns `unit.getMetadata().name` with deprecation warning
- Migration guide documents the transition: `.tag` → `.getMetadata().name` or use registry accessors
- After major version bump, remove compatibility layer entirely

**Alternatives Considered**:
- Keep both systems: Rejected as adds complexity and confusion
- Immediate breaking change with no compatibility: Rejected as harsh for users
- Gradual migration over multiple versions: Rejected as extends migration period unnecessarily

**Implementation Pattern**:
```typescript
class Unit<TMetadata extends Metadata = Metadata> {
  // New system
  private metadata: TMetadata;

  getMetadata(): TMetadata {
    return this.metadata;
  }

  // Compatibility layer (deprecated, remove in next major version)
  /** @deprecated Use getMetadata().name instead */
  get tag(): string {
    console.warn('DEPRECATED: unit.tag is deprecated. Use unit.getMetadata().name or registry accessors.');
    return this.metadata.name;
  }
}
```

**Migration Steps**:
1. Current version: Introduce metadata system with deprecation warnings for `tag`
2. Major version bump (v2.0.0): Remove `tag` property entirely
3. Documentation: Provide migration guide with find-replace patterns

**References**:
- Semantic Versioning guidelines for breaking changes
- TypeScript deprecation patterns (@deprecated JSDoc tag)
- Effective deprecation communication strategies

---

## Technology Decisions Summary

| Aspect | Decision | Impact |
|--------|----------|--------|
| **Metadata Type** | `{name: string} & Record<string, unknown>` with generic parameter | Type-safe, extensible, backward compatible |
| **Immutability** | `withMetadata()` returns new instance | Functional, predictable, TypeScript-friendly |
| **Type Inference** | Automatic from `as const` values | Seamless DX, no annotations needed |
| **Registry Storage** | `Map<string, Metadata>` by name | O(1) lookups, full metadata storage |
| **Migration** | Deprecation + compatibility layer → clean break | Gradual transition, major version bump |
| **Arithmetic Behavior** | Metadata from result type (registry lookup) | Consistent, type-based metadata assignment |

---

## Implementation Risks & Mitigations

### Risk 1: Type Complexity
**Concern**: Generic type parameters might confuse users
**Mitigation**: Sensible defaults mean users rarely need to think about generics. Documentation focuses on simple cases first.

### Risk 2: Migration Burden
**Concern**: Users need to update all `unit.tag` references
**Mitigation**: Deprecation warnings, compatibility layer, comprehensive migration guide, and codemod script if needed.

### Risk 3: Registry Type Safety
**Concern**: Dynamic registry accessors (`registry.Celsius`) lose type safety
**Mitigation**: Declaration merging or code generation to maintain type safety for known units.

### Risk 4: Performance
**Concern**: Metadata adds runtime overhead
**Mitigation**: Metadata is optional; users not using metadata pay zero runtime cost. Map lookups are O(1).

---

## Open Questions (None)

All research questions have been resolved. Ready to proceed to Phase 1 (Design & Contracts).

---

**Next Phase**: Generate data-model.md, contracts/, and quickstart.md
