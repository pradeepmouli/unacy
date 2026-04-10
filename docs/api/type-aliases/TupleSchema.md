[**unacy v1.0.0**](../README.md)

***

[unacy](../packages.md) / TupleSchema

# Type Alias: TupleSchema

> **TupleSchema** = readonly `string`[]

Defined in: [packages/core/src/types.ts:123](https://github.com/pradeepmouli/unacy/blob/e832fb557c574392ab22fd14b1f66b3ded90f11a/packages/core/src/types.ts#L123)

A schema describing a tuple as an array of primitive type name strings.
Supports optional (`'number?'`) and rest (`'...number'`) modifiers.

## Example

```typescript
const RGBSchema = ['number', 'number', 'number'] as const satisfies TupleSchema;
```
