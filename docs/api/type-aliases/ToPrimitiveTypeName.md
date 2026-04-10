[**unacy v1.0.0**](../README.md)

***

[unacy](../packages.md) / ToPrimitiveTypeName

# Type Alias: ToPrimitiveTypeName\<T\>

> **ToPrimitiveTypeName**\<`T`\> = `T` *extends* `PrimitiveTypeMap`\[infer U\] ? `U` : `never`

Defined in: [packages/core/src/types.ts:143](https://github.com/pradeepmouli/unacy/blob/7e5ab79c98ba3430d0f51e82fb8b3a1d058218ee/packages/core/src/types.ts#L143)

Map a primitive TypeScript type to its corresponding type name string.
For example, `number` → `'number'`, `string` → `'string'`, `boolean` → `'boolean'`, `bigint` → `'bigint'`.
Returns `never` for non-primitive types.

## Type Parameters

### T

`T`
