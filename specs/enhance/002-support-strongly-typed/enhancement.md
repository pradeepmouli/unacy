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
- Q: What should be the default type for the metadata generic parameter when not explicitly specified? → A: Record<string, unknown>, but should consider combining with the current unit tag system, in which case it should extend {name: string} & Record<string, unknown>. Note: Name would take place of existing unit tag.
- Q: Should metadata be immutable or allow updates after a unit is created? → A: Immutable with withMetadata() method that returns a new unit instance with updated metadata
- Q: When performing unit arithmetic operations, how should metadata be handled? → A: Metadata comes from the result's type. MVP: metadata is only known to the type system and at runtime to the registry (not preserved from operands during arithmetic)
- Q: When creating a unit, how should TypeScript infer the metadata type if not explicitly specified? → A: Infer from provided metadata value - TypeScript infers the specific type from the metadata object passed, falls back to default if not provided. Example: register(Celsius, Kelvin, ...) where const Celsius = {name: 'Celsius' as const, ...} instead of register('Celsius', 'Kelvin', ...)
- Q: How should the registry internally store and look up metadata at runtime? → A: Map by name property, store full metadata - use metadata.name as key, store complete metadata object as value for efficient lookups

## Proposed Changes
- Add a generic metadata type parameter to core Unit types and interfaces (default: `{name: string} & Record<string, unknown>`)
- Replace existing unit tag system with metadata's `name` property (metadata.name takes place of current tag)
- Implement metadata as type-level and registry-level information (MVP: metadata known to type system and runtime registry)
- Update registry to accept metadata objects instead of string literals (e.g., `register(Celsius, Kelvin, ...)` where `const Celsius = {name: 'Celsius' as const, ...}`)
- Implement immutable metadata storage with accessor methods on Unit class (`getMetadata()`, `withMetadata()`)
- Update unit creation functions (createUnit, defineUnit, etc.) to accept optional metadata parameter with automatic type inference
- TypeScript infers metadata type from provided value; falls back to default type if not provided
- Ensure metadata is properly typed and accessible throughout the unit lifecycle
- `withMetadata()` returns a new unit instance with updated metadata (immutable pattern)
- Metadata comes from result's type in arithmetic operations (not preserved from operands)
- Maintain backward compatibility by making metadata optional

