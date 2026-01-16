# Tasks: Support for Strongly Typed Unit Metadata

**Feature**: Support for Strongly Typed Unit Metadata
**Branch**: `enhance/002-support-strongly-typed`
**Date**: 2026-01-16
**Plan**: [plan.md](./plan.md)

---

## Overview

Add strongly typed metadata support to units, replacing the existing tag system. Metadata uses `{name: string} & Record<string, unknown>` as the default type, with automatic TypeScript type inference from provided values. The registry uses `Map<string, Metadata>` for O(1) lookups, and metadata is immutable with `withMetadata()` returning new instances.

**Test-Driven Development**: Per constitution principle III, tests MUST be written BEFORE implementation.

---

## Task Summary

**Total Tasks**: 36
- **Phase 1 (Setup)**: 2 tasks
- **Phase 2 (Core Types)**: 6 tasks (foundational)
- **Phase 3 (Unit Metadata)**: 8 tasks
- **Phase 4 (Registry Migration)**: 8 tasks
- **Phase 5 (Converters & Arithmetic)**: 6 tasks
- **Phase 6 (Documentation & Polish)**: 6 tasks

**Parallel Opportunities**: 15 tasks marked [P] (different files, no dependencies)

---

## Phase 1: Setup & Verification

**Goal**: Verify project setup and baseline

### Tasks

- [ ] T001 Run existing test suite to establish baseline (`pnpm test`)
- [ ] T002 Verify TypeScript compilation passes (`pnpm type-check`)

**Verification**: All existing tests pass, no TypeScript errors

---

## Phase 2: Core Type System (Foundational)

**Goal**: Add BaseMetadata type and generic type parameter to Unit types

**This phase MUST complete before other phases** - provides foundation for all metadata functionality.

### Tasks

- [ ] T003 Write failing test for BaseMetadata type constraint in tests/unit/metadata.test.ts
- [ ] T004 Define BaseMetadata type as `{name: string} & Record<string, unknown>` in src/types.ts
- [ ] T005 [P] Write failing test for Unit<TMetadata> generic parameter in tests/unit/type-inference.test.ts
- [ ] T006 Add generic type parameter `<TMetadata extends BaseMetadata = BaseMetadata>` to Unit interface in src/types.ts
- [ ] T007 [P] Add generic type parameter to all Unit-related types (UnitValue, UnitOptions, etc.) in src/types.ts
- [ ] T008 Verify tests T003 and T005 now pass (`pnpm test`)

**Verification**:
- BaseMetadata type enforces `name` property
- Unit types accept optional TMetadata parameter
- Default type is BaseMetadata
- TypeScript provides proper type checking

---

## Phase 3: Unit Class Metadata Support

**Goal**: Add metadata storage and accessor methods to Unit class

### Tasks

- [ ] T009 Write failing test for Unit constructor accepting metadata parameter in tests/unit/metadata.test.ts
- [ ] T010 Add private readonly `metadata: TMetadata` property to Unit class in src/unit.ts
- [ ] T011 Update Unit constructor to accept `metadata: TMetadata` parameter in src/unit.ts
- [ ] T012 [P] Write failing test for getMetadata() accessor in tests/unit/metadata.test.ts
- [ ] T013 Implement getMetadata(): TMetadata method in Unit class in src/unit.ts
- [ ] T014 [P] Write failing test for withMetadata() immutable updater in tests/unit/metadata.test.ts
- [ ] T015 Implement withMetadata<TNewMetadata>(metadata: TNewMetadata): Unit<TNewMetadata> in src/unit.ts
- [ ] T016 Write test verifying type inference from metadata value in tests/unit/type-inference.test.ts

**Verification**:
- Unit constructor accepts metadata parameter
- getMetadata() returns typed metadata
- withMetadata() returns new Unit instance (immutable)
- TypeScript infers metadata type from provided value

---

## Phase 4: Registry Migration

**Goal**: Migrate registry from string tags to Map<string, Metadata> structure

### Tasks

- [ ] T017 Write failing test for registry storing metadata objects in tests/integration/registry.test.ts
- [ ] T018 Update Registry class to use Map<string, Metadata> internal storage in src/registry.ts
- [ ] T019 Update register() method to accept metadata object and use metadata.name as key in src/registry.ts
- [ ] T020 [P] Write failing test for getMetadata(name: string) method in tests/integration/registry.test.ts
- [ ] T021 Implement getMetadata<T extends BaseMetadata>(name: string): T | undefined in src/registry.ts
- [ ] T022 [P] Write test for tag property deprecation warning in tests/migration.test.ts
- [ ] T023 Add deprecated `tag` getter to Unit class returning metadata.name with console.warn in src/unit.ts
- [ ] T024 Update unit creation functions (createUnit, defineUnit) to accept metadata parameter in src/unit.ts

**Verification**:
- Registry stores full metadata objects by name
- register() accepts metadata objects (not strings)
- getMetadata() returns metadata by name (O(1) lookup)
- Deprecated tag property warns users
- Unit creation functions support metadata

---

## Phase 5: Converters & Arithmetic Operations

**Goal**: Update converters and arithmetic to get metadata from result type

### Tasks

