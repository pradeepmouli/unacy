# Research: Unacy Core Conversion Library

**Feature**: 001-unacy-core  
**Phase**: 0 - Research & Decision Log  
**Date**: 2026-01-06

## Overview

This document resolves all "NEEDS CLARIFICATION" items from the technical context and documents technology choices with rationale for the Unacy Core library.

## Research Questions & Resolutions

### 1. Type Branding Strategy

**Question**: How to implement compile-time-safe type branding for units and formats in TypeScript?

**Decision**: Use `type-fest`'s `Tagged<T, Tag, Label>` utility type

**Rationale**:
- `type-fest` is a well-maintained, zero-runtime-overhead library for advanced TypeScript patterns
- `Tagged` provides phantom typing that survives structural type checking
- Alternative considered: Custom branded types with `unique symbol` - rejected due to verbosity and maintenance burden
- `type-fest` is already used in the TypeScript ecosystem and has minimal footprint

**Alternatives Considered**:
- **Custom unique symbol branding**: More verbose; every brand requires a new symbol declaration
- **Nominal typing via classes**: Runtime overhead; conflicts with tree-shaking and pure function goals
- **String literal unions**: No compile-time guarantee of correctness; easy to bypass

### 2. Multi-Hop Conversion Algorithm

**Question**: How to auto-compose multi-hop conversions (A→C via A→B→C)?

**Decision**: Breadth-First Search (BFS) for shortest path in directed graph

**Rationale**:
- BFS guarantees shortest path for unweighted graphs → minimizes precision loss
- Time complexity O(V+E) where V=units, E=converters; acceptable for typical graphs (<100 units)
- Cycle detection built-in via visited set
- Alternative DFS: doesn't guarantee shortest path; Dijkstra: overkill for unweighted graph

**Implementation Approach**:
- Represent registry as adjacency list: `Map<UnitId, Map<UnitId, Converter>>`
- On lookup: check direct converter first (O(1)), fallback to BFS if not found
- Cache composed paths to amortize cost for repeated conversions
- Limit max path depth to 5 to prevent runaway searches

**Alternatives Considered**:
- **Dijkstra's algorithm**: Over-engineered for unweighted graph; no precision weights defined yet
- **Floyd-Warshall**: O(V³) preprocessing; too expensive for dynamic registry
- **Manual chaining only**: Poor UX; defeats purpose of registry

### 3. Runtime Validation for Parsers

**Question**: How to validate and parse strings into tagged format types safely?

**Decision**: Use Zod for schema validation in parser implementations

**Rationale**:
- Zod provides runtime validation with TypeScript inference
- Already common in TypeScript ecosystem; tree-shakeable
- Produces clear error messages for validation failures
- Integrates cleanly with `WithFormat` types via `.transform()`

**Pattern**:
```typescript
const celsiusParser: Parser<WithFormat<number, 'Celsius'>> = (input: string) => {
  const schema = z.string().regex(/^-?\d+(\.\d+)?°C$/)
    .transform(s => parseFloat(s.replace('°C', '')));
  return schema.parse(input) as WithFormat<number, 'Celsius'>;
};
```

**Alternatives Considered**:
- **Custom validation**: More code to maintain; error messages less consistent
- **io-ts**: More functional style; steeper learning curve; less popular than Zod
- **No validation (trust input)**: Violates FR-008 (clear errors required)

### 4. Fluent API Design

**Question**: How to provide ergonomic, fluent API for defining and chaining converters?

**Decision**: Builder pattern with method chaining for registry operations

**Rationale**:
- Fluent APIs reduce boilerplate and improve readability
- Method chaining allows progressive disclosure of options
- TypeScript inference works well with builder patterns

**Pattern**:
```typescript
const registry = createRegistry<'m' | 'km' | 'mi'>()
  .register('m', 'km', m => (m / 1000) as WithUnits<number, 'km'>)
  .register('km', 'mi', km => (km * 0.621371) as WithUnits<number, 'mi'>);

// Usage
const meters = 5000 as WithUnits<number, 'm'>;
const miles = registry.convert(meters).to('mi');
```

**Alternatives Considered**:
- **Functional composition**: More explicit but verbose for typical use cases
- **Class-based registry**: Requires `new` keyword; less tree-shakeable
- **Separate register/convert functions**: Loses type inference across calls

### 5. Cycle Detection & Prevention

**Question**: How to handle cyclic conversion paths (A→B→C→A)?

**Decision**: Track visited nodes in BFS; throw error if cycle detected during path search

**Rationale**:
- Cycles indicate logical error in converter definitions
- Fail fast at conversion time rather than producing incorrect results
- Visited set in BFS naturally detects cycles (revisiting a node = cycle)

**Error Handling**:
- Throw `ConversionCycleError` with cycle path for debugging
- Document in API that cycles are invalid and will error

**Alternatives Considered**:
- **Allow cycles**: Ambiguous semantics; which path is "correct"?
- **Cycle prevention at registration**: More complex; requires full graph analysis on every register

### 6. Type Inference & Compile-Time Safety

**Question**: How to maximize compile-time errors for invalid conversions?

**Decision**: Use conditional types and template literal types to enforce valid unit pairs

**Rationale**:
- TypeScript 5.9 has robust template literal type support
- `ConverterRegistry<Units>` generic constrains available units at type level
- `convert<FromUnit, ToUnit>` method constrains FromUnit/ToUnit to registered units
- Invalid combinations fail at compile time with clear error messages

**Pattern**:
```typescript
type ConverterRegistry<Units extends PropertyKey> = {
  convert<From extends Units, To extends Exclude<Units, From>>(
    value: WithUnits<unknown, From>
  ): { to(unit: To): WithUnits<unknown, To> };
};
```

**Alternatives Considered**:
- **Runtime-only validation**: Defeats purpose of type safety
- **Loose types with documentation**: Easy to misuse; no compile-time guarantees

## Technology Stack Summary

| Component | Technology | Version | Justification |
|-----------|-----------|---------|---------------|
| Type Branding | `type-fest` | ^5.3.1 | Zero-overhead phantom typing via `Tagged` |
| Runtime Validation | `zod` | ^3.x | Schema validation for parsers with TS inference |
| Testing | `vitest` | ^4.0.16 | Fast, ESM-native, supports `expectTypeOf` |
| Graph Algorithms | Custom (utils/graph.ts) | N/A | BFS for shortest-path conversion composition |

## Best Practices & Patterns

### Type Branding
- Use `Tagged<BaseType, 'BrandCategory', 'BrandValue'>` consistently
- Export branded types from `types.ts` for reuse
- Document that brands are compile-time only (zero runtime cost)

### Converter Registration
- Prefer bidirectional converters when possible (reduces registry size)
- Document precision loss for multi-hop paths
- Validate converter correctness via round-trip tests

### Error Handling
- Throw typed errors: `ConversionError`, `ParseError`, `CycleError`
- Include context in error messages (from/to units, input value)
- Surface TypeScript compile errors for invalid type usage

### Performance
- Cache computed conversion paths (memoization)
- Use structural sharing for registry (immutable updates)
- Profile with graphs of 100+ units to ensure <1s type-check time

## Follow-Up Actions for Phase 1

1. Define core branded types in `types.ts` using `type-fest`
2. Sketch `ConverterRegistry` interface with fluent API
3. Design `Converter` and `BidirectionalConverter` function signatures
4. Create example usage in `quickstart.md` demonstrating all patterns
5. Draft data model showing relationships between types, converters, and registry

---

**Research Complete**: All technical unknowns resolved. Ready for Phase 1 (Design).
