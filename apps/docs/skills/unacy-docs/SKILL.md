---
name: unacy-docs
description: Documentation site for unacy
---

# unacy-docs

Documentation site for unacy

## When to Use

- You need a type-safe, composable unit conversion graph for a domain.
- The primary entry point for all unacy usage.
- You already have a Zod schema for a format and want to produce a
- typed `Parser` with minimal boilerplate.
- You are receiving a runtime value and need to confirm it is a valid
- TypeScript enum before using it as a `TypedMetadata<EnumType>.type` field.
- You need to dynamically dispatch on the kind of a metadata object
- at runtime (e.g., in serialisers or schema generators built on top of unacy).

**Avoid when:**
- You only need a single direct conversion with no type guarantees —
- a plain function is lighter and requires no registry setup overhead.
- Your validation logic cannot be expressed as a Zod schema — write
- a custom `Parser<T>` instead, throwing `ParseError` on failure.
- API surface: 11 functions, 5 classes, 27 types

## Pitfalls

- NEVER reassign a registry variable without capturing the `register()` return
- value — each call returns a new instance; the original is unchanged.
- ```typescript
- // WRONG — result is discarded
- const r = createRegistry();
- r.register(CelsiusMeta, FahrenheitMeta, converter); // r is not updated
- // CORRECT — chain the calls
- const registry = createRegistry()
- .register(CelsiusMeta, FahrenheitMeta, converter);
- ```
- NEVER add values of different units directly in arithmetic — the type system
- prevents this at compile time, but if you bypass it with `as`, the runtime
- will silently produce incorrect results with no error.
- NEVER use `as` to cast a `Quantity<Celsius>` to `Quantity<Fahrenheit>` —
- this defeats the entire purpose of the phantom type system.
- NEVER pass a schema whose `.parse()` does not throw on invalid input — the
- returned parser relies on schema rejection to trigger `ParseError`.
- NEVER use `validateEnum` to check plain objects that happen to have string
- values — they may look like string enums but carry no semantic meaning.
- Use `validateRecordSchema` for plain data objects.

## Quick Reference

**Registry:** `createRegistry`, `UnitRegistry`, `UnitMap`, `UnitAccessor`
**Validation:** `createParserWithSchema`, `validateEnum`, `validateClass`, `validateRecordSchema`, `validateTupleSchema`, `isEnumMetadata`, `isClassMetadata`, `isRecordMetadata`, `isTupleMetadata`, `detectMetadataKind`
**Errors:** `UnacyError`, `CycleError`, `MaxDepthError`, `ConversionError`, `ParseError`
**Branding:** `WithUnits`, `WithTypedUnits`, `WithFormat`, `Relax`
**Metadata:** `BaseMetadata`, `TypedMetadata`, `UnitMetadata`
**Types:** `PrimitiveType`, `SupportedType`, `EnumType`, `ClassType`, `RecordSchema`, `TupleSchema`
**types:** `ToPrimitiveTypeName`, `PrimitiveTypeFromName`, `InferFromRecordSchema`, `InferFromTupleSchema`
**Converters:** `Converter`, `BidirectionalConverter`, `RelaxedConverter`, `RelaxedBidirectionalConverter`
**Formatters:** `Formatter`, `Parser`, `FormatterParser`

## Links

- Author: Pradeep Mouli <pmouli@mac.com> (https://github.com/pradeepmouli)