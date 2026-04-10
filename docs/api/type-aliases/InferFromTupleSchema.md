[**unacy v1.0.0**](../README.md)

***

[unacy](../packages.md) / InferFromTupleSchema

# Type Alias: InferFromTupleSchema\<T\>

> **InferFromTupleSchema**\<`T`\> = `T` *extends* readonly \[\] ? \[\] : `T` *extends* readonly \[infer Head, `...(infer Rest extends readonly string[])`\] ? `Head` *extends* `` `...${infer Base}` `` ? `Rest` *extends* readonly \[\] ? \[`...PrimitiveTypeFromName<Base>[]`\] : `never` : `Head` *extends* `` `${infer Base}?` `` ? \[[`PrimitiveTypeFromName`](PrimitiveTypeFromName.md)\<`Base`\>?, `...InferFromTupleSchema<Rest>`\] : \[[`PrimitiveTypeFromName`](PrimitiveTypeFromName.md)\<`Head`\>, `...InferFromTupleSchema<Rest>`\] : `never`

Defined in: [packages/core/src/types.ts:300](https://github.com/pradeepmouli/unacy/blob/e832fb557c574392ab22fd14b1f66b3ded90f11a/packages/core/src/types.ts#L300)

Infer TypeScript type from a `TupleSchema`.
Handles optional (`?`) and rest (`...`) elements.

## Type Parameters

### T

`T` *extends* readonly `string`[]
