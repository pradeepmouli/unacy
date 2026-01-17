# Enhancement: Support for Strongly Typed Unit Metadata

**Enhancement ID**: enhance-002
**Branch**: `enhance/002-support-strongly-typed`
**Created**: 2026-01-16
**Priority**: [ ] High | [x] Medium | [ ] Low
**Component**: Unit system / Type definitions
**Status**: [x] Planned | [ ] In Progress | [ ] Complete

## Input
User description: "add support for strongly typed unit metadata"

## Overview
Add support for strongly typed metadata that can be associated with units. This will allow developers to attach custom information (such as display names, descriptions, documentation URLs, or domain-specific properties) to units while maintaining full TypeScript type safety.

## Motivation
Currently, there's no standardized way to attach metadata to units in a type-safe manner. This enhancement addresses use cases where developers need to:
- Store display-friendly names for units (e.g., "meters per second" for m/s)
- Attach documentation or help text to units
- Associate custom domain-specific properties with units
- Maintain type safety when accessing metadata throughout the application

This feature enables richer unit definitions while preserving the type safety that makes unacy valuable.

## Clarifications

### Session 2026-01-16
- Q: What should be the default type for the metadata generic parameter when not explicitly specified? → A: `BaseMetadata` = `{name: string} & Record<string, unknown>`. The name property is required (replaces tag system concept).
- Q: How is metadata stored in a branded type system? → A: Metadata stored in registry at runtime, not on branded values themselves (branded types are compile-time only). Registry uses `Map<string, BaseMetadata>` keyed by metadata.name.
- Q: When creating a unit type, how should TypeScript infer the metadata type? → A: Infer from provided metadata value - TypeScript infers the specific type from the metadata object passed. Example: `WithUnits<number, 'Celsius', typeof CelsiusMetadata>` where `const CelsiusMetadata = {name: 'Celsius' as const, symbol: '°C'}`.
- Q: How should the registry internally store and look up metadata at runtime? → A: Map by name property, store full metadata - use metadata.name as key, store complete metadata object as value for O(1) lookups.
- Q: How is metadata accessed? → A: Via `UnitAccessor` pattern on registry (e.g., `registry.Celsius.symbol` or `registry.addMetadata({name: 'Celsius', symbol: '°C'})`).

**Additional Context**:
- Metadata values should be directly accessible on the unit accessors in a strongly typed way (not just through getMetadata()). Example: `registry.Celsius.name` directly accesses the name property

## Proposed Changes
- Add a generic metadata type parameter `M` to `WithUnits<T, U, M>` branded type (default: `BaseMetadata` = `{name: string} & Record<string, unknown>`)
- Update all related types (`WithDefinition`, `OptionalWithUnits`, `UnitsOf`, `UnitsFor`, etc.) to support metadata parameter
- Update registry to store metadata objects internally using `Map<string, BaseMetadata>` (key by metadata.name)
- Update registry `register()` method to accept metadata objects instead of string unit names
- Metadata values accessible via `UnitAccessor` pattern on registry (e.g., `registry.Celsius` returns metadata object)
- Support `addMetadata()` method on UnitAccessor to attach/update metadata for registered units
- TypeScript infers metadata type from provided value; falls back to `BaseMetadata` if not provided
- Ensure metadata is properly typed and accessible throughout conversions
- Metadata stored at registry level, not on individual branded values (branded types are compile-time only)
- Maintain backward compatibility by making metadata optional

**Architecture Note**:
This codebase uses a **branded type system** (`WithUnits<T, U, M>`) rather than runtime class instances. Metadata is stored in the registry and accessed via the `UnitAccessor` pattern, not via instance methods.

**Files to Modify**:
- packages/core/src/types.ts - Add BaseMetadata type, update WithUnits and related types to include metadata generic parameter
- packages/core/src/registry.ts - Update registry to store metadata objects, modify register() signature, enhance UnitAccessor pattern
- packages/core/src/index.ts - Export BaseMetadata type
- packages/core/src/__tests__/metadata.test.ts - Test suite for BaseMetadata type constraints
- packages/core/src/__tests__/type-inference.test.ts - Test suite for metadata type inference with WithUnits
- packages/core/src/__tests__/registry.test.ts - Integration tests for registry metadata storage and access

