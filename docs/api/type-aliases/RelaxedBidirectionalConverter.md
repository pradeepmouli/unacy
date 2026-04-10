[**unacy v1.0.0**](../README.md)

***

[unacy](../packages.md) / RelaxedBidirectionalConverter

# Type Alias: RelaxedBidirectionalConverter\<TInput, TOutput\>

> **RelaxedBidirectionalConverter**\<`TInput`, `TOutput`\> = `object`

Defined in: [packages/core/src/converters.ts:105](https://github.com/pradeepmouli/unacy/blob/656040cb6a1ed107db77963b644a2a627efc52c2/packages/core/src/converters.ts#L105)

A bidirectional converter with relaxed (unwrapped) output types.
Input remains branded for full autocompletion.

## Type Parameters

### TInput

`TInput`

First unit-tagged type

### TOutput

`TOutput`

Second unit-tagged type

## Properties

### from

> **from**: [`RelaxedConverter`](RelaxedConverter.md)\<`TOutput`, `TInput`\>

Defined in: [packages/core/src/converters.ts:107](https://github.com/pradeepmouli/unacy/blob/656040cb6a1ed107db77963b644a2a627efc52c2/packages/core/src/converters.ts#L107)

***

### to

> **to**: [`RelaxedConverter`](RelaxedConverter.md)\<`TInput`, `TOutput`\>

Defined in: [packages/core/src/converters.ts:106](https://github.com/pradeepmouli/unacy/blob/656040cb6a1ed107db77963b644a2a627efc52c2/packages/core/src/converters.ts#L106)
