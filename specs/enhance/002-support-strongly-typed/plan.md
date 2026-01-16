# Implementation Plan: Support for Strongly Typed Unit Metadata

**Branch**: `enhance/002-support-strongly-typed` | **Date**: 2026-01-16 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/enhance/002-support-strongly-typed/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Add support for strongly typed metadata that can be associated with units, replacing the existing unit tag system. Metadata will be type-level and registry-level information, with a default type of `{name: string} & Record<string, unknown>`. The implementation includes immutable metadata storage with `getMetadata()` and `withMetadata()` accessors, automatic TypeScript type inference from provided values, and a registry using `Map<string, Metadata>` for efficient runtime lookups. Metadata values will be directly accessible through registry accessors (e.g., `registry.Celsius.name`). In arithmetic operations, metadata comes from the result type, not from operands.

## Technical Context

**Language/Version**: TypeScript 5.x (ESM-only, per constitution)
**Primary Dependencies**: None (dependency-light per constitution principle II)
**Storage**: In-memory registry (Map<string, Metadata>) + type-level metadata
**Testing**: Vitest (TDD required per constitution principle III)
**Target Platform**: Node.js + Browser (ESM module)
**Project Type**: Single library project (monorepo workspace)
**Performance Goals**: Zero runtime overhead for users not using metadata; O(1) registry lookups by name
**Constraints**: Backward compatible at runtime; breaking at type level (requires major version bump)
**Scale/Scope**: Small enhancement to core type system (~500 LOC across 5-7 files)

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
src/
├── types.ts             # Core type definitions (add generic metadata parameter)
├── unit.ts              # Unit class (add metadata property and accessors)
├── registry.ts          # Unit registry (update to Map<string, Metadata> structure)
├── converters/          # Unit converters (ensure metadata from result type)
│   ├── length.ts
│   ├── mass.ts
│   └── temperature.ts
└── index.ts             # Public exports

tests/
├── unit/
│   ├── metadata.test.ts       # Metadata functionality tests
│   ├── type-inference.test.ts # Type inference tests
│   └── arithmetic.test.ts     # Arithmetic metadata behavior
├── integration/
│   ├── registry.test.ts       # Registry integration tests
│   └── converters.test.ts     # Converter metadata handling
└── migration.test.ts          # Tag-to-metadata.name migration tests
```

**Structure Decision**: Single project structure (Option 1). This is a library enhancement affecting core type system and registry. No new directories needed - modifications to existing `src/` files with new test files under `tests/`.

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

Use `/speckit.tasks` to generate executable tasks from this plan.

Tasks will follow TDD approach:
1. Write failing tests for metadata functionality
2. Implement types and interfaces
3. Implement Unit class metadata support
4. Update registry with Map structure
5. Update converters for result-type metadata
6. Verify all tests pass
7. Add migration tests
8. Update documentation

---

**Status**: Ready for Phase 0 (Research)
**Next Command**: Agent will now generate research.md
