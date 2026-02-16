---
"unacy": minor
---

feat(core): add non-primitive type support for enums, classes, records, and tuples

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
