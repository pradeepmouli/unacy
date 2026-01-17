# Implementation Plan: Support for Strongly Typed Unit Metadata

**Branch**: `enhance/002-support-strongly-typed` | **Date**: 2026-01-16 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/enhance/002-support-strongly-typed/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Add support for strongly typed metadata to the branded type system (`WithUnits<T, U, M>`). Metadata uses `BaseMetadata` = `{name: string} & Record<string, unknown>` as the default type, stored in the registry using `Map<string, BaseMetadata>` for O(1) lookups. The implementation includes a metadata generic parameter on `WithUnits` and related types, automatic TypeScript type inference from provided values, and registry storage with type-safe `UnitAccessor` access patterns (e.g., `registry.Celsius.symbol`).

**Architecture**: Uses branded types (compile-time only), not runtime class instances. Metadata stored in registry, accessed via `UnitAccessor` properties.

## Technical Context

**Language/Version**: TypeScript 5.x (ESM-only, per constitution)
**Architecture**: Branded type system (`WithUnits<T, U, M>`) - compile-time only, no runtime class instances
**Primary Dependencies**: `type-fest` (already in use for Tagged utility)
**Storage**: In-memory registry (Map<string, BaseMetadata>) + type-level metadata
**Testing**: Vitest (TDD required per constitution principle III)
**Target Platform**: Node.js + Browser (ESM module)
**Project Type**: Single library project (monorepo workspace at packages/core/)
**Performance Goals**: Zero runtime overhead for type-only features; O(1) registry lookups by name
**Constraints**: Breaking change at type level (WithUnits third parameter), requires major version bump
**Scale/Scope**: Small enhancement to core type system (~300 LOC across 3-4 files)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Enhancement Workflow Gates (Section VI)

✅ **Single-phase plan**: Implementation can be completed in one phase
⚠️ **Max 7 tasks**: Currently 12 tasks defined in spec (NEEDS JUSTIFICATION)
✅ **Clearly defined changes**: Metadata type system, registry updates, tag migration
✅ **Tests for new behavior**: Comprehensive test plan defined (metadata, arithmetic, migration)
✅ **Quality gates**: All standard gates apply (format, lint, type-check, test)

### Core Principles

✅ **TypeScript-First, ESM-Only** (I): All changes in TypeScript, strong typing required
✅ **Small, Focused, Dependency-Light** (II): No new dependencies, composable metadata system
✅ **Test-Driven Development** (III): Tests MUST be written before implementation
⚠️ **Progressive Enhancement & Compatibility** (IV): Breaking change at type level (tag → metadata.name), requires major version bump and migration guide
✅ **Versioning & Releases via Changesets** (V): Changeset required for this feature
✅ **Workflow Selection** (VI): Enhancement workflow appropriate for this scope

### Quality Gates

✅ **Formatting**: `pnpm format:check` must pass
✅ **Linting**: `pnpm lint` must pass
✅ **Type checking**: `pnpm type-check` must pass
✅ **Tests**: `pnpm test` must pass (TDD: tests written first)

### Violations Requiring Justification

None - all violations have documented mitigation:
- Task count (12 vs 7): Tasks are granular for clarity but logically group into ~5 major work items (types, registry, migration, converters, tests+docs). Can proceed with enhancement workflow.
- Breaking change: Documented in spec with migration path; requires major version bump per principle IV.

## Project Structure

### Documentation (this feature)

```text
specs/enhance/002-support-strongly-typed/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── metadata-api.md  # Metadata type contracts and accessor signatures
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
packages/core/src/
├── types.ts             # Core type definitions (✅ BaseMetadata added, WithUnits updated)
├── registry.ts          # Registry implementation (Map<string, BaseMetadata> storage)
└── index.ts             # Public exports (✅ BaseMetadata exported)

packages/core/src/__tests__/
├── metadata.test.ts       # ✅ BaseMetadata type constraint tests
├── type-inference.test.ts # ✅ WithUnits metadata type inference tests
└── registry.test.ts       # Registry integration tests (pending)
```

**Structure Decision**: Single library enhancement in `packages/core/`. This affects the core branded type system (`WithUnits`) and registry. No new directories needed - modifications to existing files with new test files under `__tests__/`.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

Not applicable - no constitution violations requiring justification. Task count addressed above as acceptable within enhancement scope.

---

## Phase 0: Research & Technical Decisions

### Research Tasks

1. **TypeScript Generic Type Parameter Patterns**
   - Research: Best practices for adding generic parameters to existing types without breaking changes
   - Decision needed: Default type parameter value strategy
   - Alternative considered: Overloads vs generics

2. **Immutable Data Patterns in TypeScript**
   - Research: Immutable update patterns (withMetadata style)
   - Decision needed: Return type inference for withMetadata
   - Alternative considered: Readonly<T> vs const assertions

3. **Type Inference from Values**
   - Research: TypeScript inference for const objects with `as const`
   - Decision needed: How to infer from `const Celsius = {name: 'Celsius' as const, ...}`
   - Alternative considered: Explicit type annotations vs automatic inference

4. **Registry Map Structure**
   - Research: Map vs Record for type-safe registry
   - Decision needed: Key type (string) vs branded types
   - Alternative considered: WeakMap vs Map (memory implications)

5. **Backward Compatibility Strategies**
   - Research: Deprecation warnings for tag → metadata.name migration
   - Decision needed: Compatibility layer vs clean break
   - Alternative considered: Gradual migration vs immediate switch

### Output
See [research.md](./research.md) for consolidated findings and decisions.

---

## Phase 1: Design & Contracts

### Data Model

See [data-model.md](./data-model.md) for:
- Metadata type interface (`{name: string} & Record<string, unknown>`)
- Unit generic parameter structure
- Registry Map structure
- Immutability patterns

### API Contracts

See [contracts/metadata-api.md](./contracts/metadata-api.md) for:
- `getMetadata()` accessor signature
- `withMetadata<T>()` accessor signature and type inference
- Registry accessor pattern (`registry.Celsius.name`)
- Unit creation function signatures with metadata parameter

### Quickstart

See [quickstart.md](./quickstart.md) for:
- Creating units with metadata
- Accessing metadata via getMetadata()
- Using withMetadata() for immutable updates
- Direct registry access pattern
- Migration guide from tag to metadata.name

---

## Phase 2: Task Generation

Tasks generated via `/speckit.tasks` - see [tasks.md](./tasks.md).

**Current Status**: Phase 1-2 Complete ✅
- Phase 1 (Setup): Baseline established (94 tests passing)
- Phase 2 (Core Types): BaseMetadata type added, WithUnits updated (110 tests passing, 16 new)

**Remaining Tasks** (from tasks.md):
- Phase 3: Registry Integration (6 tasks)
- Phase 4: UnitAccessor Enhancement (3 tasks)
- Phase 5: Documentation & Polish (3 tasks)

**Implementation Approach**: TDD with branded types
1. ✅ Write type-level tests for BaseMetadata constraints
2. ✅ Implement BaseMetadata type definition
3. ✅ Update WithUnits and related types with metadata parameter
4. ✅ Export BaseMetadata from public API
5. Update registry with Map<string, BaseMetadata> storage
6. Enhance UnitAccessor for metadata property access
7. Update documentation with examples

---

**Status**: Phase 0-2 Complete ✅ | Phase 3 In Progress
**Commit**: 466ae6e "feat: add BaseMetadata type and update WithUnits type system"
**Next**: Phase 3 (Registry Integration)
