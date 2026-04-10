[**unacy v1.0.0**](../README.md)

***

[unacy](../packages.md) / BaseMetadata

# Type Alias: BaseMetadata

> **BaseMetadata** = `object`

Defined in: [packages/core/src/types.ts:229](https://github.com/pradeepmouli/unacy/blob/e832fb557c574392ab22fd14b1f66b3ded90f11a/packages/core/src/types.ts#L229)

Base metadata type that all unit metadata must extend.
Requires a `name` property and allows arbitrary additional properties.

## Example

```typescript
const Celsius = {
  name: 'Celsius' as const,
  symbol: '°C',
  description: 'Temperature in Celsius'
} satisfies BaseMetadata;
```

## Properties

### name

> **name**: `string`

Defined in: [packages/core/src/types.ts:231](https://github.com/pradeepmouli/unacy/blob/e832fb557c574392ab22fd14b1f66b3ded90f11a/packages/core/src/types.ts#L231)

Unique identifier for the unit (replaces tag)
