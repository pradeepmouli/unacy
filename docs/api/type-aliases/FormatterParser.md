[**unacy v1.0.0**](../README.md)

***

[unacy](../packages.md) / FormatterParser

# Type Alias: FormatterParser\<T\>

> **FormatterParser**\<`T`\> = `object`

Defined in: [packages/core/src/formatters.ts:82](https://github.com/pradeepmouli/unacy/blob/e832fb557c574392ab22fd14b1f66b3ded90f11a/packages/core/src/formatters.ts#L82)

Paired formatter/parser for round-trip format transformations.

## Remarks

- Round-trip must succeed for valid values: `parse(format(x)) ≡ x`
- Parser must reject invalid strings with clear errors
- Use when both formatting and parsing are needed

## Example

```typescript
const iso8601: FormatterParser<ISO8601> = {
  format: (date) => date.toISOString(),
  parse: (str) => {
    const date = new Date(str);
    if (isNaN(date.getTime())) {
      throw new ParseError('ISO8601', str, 'Invalid date');
    }
    return date as ISO8601;
  }
};
```

## Type Parameters

### T

`T` *extends* [`WithFormat`](WithFormat.md)\<`unknown`, `string`\>

Format-tagged type

## Properties

### format

> **format**: [`Formatter`](Formatter.md)\<`T`\>

Defined in: [packages/core/src/formatters.ts:83](https://github.com/pradeepmouli/unacy/blob/e832fb557c574392ab22fd14b1f66b3ded90f11a/packages/core/src/formatters.ts#L83)

Converts tagged value → string

***

### parse

> **parse**: [`Parser`](Parser.md)\<`T`\>

Defined in: [packages/core/src/formatters.ts:84](https://github.com/pradeepmouli/unacy/blob/e832fb557c574392ab22fd14b1f66b3ded90f11a/packages/core/src/formatters.ts#L84)

Converts string → tagged value
