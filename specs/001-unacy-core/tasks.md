---
description: "Task list for implementing Unacy Core Conversion Library"
---

# Tasks: Unacy Core Conversion Library

**Input**: Design documents from `/specs/001-unacy-core/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/api.md ✅

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

Monorepo structure: `packages/core/`
- Source: `packages/core/src/`
- Tests: `packages/core/src/__tests__/`
- Types are in `src/`, implementations are in `src/`, tests are in `src/__tests__/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Initialize `packages/core` as TypeScript library with proper configuration
- [ ] T002 [P] Create `packages/core/src/` directory structure with subdirectories (`utils/`, `__tests__/`)
- [ ] T003 [P] Create `packages/core/tsconfig.json` extending root tsconfig with proper output settings
- [ ] T004 [P] Update `packages/core/package.json` with dependencies (type-fest, zod) and TypeScript configuration
- [ ] T005 Configure Vitest in `packages/core/` with `expectTypeOf` support for type assertions
- [ ] T006 Create initial `packages/core/README.md` with feature overview and quick link to spec

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core type definitions and error classes needed by all user stories

- [ ] T007 [P] Create `packages/core/src/types.ts` with `WithUnits<T, U>` type alias using `type-fest`'s `Tagged`
- [ ] T008 [P] Create `packages/core/src/types.ts` with `WithFormat<T, F>` type alias using `type-fest`'s `Tagged`
- [ ] T009 Create `packages/core/src/__tests__/types.test.ts` with compile-time tests for WithUnits type safety
- [ ] T010 Create `packages/core/src/__tests__/types.test.ts` with compile-time tests for WithFormat type safety
- [ ] T011 [P] Create `packages/core/src/errors.ts` with error classes: `UnacyError`, `CycleError`, `MaxDepthError`, `ConversionError`, `ParseError`
- [ ] T012 Create `packages/core/src/__tests__/errors.test.ts` with tests for all error classes and message formatting

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Author Tagged Converters (Priority: P1)

**Goal**: Provide type-safe converter types (`Converter` and `BidirectionalConverter`) that guarantee compile-time safety

**Independent Test**: Define converters for temperature units (Celsius ↔ Fahrenheit), verify types enforce correct input/output and reject mismatches at compile time

### Tests for User Story 1

- [ ] T013 [P] [US1] Create `packages/core/src/__tests__/converters.test.ts` with test: unidirectional converter returns correct type
- [ ] T014 [P] [US1] Add test: bidirectional converter round-trip preserves value within tolerance
- [ ] T015 [P] [US1] Add compile-time test: wrong unit type to converter causes compile error
- [ ] T016 [P] [US1] Add test: converter function is deterministic (same input → same output)

### Implementation for User Story 1

- [ ] T017 [US1] Create `packages/core/src/converters.ts` with `Converter<TInput, TOutput>` type definition
- [ ] T018 [US1] Add `BidirectionalConverter<TInput, TOutput>` type definition in `packages/core/src/converters.ts`
- [ ] T019 [US1] Create example converters in test file (Celsius ↔ Fahrenheit) to verify type safety
- [ ] T020 [US1] Update `packages/core/src/index.ts` to export `Converter` and `BidirectionalConverter` types

**Checkpoint**: User Story 1 complete and independently testable - converters work with compile-time safety

---

## Phase 4: User Story 2 - Use Registry to Chain Conversions (Priority: P2)

**Goal**: Implement `ConverterRegistry` with fluent API that auto-composes multi-hop conversions via BFS shortest path

**Independent Test**: Register 3+ converters (A→B, B→C, C→D), perform direct (A→B) and multi-hop (A→D via B→C) conversions, verify compile-time type safety and runtime correctness

### Tests for User Story 2

