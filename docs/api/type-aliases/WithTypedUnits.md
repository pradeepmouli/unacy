[**unacy v1.0.0**](../README.md)

***

[unacy](../packages.md) / WithTypedUnits

# Type Alias: WithTypedUnits\<M\>

> **WithTypedUnits**\<`M`\> = `unknown` *extends* `M` ? [`WithUnits`](WithUnits.md)\<`any`, `any`\> : `M` *extends* `object` ? `TypeField` *extends* keyof `PrimitiveTypeMap` ? [`WithUnits`](WithUnits.md)\<`PrimitiveTypeMap`\[`TypeField`\], `M`\> : `TypeField` *extends* [`SupportedType`](SupportedType.md) ? [`WithUnits`](WithUnits.md)\<`ResolveValueType`\<`TypeField`\>, `M`\> : `never` : `never`

Defined in: [packages/core/src/types.ts:57](https://github.com/pradeepmouli/unacy/blob/656040cb6a1ed107db77963b644a2a627efc52c2/packages/core/src/types.ts#L57)

Resolve a branded unit type from a `TypedMetadata` object.

For primitive metadata (where `type` is a name string like `'number'`),
maps back through `PrimitiveTypeMap` to recover the base primitive.
For non-primitive metadata (enum, class, record, tuple), resolves to
the actual runtime value type via `ResolveValueType`.

## Type Parameters

### M

`M` *extends* [`TypedMetadata`](TypedMetadata.md)\<`any`\>

A `TypedMetadata` instance (e.g., `typeof CelsiusMetadata`)

## Example

```typescript
const CelsiusMeta = { name: 'Celsius', type: 'number' } as const;
type Celsius = WithTypedUnits<typeof CelsiusMeta>;
// Celsius = Tagged<number, UNITS, typeof CelsiusMeta>
```
