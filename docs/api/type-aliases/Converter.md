[**unacy v1.0.0**](../README.md)

***

[unacy](../packages.md) / Converter

# Type Alias: Converter\<TInput, TOutput\>

> **Converter**\<`TInput`, `TOutput`\> = (`input`) => `TOutput`

Defined in: [packages/core/src/converters.ts:28](https://github.com/pradeepmouli/unacy/blob/e832fb557c574392ab22fd14b1f66b3ded90f11a/packages/core/src/converters.ts#L28)

Unidirectional converter from one unit to another.

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

Value tagged with source unit

## Returns

`TOutput`

Value tagged with destination unit

## Remarks

- Must be a pure function (no side effects)
- Should be deterministic (same input → same output)
- Document precision loss if applicable

## Example

```typescript
const c2f: Converter<Celsius, Fahrenheit> = (c) =>
  ((c * 9/5) + 32) as Fahrenheit;
```
