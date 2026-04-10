[**unacy v1.0.0**](../README.md)

***

[unacy](../packages.md) / TupleSchema

# Type Alias: TupleSchema

> **TupleSchema** = readonly `string`[]

Defined in: [packages/core/src/types.ts:123](https://github.com/pradeepmouli/unacy/blob/7e5ab79c98ba3430d0f51e82fb8b3a1d058218ee/packages/core/src/types.ts#L123)

A schema describing a tuple as an array of primitive type name strings.
Supports optional (`'number?'`) and rest (`'...number'`) modifiers.

## Example

```typescript
const RGBSchema = ['number', 'number', 'number'] as const satisfies TupleSchema;
```
