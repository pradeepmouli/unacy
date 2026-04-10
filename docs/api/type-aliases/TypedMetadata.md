[**unacy v1.0.0**](../README.md)

***

[unacy](../packages.md) / TypedMetadata

# Type Alias: TypedMetadata\<T\>

> **TypedMetadata**\<`T`\> = `Simplify`\<\{ `name`: `string`; `type`: `T` *extends* [`PrimitiveType`](PrimitiveType.md) ? [`ToPrimitiveTypeName`](ToPrimitiveTypeName.md)\<`T`\> : `T`; \}\>

Defined in: [packages/core/src/types.ts:244](https://github.com/pradeepmouli/unacy/blob/7e5ab79c98ba3430d0f51e82fb8b3a1d058218ee/packages/core/src/types.ts#L244)

Metadata type for units with type information.

For primitive types, `type` is the type name string (e.g., `'number'`).
For non-primitive types, `type` IS the actual value:
- Enum: the enum object itself
- Class: the class constructor
- Record: the schema object `{ x: 'number', y: 'string' }`
- Tuple: the tuple schema array `['number', 'string']`

## Type Parameters

### T

`T` *extends* [`SupportedType`](SupportedType.md)