- [ ] T021 [P] [US2] Create `packages/core/src/__tests__/registry.test.ts` with test: register and retrieve direct converter
- [ ] T022 [P] [US2] Add test: registerBidirectional registers both directions
- [ ] T023 [P] [US2] Add test: getConverter finds direct converter in O(1)
- [ ] T024 [P] [US2] Add test: auto-compose 2-hop conversion (A→B→C)
- [ ] T025 [P] [US2] Add test: auto-compose 3-hop conversion (A→B→C→D)
- [ ] T026 [P] [US2] Add test: cycle detection throws CycleError with path
- [ ] T027 [P] [US2] Add test: max depth (>5 hops) throws MaxDepthError
- [ ] T028 [P] [US2] Add test: missing converter path throws ConversionError
- [ ] T029 [P] [US2] Add compile-time test: wrong unit to convert() causes error
- [ ] T030 [P] [US2] Add integration test: 3-unit distance conversion (m→km→mi) produces correct value

### Implementation for User Story 2

- [ ] T031 [US2] Create `packages/core/src/utils/graph.ts` with BFS function: `findShortestPath(from, to, adjacencyMap): PropertyKey[]`
- [ ] T032 [US2] Add cycle detection in `findShortestPath` using visited set
- [ ] T033 [US2] Add max depth check (5 hops) in `findShortestPath`
- [ ] T034 [US2] Create `packages/core/src/utils/graph.ts` with `composeConverters(path, registry)` to chain converters
- [ ] T035 [US2] Create `packages/core/src/registry.ts` with `ConverterRegistryImpl` class (internal)
- [ ] T036 [US2] Implement adjacency list storage: `private graph: Map<PropertyKey, Map<PropertyKey, Converter>>`
- [ ] T037 [US2] Implement `register<From, To>(from, to, converter)` method returning new registry instance
- [ ] T038 [US2] Implement `registerBidirectional<From, To>(from, to, bidirectional)` registering both directions
- [ ] T039 [US2] Implement `getConverter<From, To>(from, to)` with direct lookup fallback to BFS
- [ ] T040 [US2] Implement path caching: `private pathCache: Map<string, Converter>` for memoization
- [ ] T041 [US2] Implement fluent `convert<From>(value)` method returning object with `to<To>(unit)` method
- [ ] T042 [US2] Create `createRegistry<Units>()` factory function in `packages/core/src/registry.ts`
- [ ] T043 [US2] Update `packages/core/src/index.ts` to export `ConverterRegistry` type, `createRegistry` function

**Checkpoint**: User Story 2 complete - registry auto-composes conversions with shortest path and cycle detection

---

## Phase 5: User Story 3 - Format and Parse Tagged Values (Priority: P3)

**Goal**: Provide type-safe formatter/parser types and utilities for serialization without losing format tags

**Independent Test**: Define ISO8601 format, format Date→string and parse string→Date, verify round-trip fidelity and type safety, test invalid input parsing

### Tests for User Story 3

- [ ] T044 [P] [US3] Create `packages/core/src/__tests__/formatters.test.ts` with test: formatter converts tagged value to string
- [ ] T045 [P] [US3] Add test: parser converts string to tagged value with Zod validation
- [ ] T046 [P] [US3] Add test: round-trip (format then parse) produces equivalent value
- [ ] T047 [P] [US3] Add test: invalid string input throws ParseError with context
- [ ] T048 [P] [US3] Add test: parser rejects input before tagging (no invalid tagged values)
- [ ] T049 [P] [US3] Add compile-time test: wrong format type to formatter causes error
- [ ] T050 [P] [US3] Add integration test: full formatter/parser pair for ISO8601 dates

### Implementation for User Story 3

- [ ] T051 [US3] Create `packages/core/src/formatters.ts` with `Formatter<TInput>` type definition
- [ ] T052 [US3] Add `Parser<TOutput>` type definition (throws ParseError on invalid input)
- [ ] T053 [US3] Add `FormatterParser<T>` type definition with `format` and `parse` properties
- [ ] T054 [US3] Create `packages/core/src/utils/validation.ts` with helper `createParserWithSchema<Format, T>(schema, format)` using Zod
- [ ] T055 [US3] Implement example formatters/parsers in test file for ISO8601, HexColor, UnixTimestamp formats
- [ ] T056 [US3] Update `packages/core/src/index.ts` to export `Formatter`, `Parser`, `FormatterParser` types
- [ ] T057 [US3] Update `packages/core/README.md` with formatter/parser usage examples

