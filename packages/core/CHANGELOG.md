# unacy

## 0.8.0

### Minor Changes

- [#12](https://github.com/pradeepmouli/unacy/pull/12) [`2e1adf1`](https://github.com/pradeepmouli/unacy/commit/2e1adf1a5d894cf2a97bf96d49e8063f7f680a91) Thanks [@pradeepmouli](https://github.com/pradeepmouli)! - feat(core): add non-primitive type support for enums, classes, records, and tuples

  The metadata `type` field now accepts non-primitive values directly:

  - **Enums**: `{ name: 'LogLevel', type: LogLevel }` — numeric or string enums
  - **Classes**: `{ name: 'Temperature', type: Temperature }` — class constructors
  - **Records**: `{ name: 'Point', type: { x: 'number', y: 'number' } }` — object schemas
  - **Tuples**: `{ name: 'RGB', type: ['number', 'number', 'number'] }` — array schemas

  New exports:

  - Types: `SupportedType`, `EnumType`, `ClassType`, `RecordSchema`, `TupleSchema`
  - Validators: `validateEnum`, `validateClass`, `validateRecordSchema`, `validateTupleSchema`
  - Type guards: `isEnumMetadata`, `isClassMetadata`, `isRecordMetadata`, `isTupleMetadata`
  - Introspection: `detectMetadataKind`
  - Type inference: `PrimitiveTypeFromName`, `InferFromRecordSchema`, `InferFromTupleSchema`

## 0.7.0

### Minor Changes

- add support for typed metadata + non number units

## 0.6.0

### Minor Changes

- typing enhancements

## 0.5.0

### Minor Changes

- Updated core and tooling dependencies to newer minor/patch versions to align with the broader ecosystem; no breaking changes are expected.

## 0.4.0

### Minor Changes

- fix module resolution

## 0.3.0

### Minor Changes

- make units callable

## 0.2.0

### Minor Changes

- cleanup

## 0.1.2

### Patch Changes

- 2e0cdaa: type fixes

## 0.1.1

### Patch Changes

- dependency cleanup
