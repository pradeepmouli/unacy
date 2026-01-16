# Tasks: Support for Strongly Typed Unit Metadata

**Feature**: Support for Strongly Typed Unit Metadata
**Branch**: `enhance/002-support-strongly-typed`
**Date**: 2026-01-16
**Plan**: [plan.md](./plan.md)

---

## Overview

Add strongly typed metadata support to the branded type system (`WithUnits<T, U, M>`). Metadata uses `BaseMetadata` = `{name: string} & Record<string, unknown>` as the default type, with automatic TypeScript type inference from provided values. The registry stores metadata objects using `Map<string, BaseMetadata>` for O(1) lookups, and metadata is accessed via the `UnitAccessor` pattern.

**Architecture**: This codebase uses branded types (`WithUnits`), not runtime class instances. Metadata is stored in the registry and accessed via `UnitAccessor` properties.

**Test-Driven Development**: Per constitution principle III, tests MUST be written BEFORE implementation.

---

## Task Summary

**Total Tasks**: 20 (revised for branded type architecture)
- **Phase 1 (Setup)**: 2 tasks [COMPLETE ✅]
- **Phase 2 (Core Types)**: 6 tasks [COMPLETE ✅]
- **Phase 3 (Registry Integration)**: 6 tasks
- **Phase 4 (UnitAccessor Enhancement)**: 3 tasks
- **Phase 5 (Documentation & Polish)**: 3 tasks

**Parallel Opportunities**: 8 tasks marked [P] (different files, no dependencies)

---

## Phase 1: Setup & Verification ✅

**Goal**: Verify project setup and baseline

### Tasks

- [x] T001 Run existing test suite to establish baseline (`pnpm test`) - **94 passing tests**
- [x] T002 Verify TypeScript compilation passes (`pnpm type-check`) - **No errors**

**Verification**: ✅ All existing tests pass, no TypeScript errors

**Status**: COMPLETE (2026-01-16)

---

## Phase 2: Core Type System (Foundational) ✅

**Goal**: Add BaseMetadata type and generic type parameter to WithUnits branded type

**This phase MUST complete before other phases** - provides foundation for all metadata functionality.

### Tasks

- [x] T003 Write failing test for BaseMetadata type constraint in __tests__/metadata.test.ts
- [x] T004 Define BaseMetadata type as `{name: string} & Record<string, unknown>` in src/types.ts
- [x] T005 [P] Write failing test for WithUnits<TMetadata> generic parameter in __tests__/type-inference.test.ts
- [x] T006 Update `WithUnits` type signature to `WithUnits<T, U, M extends BaseMetadata = BaseMetadata>` in src/types.ts
- [x] T007 [P] Add BaseMetadata constraint to all related types (`WithDefinition`, `OptionalWithUnits`, `UnitsOf`, `UnitsFor`) in src/types.ts
- [x] T008 Verify tests T003 and T005 now pass (`pnpm test`) - **110 passing tests (16 new)**
- [x] T009 Export BaseMetadata from public API (src/index.ts)

**Verification**: ✅
- BaseMetadata type enforces `name` property
- WithUnits accepts optional M type parameter (defaults to BaseMetadata)
- All related types updated with BaseMetadata constraint
- TypeScript provides proper type checking and inference
- Public API exports BaseMetadata for user consumption

**Status**: COMPLETE (2026-01-16)
**Commit**: 466ae6e "feat: add BaseMetadata type and update WithUnits type system"

---

## Phase 3: Registry Integration

**Goal**: Update registry to store and manage metadata objects

### Tasks

- [ ] T010 Write failing test for registry storing metadata objects in __tests__/registry.test.ts
- [ ] T011 Add internal `Map<string, BaseMetadata>` storage to registry implementation in src/registry.ts
- [ ] T012 [P] Write failing test for accessing metadata via registry in __tests__/registry.test.ts
- [ ] T013 Implement metadata getter methods on registry to retrieve metadata by unit name
- [ ] T014 [P] Write test for register() accepting metadata objects as first parameter in __tests__/registry.test.ts
- [ ] T015 Update register() method signature to accept metadata objects (with name property) instead of string unit names

**Verification**:
- Registry stores metadata objects internally using Map<string, BaseMetadata>
- Metadata can be retrieved by unit name (O(1) lookup)
- register() method accepts metadata objects with name property
- TypeScript infers metadata type from registered object

---

## Phase 4: UnitAccessor Enhancement

**Goal**: Enable type-safe metadata access via UnitAccessor pattern

### Tasks