**Files to Modify**:
- src/types.ts - Add generic metadata type parameter to Unit-related types, migrate tag system to metadata.name
- src/unit.ts - Add immutable metadata property and accessor methods (getMetadata, withMetadata) to Unit class, replace tag with metadata.name
- src/registry.ts - Update registry to use Map<string, Metadata> structure (key by metadata.name, store full metadata object), migrate from tag to metadata.name
- src/converters/*.ts - Ensure converters assign metadata based on result type (metadata comes from result type, not operands)
- tests/metadata.test.ts - Comprehensive test suite for metadata functionality (creation, access, type safety, immutability, type-level behavior)
- tests/migration.test.ts - Test migration path from tag system to metadata.name
- tests/arithmetic.test.ts - Test that arithmetic operations get metadata from result type, not operands

**Breaking Changes**: [x] Yes | [ ] No
This replaces the existing unit tag system with metadata's `name` property. The metadata type parameter defaults to `{name: string} & Record<string, unknown>`. Migration path: existing tag references need to change to metadata.name. A compatibility layer may be needed temporarily. The change is breaking for code that directly accesses the tag property, but maintains runtime compatibility through migration support.

## Implementation Plan

**Phase 1: Implementation**

**Tasks**:
1. [ ] Define metadata type interface with default `{name: string} & Record<string, unknown>` and add generic parameter to Unit types in src/types.ts
2. [ ] Add immutable metadata property and accessor methods (getMetadata, withMetadata) to Unit class in src/unit.ts
3. [ ] Replace existing tag property with metadata.name throughout Unit class, maintaining immutability pattern
4. [ ] Update unit creation functions to accept optional metadata parameter with automatic type inference (infer from value, fallback to default) and migrate tag parameter to metadata.name
5. [ ] Update registry to use Map<string, Metadata> structure (key by metadata.name, store full metadata object) for runtime storage in src/registry.ts
6. [ ] Ensure converters assign metadata based on result type (metadata from result type, not operands) when creating derived units
7. [ ] Implement arithmetic operations to get metadata from result type, not from operands
8. [ ] Add comprehensive unit tests for metadata functionality (creation, access, type safety, immutability, withMetadata behavior, type-level behavior, automatic type inference)
9. [ ] Add tests for arithmetic operations to verify metadata comes from result type
10. [ ] Add migration tests to verify tag-to-metadata.name migration path works correctly
11. [ ] Update README or documentation with metadata usage examples, migration guide, and explanation of metadata in arithmetic operations
12. [ ] Verify all existing tests pass and update tests that reference tag to use metadata.name

**Acceptance Criteria**:
- [ ] Units can be created with strongly typed metadata using an optional metadata parameter with default type `{name: string} & Record<string, unknown>`
- [ ] Metadata is immutable - `withMetadata()` returns a new unit instance with updated metadata
- [ ] Metadata is accessible via type-safe accessor methods (getMetadata, withMetadata) with proper TypeScript inference
- [ ] TypeScript automatically infers metadata type from provided value; falls back to default if not provided
- [ ] Metadata is known to type system and runtime registry (MVP implementation)
- [ ] Arithmetic operations get metadata from result type, not from operands
- [ ] Existing tag system is replaced by metadata.name throughout the codebase
- [ ] Migration path from tag to metadata.name is clear and tested
- [ ] All tests pass, including new metadata-specific tests, arithmetic tests, and migration tests
- [ ] TypeScript provides proper type checking and autocomplete for metadata properties
- [ ] Documentation includes clear examples of metadata usage patterns, arithmetic behavior, and migration guide from tag system

## Testing
- [ ] Unit tests added for metadata creation and access via getMetadata()
- [ ] Unit tests verify immutability and withMetadata() returns new instances
- [ ] Unit tests verify type safety and TypeScript inference (automatic type inference from provided metadata value, fallback to default)
- [ ] Unit tests verify metadata is known to type system and runtime registry
- [ ] Arithmetic operation tests verify metadata comes from result type, not operands
- [ ] Integration tests verify metadata behavior through unit operations and converters
- [ ] Migration tests verify tag-to-metadata.name transition works correctly
- [ ] Manual testing of complex metadata scenarios (nested types, optional properties, custom metadata shapes)
- [ ] Edge cases verified (undefined metadata, empty metadata, immutable behavior verification, arithmetic with different metadata types)

## Verification Checklist
- [ ] Changes implemented as described
- [ ] Tests written and passing
- [ ] No regressions in existing functionality
- [ ] Documentation updated with metadata examples
- [ ] Code follows existing patterns and conventions

## Notes
- Metadata is immutable with withMetadata() pattern (decision: immutability promotes functional patterns and predictability)
- Metadata replaces existing tag system - metadata.name takes place of current tag property
- Default metadata type: `{name: string} & Record<string, unknown>` ensures name is always present
- Type inference: TypeScript automatically infers metadata type from the provided value; uses default type when metadata is not provided (no explicit type annotation required)
- MVP: Metadata is type-level and registry-level information (known to type system and runtime registry)
- Registry storage: Map<string, Metadata> structure where metadata.name is the key and full metadata object is the value for efficient lookups
- Arithmetic operations: metadata comes from result type, NOT from operands (e.g., velocity * time = distance, distance gets its own metadata based on its type)
- Ensure metadata doesn't impact performance for users who don't use it
- Consider providing migration utilities or deprecation warnings for tag system transition
- Documentation should clearly explain that arithmetic results get metadata from their result type, not from input operands

---
*Enhancement created using `/enhance` workflow - See .specify/extensions/workflows/enhance/*
