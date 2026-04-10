[**unacy v1.0.0**](../README.md)

***

[unacy](../packages.md) / WithFormat

# Type Alias: WithFormat\<T, F\>

> **WithFormat**\<`T`, `F`\> = `Tagged`\<`T`, *typeof* `UNITS`, `F`\>

Defined in: [packages/core/src/types.ts:187](https://github.com/pradeepmouli/unacy/blob/48ee59106cbea9314eeb1c55929a92b1d10d8465/packages/core/src/types.ts#L187)

Brand a value with a format identifier for compile-time format safety.

## Type Parameters

### T

`T`

Base type (e.g., Date, number, string)

### F

`F` *extends* `string`

Format identifier (e.g., 'ISO8601', 'UnixTimestamp')

## Example

```typescript
type ISO8601 = WithFormat<Date, 'ISO8601'>;
const date: ISO8601 = new Date() as ISO8601;
```
