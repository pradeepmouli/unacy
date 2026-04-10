[**unacy v1.0.0**](../README.md)

***

[unacy](../packages.md) / PrimitiveTypeFromName

# Type Alias: PrimitiveTypeFromName\<T\>

> **PrimitiveTypeFromName**\<`T`\> = `T` *extends* `"number"` ? `number` : `T` *extends* `"string"` ? `string` : `T` *extends* `"boolean"` ? `boolean` : `T` *extends* `"bigint"` ? `bigint` : `never`

Defined in: [packages/core/src/types.ts:265](https://github.com/pradeepmouli/unacy/blob/48ee59106cbea9314eeb1c55929a92b1d10d8465/packages/core/src/types.ts#L265)

Map type name strings to TypeScript primitive types.

## Type Parameters

### T

`T` *extends* `string`
