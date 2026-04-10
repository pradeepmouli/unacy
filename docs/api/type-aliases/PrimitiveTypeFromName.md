[**unacy v1.0.0**](../README.md)

***

[unacy](../packages.md) / PrimitiveTypeFromName

# Type Alias: PrimitiveTypeFromName\<T\>

> **PrimitiveTypeFromName**\<`T`\> = `T` *extends* `"number"` ? `number` : `T` *extends* `"string"` ? `string` : `T` *extends* `"boolean"` ? `boolean` : `T` *extends* `"bigint"` ? `bigint` : `never`

Defined in: [packages/core/src/types.ts:274](https://github.com/pradeepmouli/unacy/blob/e832fb557c574392ab22fd14b1f66b3ded90f11a/packages/core/src/types.ts#L274)

Map type name strings to TypeScript primitive types.

## Type Parameters

### T

`T` *extends* `string`
