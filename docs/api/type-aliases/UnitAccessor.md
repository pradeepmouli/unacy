[**unacy v1.0.0**](../README.md)

***

[unacy](../packages.md) / UnitAccessor

# Type Alias: UnitAccessor\<From, Edges\>

> **UnitAccessor**\<`From`, `Edges`\> = \{(...`args`): `From`; `to`: `{ [To in ToUnitsFor<Edges, From> as UnitsFor<To>]: (value: Relax<From>) => To }`; `addMetadata`: [`UnitRegistry`](../interfaces/UnitRegistry.md)\<`Edges` *extends* readonly `E`[] ? `E`[] : `never`\> & [`UnitMap`](UnitMap.md)\<`Edges`\>; `register`: [`UnitRegistry`](../interfaces/UnitRegistry.md)\<\[`...Edges[]`, `Edge`\<`From`, `To`\>\]\> & [`UnitMap`](UnitMap.md)\<\[`...Edges[]`, `Edge`\<`From`, `To`\>\]\>; \} & `UnitsOf`\<`From`\>

Defined in: [packages/core/src/registry.ts:58](https://github.com/pradeepmouli/unacy/blob/183504d164b047a8cc7d04fd3bd6664982040096/packages/core/src/registry.ts#L58)

Type for unit accessor with metadata and conversion methods
Can be called as a function to create branded unit values

## Type Parameters

### From

`From` *extends* [`WithTypedUnits`](WithTypedUnits.md)\<[`TypedMetadata`](TypedMetadata.md)\<[`SupportedType`](SupportedType.md)\>\>

### Edges

`Edges` *extends* readonly `Edge`[]
