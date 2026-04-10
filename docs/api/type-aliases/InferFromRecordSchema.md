[**unacy v1.0.0**](../README.md)

***

[unacy](../packages.md) / InferFromRecordSchema

# Type Alias: InferFromRecordSchema\<S\>

> **InferFromRecordSchema**\<`S`\> = `Simplify`\<`{ [K in keyof S]: S[K] extends string ? PrimitiveTypeFromName<S[K]> : S[K] extends RecordSchema ? InferFromRecordSchema<S[K]> : never }`\>

Defined in: [packages/core/src/types.ts:279](https://github.com/pradeepmouli/unacy/blob/48ee59106cbea9314eeb1c55929a92b1d10d8465/packages/core/src/types.ts#L279)

Infer TypeScript type from a `RecordSchema`.
Recursively processes nested schemas.

## Type Parameters

### S

`S` *extends* [`RecordSchema`](RecordSchema.md)
