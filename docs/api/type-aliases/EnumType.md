[**unacy v1.0.0**](../README.md)

***

[unacy](../packages.md) / EnumType

# Type Alias: EnumType

> **EnumType** = `Record`\<`string`, `string` \| `number`\>

Defined in: [packages/core/src/types.ts:90](https://github.com/pradeepmouli/unacy/blob/656040cb6a1ed107db77963b644a2a627efc52c2/packages/core/src/types.ts#L90)

A TypeScript enum object at runtime — an object whose values are all
strings (string enum) or all numbers (numeric enum).
Mixed enums (both string and number values) are rejected at validation.
