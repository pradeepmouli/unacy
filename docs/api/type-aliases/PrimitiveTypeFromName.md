[**unacy v1.0.0**](../README.md)

***

[unacy](../packages.md) / PrimitiveTypeFromName

# Type Alias: PrimitiveTypeFromName\<T\>

> **PrimitiveTypeFromName**\<`T`\> = `T` *extends* `"number"` ? `number` : `T` *extends* `"string"` ? `string` : `T` *extends* `"boolean"` ? `boolean` : `T` *extends* `"bigint"` ? `bigint` : `never`

Defined in: [packages/core/src/types.ts:265](https://github.com/pradeepmouli/unacy/blob/183504d164b047a8cc7d04fd3bd6664982040096/packages/core/src/types.ts#L265)

Map type name strings to TypeScript primitive types.

## Type Parameters

### T

`T` *extends* `string`
