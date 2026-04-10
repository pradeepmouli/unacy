[**unacy v1.0.0**](../README.md)

***

[unacy](../packages.md) / RecordSchema

# Type Alias: RecordSchema

> **RecordSchema** = `object`

Defined in: [packages/core/src/types.ts:112](https://github.com/pradeepmouli/unacy/blob/48ee59106cbea9314eeb1c55929a92b1d10d8465/packages/core/src/types.ts#L112)

A schema describing an object shape. Keys are property names;
values are primitive type name strings (`'number'`, `'string'`, etc.)
or nested `RecordSchema` objects.

## Index Signature

\[`key`: `string`\]: `RecordSchemaValue`

## Example

```typescript
const PointSchema = { x: 'number', y: 'number' } satisfies RecordSchema;
```
