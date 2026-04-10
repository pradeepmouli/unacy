[**unacy v1.0.0**](../README.md)

***

[unacy](../packages.md) / BidirectionalConverter

# Type Alias: BidirectionalConverter\<TInput, TOutput\>

> **BidirectionalConverter**\<`TInput`, `TOutput`\> = `object`

Defined in: [packages/core/src/converters.ts:65](https://github.com/pradeepmouli/unacy/blob/7e5ab79c98ba3430d0f51e82fb8b3a1d058218ee/packages/core/src/converters.ts#L65)

Bidirectional converter with forward and reverse transformations.

## Remarks

- Round-trip conversions should preserve value within acceptable tolerance
- Both converters must be deterministic
- Use when both conversion directions are commonly needed

## Example

```typescript
const meterKilometer: BidirectionalConverter<Meters, Kilometers> = {
  to: (m) => (m / 1000) as Kilometers,
  from: (km) => (km * 1000) as Meters
};
```

## Type Parameters

### TInput

`TInput`

First unit type

### TOutput

`TOutput`

Second unit type

## Properties

### from

> **from**: [`Converter`](Converter.md)\<`TOutput`, `TInput`\>

Defined in: [packages/core/src/converters.ts:67](https://github.com/pradeepmouli/unacy/blob/7e5ab79c98ba3430d0f51e82fb8b3a1d058218ee/packages/core/src/converters.ts#L67)

Reverse converter (TOutput → TInput)

***

### to

> **to**: [`Converter`](Converter.md)\<`TInput`, `TOutput`\>

Defined in: [packages/core/src/converters.ts:66](https://github.com/pradeepmouli/unacy/blob/7e5ab79c98ba3430d0f51e82fb8b3a1d058218ee/packages/core/src/converters.ts#L66)

Forward converter (TInput → TOutput)