**Checkpoint**: User Story 3 complete - format/parse round-trips work with type safety

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Documentation, optimization, testing completeness, and quality gates

- [ ] T058 [P] Create `packages/core/src/index.ts` complete public API exports (types, functions, errors)
- [ ] T059 [P] Run type checking: `pnpm type-check` and verify zero `any` leakage in `packages/core/`
- [ ] T060 [P] Run tests: `pnpm test packages/core` and ensure all pass within 1 second
- [ ] T061 [P] Run linting: `pnpm lint packages/core` and fix any issues
- [ ] T062 [P] Run formatting: `pnpm format packages/core` and verify format compliance
- [ ] T063 Add JSDoc comments to all public APIs in `packages/core/src/` (types, functions, error classes)
- [ ] T064 Create comprehensive usage examples in `packages/core/README.md` (basic, multi-hop, formatter/parser)
- [ ] T065 Verify tree-shakeability: build with `pnpm build packages/core` and check dist outputs
- [ ] T066 Update main `README.md` to list new `@unacy/core` package (or reference if monorepo exports it)
- [ ] T067 Create changeset: `pnpm changeset` describing this feature (version, description, scope)
- [ ] T068 Verify all tests still pass: `pnpm test` (full suite)
- [ ] T069 Final code review against constitution: verify TypeScript-first, small/focused, TDD, no `any`, ESM, changesets
- [ ] T070 Run quickstart.md examples as smoke tests to ensure API is usable as documented

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) AND US1 complete (uses Converter types)
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - No dependencies on US1 or US2

### Within Each User Story

- Tests (marked [P] in test section) MUST be written and MUST fail before implementation
- Tests → Implementation → Integration → Checkpoint
- Story complete before moving to next priority

### Parallel Opportunities

**Setup Phase**:
- T002, T003, T004, T005 can run in parallel (different files)

**Foundational Phase**:
- T007, T008, T011 can run in parallel (types and errors in separate files)
- T009, T010, T012 can run in parallel (tests in separate files)
- All tests must pass before moving to user stories

**User Story 1**:
- T013, T014, T015, T016 (all tests) can run in parallel
- T017, T018, T019 can run in parallel (different converters in tests)

**User Story 2**:
- T021-T030 (all tests) can run in parallel
- T031, T032, T033, T034 (graph utilities) can run in parallel
- T036, T040 (storage/caching) can run in parallel
- Tests must fail before implementing T035+

**User Story 3**:
- T044-T050 (all tests) can run in parallel
- T051, T052, T053 (type definitions) can run in parallel
- T054, T055 (implementations) can run in parallel after types complete

**Polish Phase**:
- T058, T059, T060, T061, T062 can run in parallel (independent checks)
- T063-T070 sequential (documentation, final review, changelog)

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
T013, T014, T015, T016

# After tests fail, launch type implementations:
T017, T018 (in parallel)

# Then verify:
T019, T020
```

---

## Parallel Example: User Story 2 (Complex)

```bash
# Phase 2a: Write all tests in parallel
T021, T022, T023, T024, T025, T026, T027, T028, T029, T030

# Phase 2b: Build graph utilities in parallel
T031, T032, T033, T034 (all graph logic)

# Phase 2c: Build registry core in parallel (after T031 completes)
T036, T040 (storage + caching)

# Phase 2d: Build fluent API in parallel (after types available)
T037, T038, T039, T041, T042, T043
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL)
3. Complete Phase 3: User Story 1 (types + converters)
4. **STOP and VALIDATE**: Test story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Demo/Deploy (MVP!)
3. Add User Story 2 → Test independently → Demo/Deploy
4. Add User Story 3 → Test independently → Demo/Deploy
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Phase 1: Setup together
2. Team completes Phase 2: Foundational together
3. Once Foundational is done:
   - Developer A: User Story 1 (types, converters)
   - Developer B: User Story 2 (registry, graph)
   - Developer C: User Story 3 (formatters, parsers)
4. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no inter-task dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Tests marked [P] can be written in parallel; all must fail before implementation
- Commit after each user story completion (T020, T043, T057)
- Each story checkpoint should be independently deployable
- Run quickstart.md validation in T070 to ensure API matches documentation

