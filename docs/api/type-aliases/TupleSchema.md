[**unacy v1.0.0**](../README.md)

***

[unacy](../packages.md) / TupleSchema

# Type Alias: TupleSchema

> **TupleSchema** = readonly `string`[]

Defined in: [packages/core/src/types.ts:123](https://github.com/pradeepmouli/unacy/blob/48ee59106cbea9314eeb1c55929a92b1d10d8465/packages/core/src/types.ts#L123)

A schema describing a tuple as an array of primitive type name strings.
Supports optional (`'number?'`) and rest (`'...number'`) modifiers.

## Example

```typescript
const RGBSchema = ['number', 'number', 'number'] as const satisfies TupleSchema;
```
