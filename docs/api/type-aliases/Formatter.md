[**unacy v1.0.0**](../README.md)

***

[unacy](../packages.md) / Formatter

# Type Alias: Formatter\<TInput\>

> **Formatter**\<`TInput`\> = (`input`) => `string`

Defined in: [packages/core/src/formatters.ts:26](https://github.com/pradeepmouli/unacy/blob/48ee59106cbea9314eeb1c55929a92b1d10d8465/packages/core/src/formatters.ts#L26)

Formatter converts a format-tagged value to a string representation.

## Type Parameters

### TInput

`TInput` *extends* [`WithFormat`](WithFormat.md)\<`unknown`, `string`\>

Format-tagged type to format

## Parameters

### input

`TInput`

Value tagged with format

## Returns

`string`

Plain string representation

## Remarks

- Output string must be parseable by corresponding `Parser`
- Should produce human-readable or machine-parseable output
- Format tag is lost in the output

## Example

```typescript
const formatISO: Formatter<ISO8601> = (date) => date.toISOString();
```
