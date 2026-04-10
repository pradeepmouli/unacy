[**unacy v1.0.0**](../README.md)

***

[unacy](../packages.md) / RecordSchema

# Type Alias: RecordSchema

> **RecordSchema** = `object`

Defined in: [packages/core/src/types.ts:112](https://github.com/pradeepmouli/unacy/blob/7e5ab79c98ba3430d0f51e82fb8b3a1d058218ee/packages/core/src/types.ts#L112)

A schema describing an object shape. Keys are property names;
values are primitive type name strings (`'number'`, `'string'`, etc.)
or nested `RecordSchema` objects.

## Index Signature

\[`key`: `string`\]: `RecordSchemaValue`

## Example

```typescript
const PointSchema = { x: 'number', y: 'number' } satisfies RecordSchema;
```
