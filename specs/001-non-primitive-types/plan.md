# Implementation Plan: Non-Primitive Type Support

**Branch**: `001-non-primitive-types` | **Date**: 2026-02-15 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-non-primitive-types/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Extend the unacy type system to support non-primitive TypeScript types (enums, classes, records, tuples) as unit definitions. The system will store type-appropriate runtime metadata: enum objects for enums, class prototypes for classes, schema objects for records (mapping property names to type strings), and type name arrays for tuples. This enables developers to use rich type definitions beyond primitives while maintaining compile-time type safety and runtime introspection capabilities. All types integrate with the existing UnitRegistry infrastructure with full backward compatibility.

## Technical Context

**Language/Version**: TypeScript 5.9.3 with ESM-only output
**Primary Dependencies**: type-fest ^5.4.4 (Tagged, GetTagMetadata, Simplify utilities)
**Storage**: N/A (in-memory registry only)
**Testing**: Vitest ^4.0.18
**Target Platform**: Node.js >=20.0.0, browser ESM
**Project Type**: Monorepo package (packages/core)
**Performance Goals**: Type inference at compile-time with zero runtime overhead for type operations
**Constraints**: Must maintain backward compatibility with existing primitive type registrations; no breaking changes to UnitRegistry API
**Scale/Scope**: Extends existing ~150 LOC in packages/core/src/types.ts; adds ~200-300 LOC for non-primitive type support across types, registry, and validation modules

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Feature Development Gates** (`/speckit.specify`):
- ✅ Specification complete with all clarifications resolved
- ✅ Plan created before task generation (this document)
- 🔄 Tests to be written BEFORE implementation (TDD) - enforced during implementation
- 🔄 All quality gates to pass before merge - enforced at PR time
- 🔄 Code review to verify constitution compliance - enforced at PR time

**Core Principles Alignment**:
- ✅ **TypeScript-First, ESM-Only**: All code will be TypeScript with ESM output
- ✅ **Small, Focused, Dependency-Light**: Extends existing types module; no new runtime dependencies
- ✅ **Test-Driven Development**: Tests will be written first for all new functionality
- ✅ **Progressive Enhancement**: Additive changes only; full backward compatibility maintained
- ✅ **Versioning via Changesets**: Will include changeset for minor version bump

**Quality Gates** (to be enforced during implementation):
- Formatting: `pnpm format:check` must pass
- Linting: `pnpm lint` must pass (oxlint)
- Type checking: `pnpm type-check` must pass
- Tests: `pnpm test` must pass (Vitest)
- Conventional commits enforced via pre-commit hooks

**Status**: ✅ **PASSED** - All planning-phase gates satisfied; implementation-phase gates deferred to execution

## Project Structure

### Documentation (this feature)

```text
specs/001-non-primitive-types/
├── spec.md                      # Feature specification ✅ COMPLETE
├── checklists/
│   └── requirements.md          # Specification validation checklist ✅ COMPLETE
├── plan.md                      # This file (Phase 0-1 output) ✅ COMPLETE
├── research.md                  # Phase 0: Research findings ✅ COMPLETE
├── data-model.md                # Phase 1: Type system extensions ✅ COMPLETE
├── quickstart.md                # Phase 1: Usage examples ✅ COMPLETE
├── contracts/                   # Phase 1: API contracts ✅ COMPLETE
│   └── type-metadata-api.md
└── tasks.md                     # Phase 2: Task breakdown (create with /speckit.tasks)
```

### Source Code (repository root)

```text
packages/core/
├── src/
│   ├── types.ts                 # MODIFY: Extend PrimitiveType, add non-primitive metadata types
│   ├── registry.ts              # MODIFY: Extend registration to handle non-primitive types
│   ├── utils/
│   │   ├── validation.ts        # MODIFY: Add validation for enums, classes, records, tuples
│   │   └── graph.ts             # INSPECT: May need updates for non-primitive conversion paths
│   ├── type-inference.ts        # NEW: Type inference utilities for schema-to-type conversion
│   └── __tests__/
│       ├── types.test.ts        # EXTEND: Add non-primitive type tests
│       ├── registry.test.ts     # EXTEND: Add non-primitive registration tests
│       ├── metadata.test.ts     # EXTEND: Add metadata introspection tests
│       ├── enum-units.test.ts   # NEW: Enum-specific unit tests
│       ├── class-units.test.ts  # NEW: Class-specific unit tests
│       ├── record-units.test.ts # NEW: Record-specific unit tests
│       └── tuple-units.test.ts  # NEW: Tuple-specific unit tests
├── package.json                 # INSPECT: Ensure zod optional dependency for validation
└── README.md                    # UPDATE: Document non-primitive type support
```

