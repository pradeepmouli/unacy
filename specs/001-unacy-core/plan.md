# Implementation Plan: Unacy Core Conversion Library

**Branch**: `001-unacy-core` | **Date**: 2026-01-06 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-unacy-core/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Unacy Core provides type-safe unit and format conversions using TypeScript's type branding via `type-fest`'s `Tagged` utility. The library exposes fluent APIs for defining converters, registering them in a registry with auto-composition via graph traversal, and formatting/parsing tagged values. Key technical approach: leverage TypeScript's structural typing and branded types to enforce compile-time safety, implement a registry with shortest-path multi-hop conversion support using BFS, and provide zero-runtime-overhead type utilities for tagging.

## Technical Context

**Language/Version**: TypeScript 5.9+, ESM modules
**Primary Dependencies**: `type-fest` (type utilities for Tagged branding), `zod` (runtime validation for parsers)
**Storage**: N/A (pure library, no persistence)
**Testing**: Vitest (unit tests with compile-time type assertions via `expectTypeOf`)
**Target Platform**: Node.js >=20.0.0, browser (ESM), edge runtimes
**Project Type**: Single library package (monorepo structure: `packages/core`)
**Performance Goals**:
  - Type operations resolve in <1s for typical conversion graphs (<100 units)
  - Registry lookup O(1) for direct conversions, O(V+E) BFS for multi-hop
  - Zero runtime overhead for type branding (phantom types)
**Constraints**:
  - Tree-shakeable: unused converters must not be bundled
  - No `any` types in public API surface
  - Compile-time enforcement wherever possible over runtime checks
**Scale/Scope**:
  - Support 100+ unit types in a single registry without TS performance degradation
  - Handle conversion graphs with depth ≤5 hops efficiently
  - Public API surface <20 exported symbols

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

✅ **Principle I (TypeScript-First, ESM-Only)**: All code will be TypeScript with ESM exports; `type-fest` provides type utilities.

✅ **Principle II (Small, Focused, Dependency-Light)**: Two dependencies (`type-fest`, `zod`) are minimal and justified; core is pure type/function composition.

✅ **Principle III (Test-Driven Development)**: Tests will be written first using Vitest; each type brand and converter will have failing tests before implementation.

✅ **Principle IV (Progressive Enhancement & Compatibility)**: Initial feature is additive (0.1.0); future breaking changes will follow semver and changesets.

✅ **Principle V (Versioning & Releases via Changesets)**: A changeset will be created for this feature; version managed via changesets.

✅ **Principle VI (Workflow Selection)**: Using `/speckit.specify` workflow (new capability).

**Quality Gates Check**:
- ✅ Spec complete before planning
- ✅ Plan passes constitution (this section)
- ⏳ Tests will be written before implementation (Phase 2)
- ⏳ All quality gates (format/lint/type-check/test) will pass before merge

**Conclusion**: No constitution violations. Proceed to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

Monorepo structure (pnpm workspaces):

```text
packages/core/
├── src/
│   ├── index.ts                # Public API exports
│   ├── types.ts                # WithUnits, WithFormat, Tagged type utilities
│   ├── converters.ts           # Converter, BidirectionalConverter types
│   ├── formatters.ts           # Formatter, Parser, FormatterParser types
│   ├── registry.ts             # ConverterRegistry implementation with BFS
│   └── utils/
│       ├── graph.ts            # BFS shortest-path for multi-hop conversions
│       └── validation.ts       # Runtime validation helpers for parsers
├── src/__tests__/
│   ├── types.test.ts           # Type branding compile-time tests
│   ├── converters.test.ts      # Converter function tests
│   ├── formatters.test.ts      # Formatter/parser round-trip tests
│   ├── registry.test.ts        # Registry registration and lookup tests
│   └── integration.test.ts     # Multi-hop conversion integration tests
├── package.json
├── tsconfig.json
└── README.md
```

**Structure Decision**: Single package (`packages/core`) within the existing monorepo. All type definitions, implementations, and tests co-located in `packages/core/src`. No CLI or external services required for this feature (pure library). Tests use Vitest with `expectTypeOf` for compile-time type assertions.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
