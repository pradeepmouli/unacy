---
name: unacy-monorepo
description: "TypeScript monorepo template with pnpm, oxlint, oxfmt, and Vitest Use when working with monorepo, oxfmt, oxlint, pnpm, template, vitest."
license: MIT
---

# unacy-monorepo

TypeScript monorepo template with pnpm, oxlint, oxfmt, and Vitest

## When to Use

- Working with monorepo, oxfmt, oxlint, pnpm, template, vitest
- API surface: 11 functions, 5 classes, 27 types

## Quick Reference

**registry:** `createRegistry`, `UnitRegistry`, `UnitMap`, `UnitAccessor`
**validation:** `createParserWithSchema`, `validateEnum`, `validateClass`, `validateRecordSchema`, `validateTupleSchema`, `isEnumMetadata`, `isClassMetadata`, `isRecordMetadata`, `isTupleMetadata`, `detectMetadataKind`
**errors:** `UnacyError`, `CycleError`, `MaxDepthError`, `ConversionError`, `ParseError`
**types:** `WithUnits`, `WithTypedUnits`, `WithFormat`, `BaseMetadata`, `TypedMetadata`, `UnitMetadata`, `Relax`, `PrimitiveType`, `SupportedType`, `EnumType`, `ClassType`, `RecordSchema`, `TupleSchema`, `ToPrimitiveTypeName`, `PrimitiveTypeFromName`, `InferFromRecordSchema`, `InferFromTupleSchema`
**converters:** `Converter`, `BidirectionalConverter`, `RelaxedConverter`, `RelaxedBidirectionalConverter`
**formatters:** `Formatter`, `Parser`, `FormatterParser`

## Links

- [Repository](https://github.com/pradeepmouli/unacy)
- Author: Pradeep Mouli <pradeep.mouli@example.com>