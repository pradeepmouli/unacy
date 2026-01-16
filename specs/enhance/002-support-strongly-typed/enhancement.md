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

## Proposed Changes
- Add a generic metadata type parameter to core Unit types and interfaces
- Implement metadata storage and accessor methods on Unit class
- Update unit creation functions (createUnit, defineUnit, etc.) to accept optional metadata
- Ensure metadata is properly typed and accessible throughout the unit lifecycle
- Maintain backward compatibility by making metadata optional

**Files to Modify**:
- src/types.ts - Add generic metadata type parameter to Unit-related types
- src/unit.ts - Add metadata property and accessor methods to Unit class
- src/registry.ts - Update registry to properly handle and preserve metadata
- src/converters/*.ts - Ensure converters preserve metadata when creating derived units
- tests/metadata.test.ts - Comprehensive test suite for metadata functionality

**Breaking Changes**: [x] Yes | [ ] No
This adds a generic type parameter to Unit types, but it's optional with a default value (e.g., `unknown` or `Record<string, unknown>`), so existing code will continue to work without modifications. The change is technically breaking at the type level but maintains runtime compatibility.

## Implementation Plan

**Phase 1: Implementation**

**Tasks**:
1. [ ] Define metadata type interfaces and add generic type parameter to Unit types in src/types.ts
2. [ ] Add metadata property and accessor methods (getMetadata, withMetadata) to Unit class in src/unit.ts
3. [ ] Update unit creation functions to accept and store optional metadata parameter
4. [ ] Ensure converters and unit operations properly handle and preserve metadata
5. [ ] Add comprehensive unit tests for metadata functionality (creation, access, type safety)
6. [ ] Update README or documentation with metadata usage examples
7. [ ] Verify all existing tests pass and backward compatibility is maintained

**Acceptance Criteria**:
- [ ] Units can be created with strongly typed metadata using an optional metadata parameter
- [ ] Metadata is accessible via type-safe accessor methods with proper TypeScript inference
- [ ] Existing code continues to work without modifications (backward compatible)
- [ ] All tests pass, including new metadata-specific tests
- [ ] TypeScript provides proper type checking and autocomplete for metadata properties
- [ ] Documentation includes clear examples of metadata usage patterns

## Testing
- [ ] Unit tests added for metadata creation and access
- [ ] Unit tests verify type safety and TypeScript inference
- [ ] Integration tests verify metadata preservation through unit operations
- [ ] Manual testing of complex metadata scenarios (nested types, optional properties)
- [ ] Edge cases verified (undefined metadata, empty metadata, metadata merging)

## Verification Checklist
- [ ] Changes implemented as described
- [ ] Tests written and passing
- [ ] No regressions in existing functionality
- [ ] Documentation updated with metadata examples
- [ ] Code follows existing patterns and conventions

## Notes
- Consider whether metadata should be immutable or allow updates
- Evaluate if metadata should be preserved through unit arithmetic operations
- Consider adding a metadata builder pattern for complex metadata objects
- Ensure metadata doesn't impact performance for users who don't use it

---
*Enhancement created using `/enhance` workflow - See .specify/extensions/workflows/enhance/*
