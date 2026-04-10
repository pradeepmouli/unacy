[**unacy v1.0.0**](../README.md)

***

[unacy](../packages.md) / Relax

# Type Alias: Relax\<T\>

> **Relax**\<`T`\> = `T` \| `Unwrap`\<`T`\>

Defined in: [packages/core/src/types.ts:183](https://github.com/pradeepmouli/unacy/blob/7e5ab79c98ba3430d0f51e82fb8b3a1d058218ee/packages/core/src/types.ts#L183)

Relax a branded unit type to accept either the branded form or its raw unwrapped value.
Useful for APIs that should accept both `WithUnits<T, M>` and plain `T` interchangeably.

## Type Parameters

### T

`T`
