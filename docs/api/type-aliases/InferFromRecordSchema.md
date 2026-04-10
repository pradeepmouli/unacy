[**unacy v1.0.0**](../README.md)

***

[unacy](../packages.md) / InferFromRecordSchema

# Type Alias: InferFromRecordSchema\<S\>

> **InferFromRecordSchema**\<`S`\> = `Simplify`\<`{ [K in keyof S]: S[K] extends string ? PrimitiveTypeFromName<S[K]> : S[K] extends RecordSchema ? InferFromRecordSchema<S[K]> : never }`\>

Defined in: [packages/core/src/types.ts:288](https://github.com/pradeepmouli/unacy/blob/e832fb557c574392ab22fd14b1f66b3ded90f11a/packages/core/src/types.ts#L288)

Infer TypeScript type from a `RecordSchema`.
Recursively processes nested schemas.

## Type Parameters

### S

`S` *extends* [`RecordSchema`](RecordSchema.md)