**Structure Decision**: Using the existing monorepo single-package structure (packages/core). This feature extends the existing type system within the core package rather than creating a new package. All changes are additive and maintain backward compatibility with existing primitive type infrastructure.

## Complexity Tracking

No constitution violations requiring justification. This feature follows all core principles and maintains alignment with the repository's goals of small, focused, dependency-light utilities.

---

## Phase 0: Research ✅ COMPLETE

**Status**: Complete
**Artifact**: [research.md](./research.md)

All design decisions have been validated through the clarification session:
1. ✅ Mixed enum handling: Reject with error
2. ✅ Class inheritance: Store direct prototype only
3. ✅ Circular references: Reject with error
4. ✅ Tuple optional/rest elements: Use "?" and "..." notation
5. ✅ Class constructors: Support any signature
6. ✅ Empty types: Allow all
7. ✅ Complex nested structures: Recursive support with developer-provided schemas

**Key Findings**:
- Non-primitive types integrate naturally with existing `Tagged` type system from type-fest
- Schema-to-type inference enables type-safe record and tuple definitions
- Validation strategy prevents common errors with clear messages
- Full backward compatibility maintained through type union extensions

## Phase 1: Design & Contracts ✅ COMPLETE

**Status**: Complete
**Artifacts**:
- [data-model.md](./data-model.md) - Complete type system extensions and metadata structures
- [contracts/type-metadata-api.md](./contracts/type-metadata-api.md) - Full API contracts with validation rules
- [quickstart.md](./quickstart.md) - Comprehensive usage examples for all type categories

**Deliverables**:
1. ✅ **Data Model**: Extended type definitions for enums, classes, records, tuples
2. ✅ **Type Inference**: Schema-to-type utilities for compile-time safety
3. ✅ **Validation**: Comprehensive validation functions with clear error messages
4. ✅ **API Contracts**: Registration, introspection, and conversion APIs
5. ✅ **Examples**: 14 usage examples covering all patterns
6. ✅ **Agent Context**: Updated for TypeScript 5.9.3 and type-fest utilities

**Constitution Re-Check**: ✅ PASSED
- All Phase 1 design maintains TypeScript-first, ESM-only approach
- No new runtime dependencies added
- Backward compatibility preserved in all APIs
- Changes are purely additive (extends, doesn't replace)

## Next Steps

### Phase 2: Task Generation

Run `/speckit.tasks` to generate detailed implementation tasks from this plan. Tasks will cover:

1. **Type System Extensions** (packages/core/src/types.ts)
   - Extend `PrimitiveType` to `SupportedType`
   - Add `EnumTypedMetadata`, `ClassTypedMetadata`, `RecordTypedMetadata`, `TupleTypedMetadata`
   - Implement type inference utilities

2. **Validation Infrastructure** (packages/core/src/utils/validation.ts)
   - Add `validateEnum()`, `validateClass()`, `validateRecordSchema()`, `validateTupleSchema()`
   - Implement circular reference detection
   - Add type-specific error messages

3. **Registry Integration** (packages/core/src/registry.ts)
   - Extend registration to detect and handle non-primitive types
   - Add type guards: `isEnumMetadata()`, `isClassMetadata()`, etc.
   - Update `getMetadata()` return type

4. **Test Suite** (packages/core/src/__tests__/)
   - Write failing tests first (TDD)
   - Cover all four non-primitive types
   - Test validation edge cases
   - Test backward compatibility

5. **Documentation** (packages/core/README.md)
   - Add non-primitive type examples
   - Document validation rules
   - Update API reference

### Implementation

After task generation, run `/speckit.implement` to execute tasks following TDD:
1. Write failing test
2. Implement minimum code to pass
3. Refactor
4. Repeat for each task

### Changeset

Before merging, create changeset:
```bash
pnpm changeset
# Select: minor (new feature)
# Description: "Add support for non-primitive types (enums, classes, records, tuples)"
```

### Final Checks

Before PR:
- ✓ All tests pass (`pnpm test`)
- ✓ Type checking passes (`pnpm type-check`)
- ✓ Linting passes (`pnpm lint`)
- ✓ Formatting passes (`pnpm format:check`)
- ✓ Changeset created
- ✓ Documentation updated
- ✓ Examples tested and working

---

**Plan Status**: ✅ **READY FOR TASK GENERATION**
**Next Command**: `/speckit.tasks`
**Branch**: `001-non-primitive-types`
**Estimated Scope**: ~200-300 LOC across 5-6 files, 8-10 test files