**Breaking Changes**: [x] Yes | [ ] No
This replaces the existing unit tag system with metadata's `name` property. The metadata type parameter defaults to `{name: string} & Record<string, unknown>`. Migration path: existing tag references need to change to metadata.name. A compatibility layer may be needed temporarily. The change is breaking for code that directly accesses the tag property, but maintains runtime compatibility through migration support.

## Implementation Plan

**Phase 1: Implementation**

**Tasks**:
1. [x] Define `BaseMetadata` type as `{name: string} & Record<string, unknown>` in src/types.ts
2. [x] Add metadata generic parameter `M extends BaseMetadata` to `WithUnits<T, U, M>` type
3. [x] Update all related types (`WithDefinition`, `OptionalWithUnits`, `UnitsOf`, `UnitsFor`) to support metadata parameter
4. [x] Export `BaseMetadata` from public API (src/index.ts)
5. [x] Add comprehensive tests for BaseMetadata type constraints (metadata.test.ts)
6. [x] Add tests for type inference with metadata generic parameter (type-inference.test.ts)
7. [ ] Update registry internal storage to use `Map<string, BaseMetadata>` for metadata objects
8. [ ] Modify `register()` method signature to accept metadata objects (first parameter becomes metadata object with name property)
9. [ ] Update `UnitAccessor` type to expose metadata properties in type-safe way
10. [ ] Enhance `addMetadata()` method to properly store and retrieve metadata objects
11. [ ] Add registry integration tests for metadata storage and retrieval
12. [ ] Update documentation with branded type metadata usage examples

**Acceptance Criteria**:
- [x] `WithUnits<T, U, M>` type accepts metadata generic parameter with default `BaseMetadata`
- [x] `BaseMetadata` type requires `name` property and allows extensible properties via `Record<string, unknown>`
- [x] All related types (`WithDefinition`, `OptionalWithUnits`, etc.) support metadata parameter
- [x] TypeScript automatically infers metadata type from provided value; falls back to `BaseMetadata` if not provided
- [x] BaseMetadata exported from public API for user type definitions
- [x] Comprehensive type-level tests verify metadata constraints and inference
- [ ] Registry stores metadata objects internally using `Map<string, BaseMetadata>`
- [ ] `register()` method accepts metadata objects as first parameter (with name property)
- [ ] `UnitAccessor` pattern provides type-safe access to metadata properties (e.g., `registry.Celsius.symbol`)
- [ ] `addMetadata()` method properly stores metadata objects in registry
- [ ] All tests pass, including new metadata-specific tests and registry integration tests
- [ ] TypeScript provides proper type checking and autocomplete for metadata properties
- [ ] Documentation includes clear examples using branded type system with metadata

## Testing
- [x] Type-level tests for BaseMetadata constraints (requires name property, allows extension)
- [x] Type inference tests for WithUnits metadata parameter (automatic inference, fallback to default)
- [x] Compile-time tests verify metadata type checking works correctly
- [ ] Registry integration tests for metadata storage and retrieval
- [ ] UnitAccessor tests verify type-safe metadata property access
- [ ] addMetadata() tests verify metadata can be attached to registered units
- [ ] Converter tests verify metadata is preserved through conversions
- [ ] Edge cases verified (missing metadata, complex nested metadata, multiple units with different metadata types)

## Verification Checklist
- [ ] Changes implemented as described
- [ ] Tests written and passing
- [ ] No regressions in existing functionality
- [ ] Documentation updated with metadata examples
- [ ] Code follows existing patterns and conventions

## Notes
- **Architecture**: Uses branded type system (`WithUnits<T, U, M>`) not runtime class instances
- **Metadata storage**: Stored in registry `Map<string, BaseMetadata>`, not on branded values (branded types are compile-time only)
- **Default metadata type**: `BaseMetadata` = `{name: string} & Record<string, unknown>` ensures name is always present
- **Type inference**: TypeScript automatically infers metadata type from provided value; uses `BaseMetadata` when not provided
- **Registry pattern**: Metadata accessed via `UnitAccessor` (e.g., `registry.Celsius.symbol`)
- **Type safety**: Full TypeScript autocomplete and type checking for metadata properties
- **Performance**: Zero runtime overhead for users who don't use metadata (type-level only)
- **Backward compatibility**: Metadata parameter is optional, defaults to `BaseMetadata`

---
*Enhancement created using `/enhance` workflow - See .specify/extensions/workflows/enhance/*
