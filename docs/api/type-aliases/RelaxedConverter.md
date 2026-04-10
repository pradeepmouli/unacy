[**unacy v1.0.0**](../README.md)

***

[unacy](../packages.md) / RelaxedConverter

# Type Alias: RelaxedConverter\<TInput, TOutput\>

> **RelaxedConverter**\<`TInput`, `TOutput`\> = (`input`) => `Unwrap`\<`TOutput`\>

Defined in: [packages/core/src/converters.ts:96](https://github.com/pradeepmouli/unacy/blob/183504d164b047a8cc7d04fd3bd6664982040096/packages/core/src/converters.ts#L96)

A converter that accepts the branded input type but returns
unwrapped output. This eliminates the need to cast return values
to branded types inside converter functions, while preserving
full autocompletion on the input parameter.

Since `Tagged<T, ...> extends T`, strict converters returning branded
types are also assignable to this type.

## Type Parameters

### TInput

`TInput`

Source unit-tagged type

### TOutput

`TOutput`

Destination unit-tagged type

## Parameters

### input

`TInput`

## Returns

`Unwrap`\<`TOutput`\>
