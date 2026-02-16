# Tasks: Non-Primitive Type Support

**Branch**: `001-non-primitive-types`  
**Input**: Design documents from `/specs/001-non-primitive-types/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: Following TDD (Test-Driven Development) - Constitution requirement. Tests will be written BEFORE implementation for each user story.

**Organization**: Tasks are grouped by user story (US1-US4) to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and validation infrastructure

- [ ] T001 Validate existing project structure in packages/core/
- [ ] T002 [P] Add type-fest usage imports to packages/core/src/types.ts
- [ ] T003 [P] Create packages/core/src/type-inference.ts stub file for schema-to-type utilities

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core type system extensions that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T004 Extend `PrimitiveType` to create `SupportedType` union in packages/core/src/types.ts
- [ ] T005 [P] Add `NonPrimitiveType` category types (EnumType, ClassType, RecordSchema, TupleSchema) in packages/core/src/types.ts
- [ ] T006 [P] Add base metadata extension types (ExtendedTypedMetadata) in packages/core/src/types.ts
- [ ] T007 Create validation infrastructure file packages/core/src/utils/validation.ts with type guard stubs
- [ ] T008 [P] Add type inference utilities (InferFromRecordSchema, InferFromTupleSchema, PrimitiveTypeFromName) in packages/core/src/type-inference.ts
- [ ] T009 Update WithUnits type to support extended metadata in packages/core/src/types.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Enum-Based Units (Priority: P1) 🎯 MVP

**Goal**: Enable TypeScript enums as unit types with runtime enum object storage

**Independent Test**: Register a LogLevel enum, create branded values with enum members, verify metadata contains enum reference

### Tests for User Story 1 (TDD - Write First) ⚠️

> **TDD: Write these tests FIRST, ensure they FAIL, then implement**

- [ ] T010 [P] [US1] Create test file packages/core/src/__tests__/enum-units.test.ts with basic enum registration test (MUST FAIL)
- [ ] T011 [P] [US1] Add numeric enum test case in packages/core/src/__tests__/enum-units.test.ts (MUST FAIL)
- [ ] T012 [P] [US1] Add string enum test case in packages/core/src/__tests__/enum-units.test.ts (MUST FAIL)
- [ ] T013 [P] [US1] Add mixed enum rejection test in packages/core/src/__tests__/enum-units.test.ts (MUST FAIL)
- [ ] T014 [P] [US1] Add empty enum test in packages/core/src/__tests__/enum-units.test.ts (MUST FAIL)
- [ ] T015 [P] [US1] Add enum metadata introspection test in packages/core/src/__tests__/enum-units.test.ts (MUST FAIL)

### Implementation for User Story 1

- [ ] T016 [P] [US1] Implement EnumTypedMetadata type in packages/core/src/types.ts
- [ ] T017 [P] [US1] Implement validateEnum function in packages/core/src/utils/validation.ts with mixed enum rejection
- [ ] T018 [P] [US1] Implement isEnumMetadata type guard in packages/core/src/utils/validation.ts
- [ ] T019 [US1] Extend registry.register() to detect and handle enum types in packages/core/src/registry.ts
- [ ] T020 [US1] Add enum type validation with clear error messages in packages/core/src/registry.ts
- [ ] T021 [US1] Verify all enum tests pass (T010-T015)

**Checkpoint**: Enum units are fully functional and independently testable

---

## Phase 4: User Story 2 - Class-Based Units (Priority: P2)

**Goal**: Enable TypeScript classes as unit types with prototype storage and inheritance support

**Independent Test**: Register a Temperature class with methods, create instances, verify metadata contains class prototype and methods are accessible

### Tests for User Story 2 (TDD - Write First) ⚠️

> **TDD: Write these tests FIRST, ensure they FAIL, then implement**

- [ ] T022 [P] [US2] Create test file packages/core/src/__tests__/class-units.test.ts with basic class registration test (MUST FAIL)
- [ ] T023 [P] [US2] Add class with constructor parameters test in packages/core/src/__tests__/class-units.test.ts (MUST FAIL)
- [ ] T024 [P] [US2] Add class with methods test in packages/core/src/__tests__/class-units.test.ts (MUST FAIL)
- [ ] T025 [P] [US2] Add class inheritance test in packages/core/src/__tests__/class-units.test.ts (MUST FAIL)
- [ ] T026 [P] [US2] Add class without methods test (empty class) in packages/core/src/__tests__/class-units.test.ts (MUST FAIL)
- [ ] T027 [P] [US2] Add class metadata introspection test in packages/core/src/__tests__/class-units.test.ts (MUST FAIL)

### Implementation for User Story 2

- [ ] T028 [P] [US2] Implement ClassTypedMetadata type in packages/core/src/types.ts
- [ ] T029 [P] [US2] Implement validateClass function in packages/core/src/utils/validation.ts
- [ ] T030 [P] [US2] Implement isClassMetadata type guard in packages/core/src/utils/validation.ts
- [ ] T031 [US2] Extend registry.register() to detect and handle class types in packages/core/src/registry.ts
- [ ] T032 [US2] Add class type validation (prototype check) in packages/core/src/registry.ts
- [ ] T033 [US2] Verify all class tests pass (T022-T027)

**Checkpoint**: Class units are fully functional and independently testable

---

## Phase 5: User Story 3 - Record-Based Units (Priority: P2)

**Goal**: Enable record schema objects as unit types with recursive nested structure support

**Independent Test**: Register a Point record schema {x: "number", y: "number"}, create values, verify metadata contains schema and type inference works

### Tests for User Story 3 (TDD - Write First) ⚠️

> **TDD: Write these tests FIRST, ensure they FAIL, then implement**

- [ ] T034 [P] [US3] Create test file packages/core/src/__tests__/record-units.test.ts with basic record registration test (MUST FAIL)
- [ ] T035 [P] [US3] Add simple record schema test (Point {x, y}) in packages/core/src/__tests__/record-units.test.ts (MUST FAIL)
- [ ] T036 [P] [US3] Add nested record schema test (Address with coordinates) in packages/core/src/__tests__/record-units.test.ts (MUST FAIL)
- [ ] T037 [P] [US3] Add circular reference rejection test in packages/core/src/__tests__/record-units.test.ts (MUST FAIL)
- [ ] T038 [P] [US3] Add empty record test in packages/core/src/__tests__/record-units.test.ts (MUST FAIL)
- [ ] T039 [P] [US3] Add invalid type name rejection test in packages/core/src/__tests__/record-units.test.ts (MUST FAIL)
- [ ] T040 [P] [US3] Add record metadata introspection test in packages/core/src/__tests__/record-units.test.ts (MUST FAIL)

### Implementation for User Story 3

- [ ] T041 [P] [US3] Implement RecordTypedMetadata and RecordSchema types in packages/core/src/types.ts
- [ ] T042 [P] [US3] Implement InferFromRecordSchema type utility in packages/core/src/type-inference.ts
- [ ] T043 [P] [US3] Implement validateRecordSchema function with circular reference detection in packages/core/src/utils/validation.ts
- [ ] T044 [P] [US3] Implement isRecordMetadata type guard in packages/core/src/utils/validation.ts
- [ ] T045 [US3] Extend registry.register() to detect and handle record schemas in packages/core/src/registry.ts
- [ ] T046 [US3] Add record schema validation with clear error messages (circular refs, invalid type names) in packages/core/src/registry.ts
- [ ] T047 [US3] Verify all record tests pass (T034-T040)

**Checkpoint**: Record units are fully functional and independently testable

---

## Phase 6: User Story 4 - Tuple-Based Units (Priority: P3)

**Goal**: Enable tuple schemas as unit types with optional (?) and rest (...) element support

**Independent Test**: Register RGB tuple schema ["number", "number", "number"], create values, verify metadata contains tuple schema with correct types

### Tests for User Story 4 (TDD - Write First) ⚠️

> **TDD: Write these tests FIRST, ensure they FAIL, then implement**

- [ ] T048 [P] [US4] Create test file packages/core/src/__tests__/tuple-units.test.ts with basic tuple registration test (MUST FAIL)
- [ ] T049 [P] [US4] Add simple tuple schema test (RGB triplet) in packages/core/src/__tests__/tuple-units.test.ts (MUST FAIL)
- [ ] T050 [P] [US4] Add tuple with optional element test (?) in packages/core/src/__tests__/tuple-units.test.ts (MUST FAIL)
- [ ] T051 [P] [US4] Add tuple with rest element test (...) in packages/core/src/__tests__/tuple-units.test.ts (MUST FAIL)
- [ ] T052 [P] [US4] Add empty tuple test in packages/core/src/__tests__/tuple-units.test.ts (MUST FAIL)
- [ ] T053 [P] [US4] Add invalid type name rejection test in packages/core/src/__tests__/tuple-units.test.ts (MUST FAIL)
- [ ] T054 [P] [US4] Add tuple metadata introspection test in packages/core/src/__tests__/tuple-units.test.ts (MUST FAIL)

### Implementation for User Story 4

- [ ] T055 [P] [US4] Implement TupleTypedMetadata and TupleSchema types in packages/core/src/types.ts
- [ ] T056 [P] [US4] Implement InferFromTupleSchema type utility in packages/core/src/type-inference.ts
- [ ] T057 [P] [US4] Implement validateTupleSchema function with ? and ... parsing in packages/core/src/utils/validation.ts
- [ ] T058 [P] [US4] Implement isTupleMetadata type guard in packages/core/src/utils/validation.ts
- [ ] T059 [US4] Extend registry.register() to detect and handle tuple schemas in packages/core/src/registry.ts
- [ ] T060 [US4] Add tuple schema validation with clear error messages in packages/core/src/registry.ts
- [ ] T061 [US4] Verify all tuple tests pass (T048-T054)

**Checkpoint**: Tuple units are fully functional and independently testable

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Integration tests, documentation, and backward compatibility verification

- [ ] T062 [P] Extend packages/core/src/__tests__/types.test.ts with non-primitive type edge cases
- [ ] T063 [P] Extend packages/core/src/__tests__/registry.test.ts with mixed primitive/non-primitive registrations
- [ ] T064 [P] Extend packages/core/src/__tests__/metadata.test.ts with all type guard tests
- [ ] T065 [P] Add backward compatibility tests for existing primitive type registrations in packages/core/src/__tests__/registry.test.ts
- [ ] T066 Update packages/core/README.md with non-primitive type examples and usage patterns
- [ ] T067 [P] Add JSDoc comments to all new public APIs in packages/core/src/types.ts
- [ ] T068 [P] Add JSDoc comments to validation functions in packages/core/src/utils/validation.ts
- [ ] T069 [P] Add explicit type category introspection test in packages/core/src/__tests__/metadata.test.ts verifying isEnumMetadata, isClassMetadata, isRecordMetadata, isTupleMetadata for all four types
- [ ] T070 Verify all quality gates pass: `pnpm type-check && pnpm lint && pnpm format:check && pnpm test`
- [ ] T071 Create changeset with: `pnpm changeset` (minor version, feature description)

---

## Dependencies & Parallel Execution

### Story Completion Order

The user stories have dependencies based on priority and shared infrastructure:

```
Phase 1 (Setup) → Phase 2 (Foundation)
                      ↓
        ┌─────────────┼─────────────┬─────────────┐
        ↓             ↓             ↓             ↓
    Phase 3       Phase 4       Phase 5       Phase 6
    (US1: P1)     (US2: P2)     (US3: P2)     (US4: P3)
        └─────────────┴─────────────┴─────────────┘
                      ↓
                  Phase 7 (Polish)
