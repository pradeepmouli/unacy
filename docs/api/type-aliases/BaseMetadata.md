[**unacy v1.0.0**](../README.md)

***

[unacy](../packages.md) / BaseMetadata

# Type Alias: BaseMetadata

> **BaseMetadata** = `object`

Defined in: [packages/core/src/types.ts:220](https://github.com/pradeepmouli/unacy/blob/48ee59106cbea9314eeb1c55929a92b1d10d8465/packages/core/src/types.ts#L220)

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

Defined in: [packages/core/src/types.ts:222](https://github.com/pradeepmouli/unacy/blob/48ee59106cbea9314eeb1c55929a92b1d10d8465/packages/core/src/types.ts#L222)

Unique identifier for the unit (replaces tag)