- [ ] T016 [P] Write test for UnitAccessor exposing metadata properties in __tests__/registry.test.ts
- [ ] T017 Update UnitAccessor type definition to expose metadata properties (e.g., `registry.Celsius.symbol`)
- [ ] T018 Enhance addMetadata() method to properly store and link metadata to unit accessors

**Verification**:
- UnitAccessor provides type-safe access to metadata properties
- addMetadata() properly stores metadata objects
- TypeScript autocomplete works for metadata properties on registry accessors
- Example: `registry.Celsius.name`, `registry.Celsius.symbol` are fully typed

---

## Phase 5: Documentation & Polish

**Goal**: Update documentation and finalize implementation

### Tasks

- [ ] T019 [P] Update README with branded type metadata usage examples
- [ ] T020 Run full test suite and verify all tests pass (`pnpm test`)
- [ ] T021 Run type checking and verify no errors (`pnpm type-check`)

**Verification**:
- README includes clear examples of metadata with branded types
- Examples show registry pattern with metadata objects
- All quality gates pass (tests, types)

---

## Dependencies

```
Phase 1 (Setup) ✅
  └─> Phase 2 (Core Types) ✅ [BLOCKING - COMPLETE]
       └─> Phase 3 (Registry Integration)
       └─> Phase 4 (UnitAccessor Enhancement)
       └─> Phase 5 (Documentation)
```

**Critical Path**: Phase 1 ✅ → Phase 2 ✅ → Phase 3 → Phase 4 → Phase 5

**Parallel Opportunities**: After Phase 2, Phase 3 and Phase 4 can run in parallel

---

## Implementation Strategy

### Current Status

**Completed** ✅:
- Phase 1: Setup & Verification (T001-T002)
- Phase 2: Core Type System (T003-T009) - Foundational work complete

**In Progress**:
- Phase 3: Registry Integration

**Remaining**:
- Phase 4: UnitAccessor Enhancement
- Phase 5: Documentation & Polish

### Incremental Delivery

1. **Core Types** ✅: BaseMetadata type and WithUnits integration (Phase 1-2)
2. **Registry Integration**: Metadata storage and retrieval (Phase 3)
3. **UnitAccessor Enhancement**: Type-safe metadata access (Phase 4)
4. **Documentation**: Examples and guides (Phase 5)

---

## Testing Checklist

Per constitution principle III (TDD), tests MUST be written before implementation:

- [x] **Test-first approach**: Every implementation task has corresponding test task BEFORE it
- [x] **Test coverage**: All acceptance criteria have associated tests
- [x] **Test types**:
  - Type-level tests: metadata.test.ts (BaseMetadata constraints)
  - Type inference tests: type-inference.test.ts (WithUnits metadata parameter)
  - Integration tests: registry.test.ts (metadata storage and access)

**Test Execution**: `pnpm test`
**Current Status**: 110 passing tests (16 new metadata/type tests)

---

## Quality Gates

All tasks must pass these gates before considered complete:

1. **Tests pass**: `pnpm test` ✅
2. **Types pass**: `pnpm type-check` ✅
3. **Lint passes**: `pnpm lint` ✅
4. **Format passes**: `pnpm format:check` ✅

---

## File Change Summary

### New Files (2) ✅
- packages/core/src/__tests__/metadata.test.ts - BaseMetadata type constraint tests
- packages/core/src/__tests__/type-inference.test.ts - WithUnits metadata type inference tests

### Modified Files (2) ✅
- packages/core/src/types.ts - Added BaseMetadata type, updated WithUnits and related types with metadata parameter
- packages/core/src/index.ts - Exported BaseMetadata from public API

### Pending Modifications
- packages/core/src/registry.ts - Add Map<string, BaseMetadata> storage, update register() signature, enhance UnitAccessor
- packages/core/src/__tests__/registry.test.ts - Add integration tests for metadata storage/access
- README.md - Add branded type metadata usage examples

---

## Notes

**Architecture**: Branded type system (`WithUnits<T, U, M>`) not runtime class instances. Metadata stored in registry, accessed via UnitAccessor.

**Breaking Changes**: WithUnits third parameter now requires BaseMetadata (with name property). Requires major version bump per constitution principle IV.

**Performance**: Zero runtime overhead for users not using metadata. Map lookups are O(1).

**Type Safety**: Full TypeScript type inference from metadata values (no explicit type annotations needed).

**Current Progress**: Phase 1 and Phase 2 complete (core type foundation in place).

---

**Status**: Phase 1-2 Complete ✅ | Phase 3 In Progress
**Next**: Phase 3 (Registry Integration) - Update registry to store and manage metadata objects
**Commit**: 466ae6e "feat: add BaseMetadata type and update WithUnits type system"