```

**Independent Stories**: US1, US2, US3, US4 can all be implemented in parallel after Phase 2
**Final Integration**: Phase 7 requires all previous phases complete

### Parallel Execution Examples (Per Story)

**User Story 1 (Enum Units)**:
- Tests: T010-T015 (all parallel after Phase 2)
- Implementation: T016-T018 (parallel), then T019-T020 (sequential)

**User Story 2 (Class Units)**:
- Tests: T022-T027 (all parallel after Phase 2)
- Implementation: T028-T030 (parallel), then T031-T032 (sequential)

**User Story 3 (Record Units)**:
- Tests: T034-T040 (all parallel after Phase 2)
- Implementation: T041-T044 (parallel), then T045-T046 (sequential)

**User Story 4 (Tuple Units)**:
- Tests: T048-T054 (all parallel after Phase 2)
- Implementation: T055-T058 (parallel), then T059-T060 (sequential)

---

## Implementation Strategy

### MVP First (Minimum Viable Product)

**Suggested MVP Scope**: User Story 1 (Enum Units) only
- Delivers immediate value with most common non-primitive type
- Tests enum infrastructure end-to-end
- Validates foundational architecture before expanding

After MVP is validated, add remaining stories incrementally:
1. Phase 1-2 + Phase 3 (US1) = MVP ✅
2. Add Phase 4 (US2: Classes) for OOP support
3. Add Phase 5 (US3: Records) for structured data
4. Add Phase 6 (US4: Tuples) for array-based types
5. Complete Phase 7 (Polish) for full release

### TDD Workflow Per Task

1. **Write test** (task marked MUST FAIL)
2. **Run test** - verify it fails for the right reason
3. **Implement** minimum code to pass
4. **Run test** - verify it passes
5. **Refactor** if needed
6. **Repeat** for next task

### Quality Gate Checkpoints

After each phase:
```bash
pnpm type-check  # TypeScript compilation
pnpm lint        # oxlint
pnpm format:check # oxfmt
pnpm test        # Vitest
```

All must pass before proceeding to next phase.

---

## Task Summary

- **Total Tasks**: 71
- **Setup Tasks**: 3 (Phase 1)
- **Foundation Tasks**: 6 (Phase 2)
- **User Story 1 Tasks**: 12 (6 tests + 6 implementation)
- **User Story 2 Tasks**: 12 (6 tests + 6 implementation)
- **User Story 3 Tasks**: 14 (7 tests + 7 implementation)
- **User Story 4 Tasks**: 14 (7 tests + 7 implementation)
- **Polish Tasks**: 10 (Phase 7)

**Parallel Opportunities**: 
- Phase 1: 2 tasks can run in parallel
- Phase 2: 3 tasks can run in parallel
- Each User Story: 6-7 test tasks can run in parallel
- Each User Story: 3-4 implementation tasks can run in parallel
- Phase 7: 7 tasks can run in parallel

**Independent Test Validation**:
- ✅ User Story 1: Register enum, create values, introspect metadata
- ✅ User Story 2: Register class, create instances, verify prototype access
- ✅ User Story 3: Register record schema, create values, verify nested structure
- ✅ User Story 4: Register tuple schema, create values, verify optional/rest elements

**Estimated Completion**: ~200-300 LOC across 5-6 files, following TDD approach
