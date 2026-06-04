---
description: "Documentation site for unacy Use when: You need a type-safe, composable unit conversion graph for a domain. The...."
name: unacy-docs
---

# unacy-docs

Documentation site for unacy

## When to Use

**Use this skill when:**
- You need a type-safe, composable unit conversion graph for a domain. The primary entry point for all unacy usage. → use `createRegistry`
- You already have a Zod schema for a format and want to produce a typed `Parser` with minimal boilerplate. → use `createParserWithSchema`
- You are receiving a runtime value and need to confirm it is a valid TypeScript enum before using it as a `TypedMetadata<EnumType>.type` field. → use `validateEnum`
- You need to dynamically dispatch on the kind of a metadata object at runtime (e.g., in serialisers or schema generators built on top of unacy). → use `detectMetadataKind`

**Do NOT use when:**
- You only need a single direct conversion with no type guarantees — a plain function is lighter and requires no registry setup overhead. (`createRegistry`)
- Your validation logic cannot be expressed as a Zod schema — write a custom `Parser<T>` instead, throwing `ParseError` on failure. (`createParserWithSchema`)

API surface: 11 functions, 5 classes, 24 types

## Configuration

3 configuration interfaces — see references/config.md for details.

## Quick Reference

**Key functions:** `createRegistry` (Create a new, empty converter registry), `createParserWithSchema` (Create a `Parser<WithFormat<T, F>>` backed by a Zod-compatible schema), `validateEnum` (Validate that a runtime value is a valid TypeScript enum object), `validateClass` (Validate that a runtime value is a valid class constructor), `validateRecordSchema` (Validate that a runtime value is a valid record schema), `validateTupleSchema` (Validate that a runtime value is a valid tuple schema), `isEnumMetadata` (Type guard: returns `true` when `meta), `isClassMetadata` (Type guard: returns `true` when `meta), `isRecordMetadata` (Type guard: returns `true` when `meta), `isTupleMetadata` (Type guard: returns `true` when `meta), `detectMetadataKind` (Detect the kind of a metadata object by inspecting its `type` field)
**Key classes:** `UnacyError` (Base error class for all unacy errors), `CycleError` (Error thrown when a cycle is detected during BFS path-finding), `MaxDepthError` (Error thrown when BFS path-finding exceeds the maximum conversion depth), `ConversionError` (Error thrown when a conversion cannot be performed), `ParseError` (Error thrown when parsing a string into a format-tagged value fails)

*40 exports total — see references/ for full API.*

## References

Load these on demand — do NOT read all at once:

- When calling any function → read `references/functions.md` for full signatures, parameters, and return types
- When using a class → read `references/classes.md` for properties, methods, and inheritance
- When defining typed variables or function parameters → read `references/types.md`
- When configuring options → read `references/config.md` for all settings and defaults

## Links

- Author: Pradeep Mouli <pmouli@mac.com> (https://github.com/pradeepmouli)