<!--
Sync Impact Report

- Version change: 1.0.0 → 1.1.0 (MINOR: Added workflow-specific quality gates and expanded development workflow)
- Modified principles: VI. Workflow Selection (clarified exceptions)
- Added sections: 
  - Quality Gates by Workflow Type (7 workflow-specific gate sets)
  - Core Feature Workflow (5-step process)
  - Extension Workflows (7 workflow types)
  - Branch & Commit Conventions (updated)
- Removed sections: N/A (consolidated, not removed)
- Templates requiring updates:
  - ✓ updated: .specify/templates/plan-template.md (gates now documented)
  - ✓ updated: .specify/templates/tasks-template.md (TDD/monorepo guidance)
  - ✓ updated: docs/DEVELOPMENT.md (pnpm version aligned)
  - ✓ updated: .specify/memory/constitution.md (workflow gates integrated)
  - → pending review: Code review workflow docs (reference constitution)
- Enhance-constitution files to delete:
  - .github/prompts/speckit.enhance-constitution.prompt.md
  - .github/agents/speckit.enhance-constitution.md
  - .codex/commands/speckit.enhance-constitution.md
  - (and any other agent-specific enhance-constitution.* files)
- Follow-up TODOs:
  - Original ratification date (1.0.0) set to 2025-01-06 (inferred)
  - Ensure code review guidelines reference constitution compliance
-->

# unacy Constitution

## Core Principles

### I. TypeScript-First, ESM-Only
All production code MUST be written in TypeScript and published as ESM (`"type": "module"`).
Public APIs MUST be strongly typed; avoid `any` and prefer explicit return types.
Any new build tooling MUST preserve tree-shaking and type output (`.d.ts`).

### II. Small, Focused, Dependency-Light
This repo exists to provide reusable unit/format/type conversion utilities.
New functionality MUST be small, composable, and easy to remove.
Avoid introducing runtime dependencies unless they are clearly justified and minimal.
Prefer pure functions and data-in/data-out APIs.

### III. Test-Driven Development (NON-NEGOTIABLE)
For new behavior or bug fixes, tests MUST be written first and MUST fail before the
implementation is added.
Tests MUST be written with Vitest.
Hotfix work is the only exception (see Section VI).

### IV. Progressive Enhancement & Compatibility
Prefer additive changes over breaking changes.
If a breaking change is unavoidable, it MUST include:
- a major version bump (via changesets)
- migration notes in the change description
- updated tests covering the new behavior

### V. Versioning & Releases via Changesets
User-facing changes MUST include a changeset (`pnpm changeset`).
Versioning MUST follow Semantic Versioning.
Release automation (when present) MUST derive tags/releases from package versions.

### VI. Workflow Selection & Emergency Exceptions
Work MUST use the appropriate workflow:
- New capability: `/specify`
- Bug remediation: `/speckit.bugfix` (test before fix)
- Emergency production fix: `/speckit.hotfix` (fix first allowed, test immediately after)
- Small additive improvement: `/speckit.enhance`
- Backward-compatible behavior change: `/speckit.modify`
- Behavior-preserving cleanup: `/speckit.refactor`
- Planned removal: `/speckit.deprecate`

If `/speckit.hotfix` is used, Section III (TDD) MAY be bypassed, but a regression test MUST
be added before the hotfix is considered complete.

## Quality Gates

All code MUST pass mandatory quality checks. Unless explicitly exempted (see Section VI), all changes MUST meet:

- Formatting MUST pass: `pnpm format:check`
- Linting MUST pass: `pnpm lint`
- Type checking MUST pass: `pnpm type-check`
- Tests MUST pass: `pnpm test`

Commit hygiene is mandatory:

- Conventional commits are enforced via commitlint.
- Pre-commit hooks run formatting/lint fixes; pre-push runs type checking.

### Quality Gates by Workflow Type

**Feature Development** (`/speckit.specify`):
- Specification MUST be complete before planning
- Plan MUST pass constitution checks before task generation
- Tests MUST be written BEFORE implementation (TDD)
- All quality gates MUST pass before merge
- Code review MUST verify constitution compliance

