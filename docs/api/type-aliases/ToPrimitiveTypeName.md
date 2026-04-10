[**unacy v1.0.0**](../README.md)

***

[unacy](../packages.md) / ToPrimitiveTypeName

# Type Alias: ToPrimitiveTypeName\<T\>

> **ToPrimitiveTypeName**\<`T`\> = `T` *extends* `PrimitiveTypeMap`\[infer U\] ? `U` : `never`

Defined in: [packages/core/src/types.ts:143](https://github.com/pradeepmouli/unacy/blob/e832fb557c574392ab22fd14b1f66b3ded90f11a/packages/core/src/types.ts#L143)

Map a primitive TypeScript type to its corresponding type name string.
For example, `number` → `'number'`, `string` → `'string'`, `boolean` → `'boolean'`, `bigint` → `'bigint'`.
Returns `never` for non-primitive types.

## Type Parameters

### T

`T`
