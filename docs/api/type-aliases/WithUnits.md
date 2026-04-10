[**unacy v1.0.0**](../README.md)

***

[unacy](../packages.md) / WithUnits

# Type Alias: WithUnits\<T, M\>

> **WithUnits**\<`T`, `M`\> = `Tagged`\<`T`, *typeof* `UNITS`, `M`\>

Defined in: [packages/core/src/types.ts:80](https://github.com/pradeepmouli/unacy/blob/656040cb6a1ed107db77963b644a2a627efc52c2/packages/core/src/types.ts#L80)

Brand a value with a unit identifier for compile-time unit safety.

## Type Parameters

### T

`T`

Base type (e.g., number, bigint, record, tuple, class instance)

### M

`M` *extends* [`BaseMetadata`](BaseMetadata.md) = [`BaseMetadata`](BaseMetadata.md)

Metadata type (must extend BaseMetadata with required name property)

## Example

```typescript
const Celsius = { name: 'Celsius' as const, symbol: '°C' } satisfies BaseMetadata;
type Celsius = WithUnits<number, typeof Celsius>;
const temp: Celsius = 25 as Celsius;
```