**Bugfix** (`/speckit.bugfix`):
- Bug reproduction MUST be documented with exact steps
- Regression test MUST be written and MUST fail before fix is applied
- Root cause MUST be identified and documented
- Prevention strategy MUST be defined
- All quality gates MUST pass

**Enhancement** (`/speckit.enhance`):
- Enhancement MUST be scoped to a single-phase plan with max 7 tasks
- Changes MUST be clearly defined
- Tests MUST be added for new behavior
- If complexity exceeds single-phase scope, use full `/speckit.specify` workflow instead
- All quality gates MUST pass

**Modification** (`/speckit.modify`):
- Impact analysis MUST identify all affected files and contracts
- Original feature spec MUST be linked
- Backward compatibility MUST be assessed and documented
- Migration path MUST be documented if breaking changes exist
- All quality gates MUST pass

**Refactor** (`/speckit.refactor`):
- Baseline metrics MUST be captured before changes
- Tests MUST pass after EVERY incremental change
- Behavior preservation MUST be guaranteed (tests unchanged)
- Target metrics MUST show measurable improvement
- All quality gates MUST pass

**Hotfix** (`/speckit.hotfix`):
- Severity MUST be assessed (P0/P1/P2)
- Rollback plan MUST be prepared before deployment
- Fix MAY be deployed before tests (exception to TDD)
- Regression test MUST be added before hotfix is considered complete
- Post-mortem MUST be completed within 48 hours of resolution

**Deprecation** (`/speckit.deprecate`):
- Dependency scan MUST be run to identify affected code
- Migration guide MUST be created before Phase 1
- All three phases MUST complete in sequence (no skipping)
- Stakeholder approvals MUST be obtained before starting

## Development Workflow

### Core Feature Workflow
1. Feature request initiates with `/speckit.specify <description>`
2. Clarification via `/speckit.clarify` to resolve ambiguities
3. Technical planning with `/speckit.plan` to create implementation design
4. Task breakdown using `/speckit.tasks` for execution roadmap
5. Implementation via `/speckit.implement` following task order

### Extension Workflows
- **Baseline**: `/speckit.baseline` → establish project context and change tracking
- **Bugfix**: `/speckit.bugfix "<description>"` → bug remediation with regression test requirement
- **Enhancement**: `/speckit.enhance "<description>"` → minor improvements, single-phase workflow
- **Modification**: `/speckit.modify <feature_num> "<description>"` → changes to existing features with impact analysis
- **Refactor**: `/speckit.refactor "<description>"` → code quality improvements with baseline metrics
- **Hotfix**: `/speckit.hotfix "<incident>"` → emergency production fixes with expedited process
- **Deprecation**: `/speckit.deprecate <feature_num> "<reason>"` → feature sunset with phased rollout

### Branch & Commit Conventions
- Use feature branches (e.g., `feat/...`, `fix/...`, `docs/...`, `refactor/...`, `chore/...`).
- Keep PRs small and focused on a single workflow/concern.
- Update docs when public APIs or usage changes.
- Prefer changes that maintain monorepo consistency (pnpm workspaces, shared tsconfig, unified tooling).
- Commits MUST follow conventional commit format enforced by commitlint.

## Governance

- This constitution is authoritative for all repo decisions and code review.
- All PRs/reviews MUST verify constitution compliance (or document explicit, approved exemption).
- Any amendment MUST be made via PR, MUST include detailed rationale, and MUST update the version.
- Versioning policy for the constitution itself:
  - MAJOR: Removes or materially redefines principles/gates.
  - MINOR: Adds new principles/sections, expands scope, or adds workflow-specific gates.
  - PATCH: Clarifies wording without changing meaning.
- Development guidance is provided in [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) and agent-specific prompts; this constitution takes precedence in case of conflict.

**Version**: 1.1.0 | **Ratified**: 2025-01-06 | **Last Amended**: 2026-01-06

---

**Amendment Log**:
- **1.1.0** (2026-01-06): Added workflow-specific quality gates; expanded development workflow section with core feature and extension workflow guidance; clarified branch/commit conventions.
- **1.0.0** (2025-01-06): Initial constitution with core principles (TypeScript-first, small/focused scope, TDD, progressive enhancement, changesets, workflow selection).
