[**unacy v1.0.0**](../README.md)

***

[unacy](../packages.md) / Parser

# Type Alias: Parser\<TOutput\>

> **Parser**\<`TOutput`\> = (`input`) => `TOutput`

Defined in: [packages/core/src/formatters.ts:53](https://github.com/pradeepmouli/unacy/blob/e832fb557c574392ab22fd14b1f66b3ded90f11a/packages/core/src/formatters.ts#L53)

Parser converts a string into a format-tagged value with validation.

## Type Parameters

### TOutput

`TOutput` *extends* [`WithFormat`](WithFormat.md)\<`unknown`, `string`\>

Format-tagged type to produce

## Parameters

### input

`string`

Plain string to parse

## Returns

`TOutput`

Value tagged with format

## Throws

When input string is invalid

## Remarks

- Must validate input before tagging
- Must throw clear errors (not return invalid tagged values)
- Should use Zod or similar for schema validation
- Never produces invalid tagged values

## Example

```typescript
const parseISO: Parser<ISO8601> = (input) => {
  const schema = z.string().datetime();
  const validated = schema.parse(input);
  return new Date(validated) as ISO8601;
};
```
