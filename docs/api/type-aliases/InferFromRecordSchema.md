[**unacy v1.0.0**](../README.md)

***

[unacy](../packages.md) / InferFromRecordSchema

# Type Alias: InferFromRecordSchema\<S\>

> **InferFromRecordSchema**\<`S`\> = `Simplify`\<`{ [K in keyof S]: S[K] extends string ? PrimitiveTypeFromName<S[K]> : S[K] extends RecordSchema ? InferFromRecordSchema<S[K]> : never }`\>

Defined in: [packages/core/src/types.ts:288](https://github.com/pradeepmouli/unacy/blob/7e5ab79c98ba3430d0f51e82fb8b3a1d058218ee/packages/core/src/types.ts#L288)

Infer TypeScript type from a `RecordSchema`.
Recursively processes nested schemas.

## Type Parameters

### S

`S` *extends* [`RecordSchema`](RecordSchema.md)
