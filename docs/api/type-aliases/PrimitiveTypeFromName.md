[**unacy v1.0.0**](../README.md)

***

[unacy](../packages.md) / PrimitiveTypeFromName

# Type Alias: PrimitiveTypeFromName\<T\>

> **PrimitiveTypeFromName**\<`T`\> = `T` *extends* `"number"` ? `number` : `T` *extends* `"string"` ? `string` : `T` *extends* `"boolean"` ? `boolean` : `T` *extends* `"bigint"` ? `bigint` : `never`

Defined in: [packages/core/src/types.ts:274](https://github.com/pradeepmouli/unacy/blob/7e5ab79c98ba3430d0f51e82fb8b3a1d058218ee/packages/core/src/types.ts#L274)

Map type name strings to TypeScript primitive types.

## Type Parameters

### T

`T` *extends* `string`
