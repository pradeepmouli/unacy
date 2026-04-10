[**unacy v1.0.0**](../README.md)

***

[unacy](../packages.md) / createParserWithSchema

# Function: createParserWithSchema()

> **createParserWithSchema**\<`F`, `T`\>(`schema`, `format`): [`Parser`](../type-aliases/Parser.md)\<[`WithFormat`](../type-aliases/WithFormat.md)\<`T`, `F`\>\>

Defined in: [packages/core/src/utils/validation.ts:28](https://github.com/pradeepmouli/unacy/blob/e832fb557c574392ab22fd14b1f66b3ded90f11a/packages/core/src/utils/validation.ts#L28)

Create a parser with Zod schema validation.

## Type Parameters

### F

`F` *extends* `string`

Format identifier

### T

`T`

Base type

## Parameters

### schema

`any`

Zod schema for validation

### format

`F`

Format identifier string

## Returns

[`Parser`](../type-aliases/Parser.md)\<[`WithFormat`](../type-aliases/WithFormat.md)\<`T`, `F`\>\>

Parser function that validates and tags values

## Example

```typescript
const parseHex = createParserWithSchema(
  z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  'HexColor'
);
```