- [ ] T025 Write failing test for arithmetic operations getting metadata from result type in tests/unit/arithmetic.test.ts
- [ ] T026 Update arithmetic operations (add, subtract, multiply, divide) to lookup metadata from registry based on result dimensions in src/unit.ts
- [ ] T027 [P] Write failing test for converter metadata handling in tests/integration/converters.test.ts
- [ ] T028 [P] Update converters in src/converters/length.ts to assign metadata from result type
- [ ] T029 [P] Update converters in src/converters/mass.ts to assign metadata from result type
- [ ] T030 [P] Update converters in src/converters/temperature.ts to assign metadata from result type

**Verification**:
- Arithmetic results get metadata from registry (not operands)
- Converters assign metadata based on target unit type
- All converter tests pass

---

## Phase 6: Documentation & Polish

**Goal**: Update documentation, add examples, create changeset

### Tasks

- [ ] T031 [P] Update README.md with metadata usage examples (creation, access, withMetadata)
- [ ] T032 [P] Add migration guide to README.md or MIGRATION.md (tag → metadata.name)
- [ ] T033 [P] Update public exports in src/index.ts to include BaseMetadata type
- [ ] T034 Run full test suite and verify all tests pass (`pnpm test`)
- [ ] T035 Run type checking and verify no errors (`pnpm type-check`)
- [ ] T036 Create changeset describing breaking changes and migration path (`pnpm changeset`)

**Verification**:
- README includes metadata examples
- Migration guide is clear and actionable
- All quality gates pass (tests, types, lint, format)
- Changeset documents breaking change

---

## Dependencies

```
Phase 1 (Setup)
  └─> Phase 2 (Core Types) [BLOCKING]
       └─> Phase 3 (Unit Metadata)
       └─> Phase 4 (Registry Migration)
       └─> Phase 5 (Converters & Arithmetic)
       └─> Phase 6 (Documentation)
```

**Critical Path**: Phase 1 → Phase 2 → [Phases 3, 4, 5 in parallel] → Phase 6

---

## Parallel Execution Strategy

### After Phase 2 completes, these can run in parallel:

**Track A (Unit Metadata)**:
- T009-T016 (Phase 3)

**Track B (Registry Migration)**:
- T017-T024 (Phase 4)

**Track C (Converters)**:
- T025-T030 (Phase 5)

**Final (Sequential)**:
- T031-T036 (Phase 6 - after all tracks complete)

---

## Implementation Strategy

### MVP Scope (Minimum Viable Product)

**Goal**: Core metadata functionality without migration support

**Includes**:
- Phase 1: Setup
- Phase 2: Core Types (complete)
- Phase 3: Unit Metadata (tasks T009-T015, skip T016)
- Phase 4: Registry Migration (tasks T017-T021, skip deprecation T022-T024)
- Minimal Phase 6: Just T033-T035

**Excludes** (add in follow-up):
- Tag deprecation warnings (T022-T023)
- Type inference tests (T016)
- Arithmetic metadata (Phase 5)
- Documentation updates (T031-T032)
- Changeset (T036)

**MVP Deliverable**: Core metadata system with type safety, ~60% of full scope

### Incremental Delivery

1. **MVP Release**: Core metadata (Phase 2-3, partial Phase 4)
2. **Increment 1**: Add arithmetic metadata (Phase 5)
3. **Increment 2**: Add migration support (complete Phase 4)
4. **Increment 3**: Documentation & polish (complete Phase 6)

---

## Testing Checklist

Per constitution principle III (TDD), tests MUST be written before implementation:

- [x] **Test-first approach**: Every implementation task has corresponding test task BEFORE it
- [x] **Test coverage**: All acceptance criteria have associated tests
- [x] **Test types**:
  - Unit tests: metadata.test.ts, type-inference.test.ts, arithmetic.test.ts
  - Integration tests: registry.test.ts, converters.test.ts
  - Migration tests: migration.test.ts

**Test Execution**: `pnpm test`

---

## Quality Gates

All tasks must pass these gates before considered complete:

1. **Tests pass**: `pnpm test` ✅
2. **Types pass**: `pnpm type-check` ✅
3. **Lint passes**: `pnpm lint` ✅
4. **Format passes**: `pnpm format:check` ✅

---

## File Change Summary

### New Files (6)
- tests/unit/metadata.test.ts
- tests/unit/type-inference.test.ts
- tests/unit/arithmetic.test.ts
- tests/integration/registry.test.ts
- tests/integration/converters.test.ts
- tests/migration.test.ts

### Modified Files (7)
- src/types.ts (add BaseMetadata, generic parameters)
- src/unit.ts (add metadata property, getMetadata, withMetadata)
- src/registry.ts (migrate to Map<string, Metadata>)
- src/converters/length.ts (update for result-type metadata)
- src/converters/mass.ts (update for result-type metadata)
- src/converters/temperature.ts (update for result-type metadata)
- src/index.ts (export BaseMetadata)
- README.md (add examples, migration guide)

---

## Notes

**Breaking Changes**: This enhancement replaces the tag system with metadata.name. Requires major version bump per constitution principle IV.

**Performance**: Zero runtime overhead for users not using metadata. Map lookups are O(1).

**Type Safety**: Full TypeScript type inference from metadata values (no explicit type annotations needed).

**Immutability**: metadata is immutable - withMetadata() returns new Unit instances.

**Arithmetic Behavior**: Result metadata comes from registry lookup by dimensions, NOT from operands.

---

**Status**: Ready for implementation
**Next**: Start with Phase 1 (T001-T002) to establish baseline
