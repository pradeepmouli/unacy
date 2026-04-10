[**unacy v1.0.0**](../README.md)

***

[unacy](../packages.md) / UnitRegistry

# Interface: UnitRegistry\<Edges\>

Defined in: [packages/core/src/registry.ts:107](https://github.com/pradeepmouli/unacy/blob/183504d164b047a8cc7d04fd3bd6664982040096/packages/core/src/registry.ts#L107)

Registry for managing and composing unit converters

## Type Parameters

### Edges

`Edges` *extends* `Edge`[] = \[\]

## Methods

### allow()

> **allow**\<`From`, `To`, `FromMeta`, `ToMeta`\>(`from`, `to`): `UnitRegistry`\<\[`...Edges[]`, `Edge`\<`From`, `To`\>\]\> & [`UnitMap`](../type-aliases/UnitMap.md)\<\[`...Edges[]`, `Edge`\<`From`, `To`\>\]\>

Defined in: [packages/core/src/registry.ts:173](https://github.com/pradeepmouli/unacy/blob/183504d164b047a8cc7d04fd3bd6664982040096/packages/core/src/registry.ts#L173)

Explicitly allow a conversion path in the type system (for multi-hop conversions)

This method verifies that a conversion path exists at runtime (via BFS) and adds it
to the type system so it can be used with type-safe accessor syntax.

#### Type Parameters

##### From

`From` *extends* `any`

##### To

`To` *extends* `any`

##### FromMeta

`FromMeta` *extends* `object`

##### ToMeta

`ToMeta` *extends* `object`

#### Parameters

##### from

`FromMeta` \| `UnitsFor`\<`From`\>

Source unit (string name or metadata object)

##### to

`ToMeta` \| `UnitsFor`\<`To`\>

Destination unit (string name or metadata object)

#### Returns

`UnitRegistry`\<\[`...Edges[]`, `Edge`\<`From`, `To`\>\]\> & [`UnitMap`](../type-aliases/UnitMap.md)\<\[`...Edges[]`, `Edge`\<`From`, `To`\>\]\>

New registry instance with the conversion path enabled in types

#### Throws

ConversionError if no path exists between the units

#### Example

```typescript
const registry = createRegistry()
  .register('Celsius', 'Kelvin', c => (c + 273.15) as Kelvin)
  .register('Kelvin', 'Fahrenheit', k => ((k - 273.15) * 9/5 + 32) as Fahrenheit)
  .allow('Celsius', 'Fahrenheit'); // Enable multi-hop path in types

// Now type-safe:
const f = registry.Celsius.to.Fahrenheit(temp);
```

***

### convert()

> **convert**\<`From`\>(`value`, `fromUnit`): `object`

Defined in: [packages/core/src/registry.ts:203](https://github.com/pradeepmouli/unacy/blob/183504d164b047a8cc7d04fd3bd6664982040096/packages/core/src/registry.ts#L203)

Convert a value using fluent API

#### Type Parameters

##### From

`From` *extends* [`WithUnits`](../type-aliases/WithUnits.md)\<[`SupportedType`](../type-aliases/SupportedType.md), [`BaseMetadata`](../type-aliases/BaseMetadata.md)\>

#### Parameters

##### value

`From`

Value to convert

##### fromUnit

`UnitsFor`\<`From`\>

Source unit

#### Returns

`object`

Object with to() method for conversion

##### to()

> **to**\<`To`\>(`unit`): `To`

###### Type Parameters

###### To

`To` *extends* [`WithUnits`](../type-aliases/WithUnits.md)\<[`SupportedType`](../type-aliases/SupportedType.md), [`BaseMetadata`](../type-aliases/BaseMetadata.md)\>

###### Parameters

###### unit

`UnitsFor`\<`To`\>

###### Returns

`To`

***

### getConverter()

> **getConverter**\<`From`, `To`\>(`from`, `to`): [`Converter`](../type-aliases/Converter.md)\<`From`, `To`\> \| `undefined`

Defined in: [packages/core/src/registry.ts:189](https://github.com/pradeepmouli/unacy/blob/183504d164b047a8cc7d04fd3bd6664982040096/packages/core/src/registry.ts#L189)

Get a converter (direct or composed via BFS)

#### Type Parameters

##### From

`From` *extends* [`WithUnits`](../type-aliases/WithUnits.md)\<[`SupportedType`](../type-aliases/SupportedType.md), [`BaseMetadata`](../type-aliases/BaseMetadata.md)\>

##### To

`To` *extends* [`WithUnits`](../type-aliases/WithUnits.md)\<[`SupportedType`](../type-aliases/SupportedType.md), [`BaseMetadata`](../type-aliases/BaseMetadata.md)\>

#### Parameters

##### from

`UnitsFor`\<`From`\>

Source unit

##### to

`UnitsFor`\<`To`\>

Destination unit

#### Returns

[`Converter`](../type-aliases/Converter.md)\<`From`, `To`\> \| `undefined`

Converter function, or undefined if no path exists

***

### register()

#### Call Signature

> **register**\<`From`, `FromMeta`\>(`unit`): `UnitRegistry`\<`Edges`\> & `{ [K in string]: UnitAccessor<From, Edges> }`

Defined in: [packages/core/src/registry.ts:108](https://github.com/pradeepmouli/unacy/blob/183504d164b047a8cc7d04fd3bd6664982040096/packages/core/src/registry.ts#L108)

##### Type Parameters

###### From

`From` *extends* `any`

###### FromMeta

`FromMeta` *extends* `object`

##### Parameters

###### unit

`FromMeta`

##### Returns

`UnitRegistry`\<`Edges`\> & `{ [K in string]: UnitAccessor<From, Edges> }`

#### Call Signature

> **register**\<`From`, `To`, `FromMeta`, `ToMeta`\>(`from`, `to`, `converter`): `UnitRegistry`\<\[`...Edges[]`, `Edge`\<`From`, `To`\>\]\> & [`UnitMap`](../type-aliases/UnitMap.md)\<\[`...Edges[]`, `Edge`\<`From`, `To`\>\]\>

Defined in: [packages/core/src/registry.ts:119](https://github.com/pradeepmouli/unacy/blob/183504d164b047a8cc7d04fd3bd6664982040096/packages/core/src/registry.ts#L119)

Register a unidirectional converter

##### Type Parameters

###### From

`From` *extends* `any`

###### To

`To` *extends* `any`

###### FromMeta

`FromMeta` *extends* `object`

###### ToMeta

`ToMeta` *extends* `object`

##### Parameters

###### from

`FromMeta` \| `NameFor`\<`From`\>

Source unit (string name or metadata object)

###### to

`ToMeta` \| `NameFor`\<`To`\>

Destination unit (string name or metadata object)

###### converter

[`RelaxedConverter`](../type-aliases/RelaxedConverter.md)\<`From`, `To`\>

Converter function (input is branded, output can be plain or branded)

##### Returns

`UnitRegistry`\<\[`...Edges[]`, `Edge`\<`From`, `To`\>\]\> & [`UnitMap`](../type-aliases/UnitMap.md)\<\[`...Edges[]`, `Edge`\<`From`, `To`\>\]\>

New registry instance with the converter registered

#### Call Signature

> **register**\<`From`, `To`, `FromMeta`, `ToMeta`\>(`from`, `to`, `converter`): `UnitRegistry`\<\[`...Edges[]`, `Edge`\<`From`, `To`\>, `Edge`\<`To`, `From`\>\]\> & [`UnitMap`](../type-aliases/UnitMap.md)\<\[`...Edges[]`, `Edge`\<`From`, `To`\>, `Edge`\<`To`, `From`\>\]\>

Defined in: [packages/core/src/registry.ts:137](https://github.com/pradeepmouli/unacy/blob/183504d164b047a8cc7d04fd3bd6664982040096/packages/core/src/registry.ts#L137)

Register a bidirectional converter (both directions)

##### Type Parameters

###### From

`From` *extends* `any`

###### To

`To` *extends* `any`

###### FromMeta

`FromMeta` *extends* `object`

###### ToMeta

`ToMeta` *extends* `object`

##### Parameters

###### from

`FromMeta` \| `NameFor`\<`From`\>

First unit (string name or metadata object)

###### to

`ToMeta` \| `NameFor`\<`To`\>

Second unit (string name or metadata object)

###### converter

[`RelaxedBidirectionalConverter`](../type-aliases/RelaxedBidirectionalConverter.md)\<`From`, `To`\>

Bidirectional converter object (input branded, output can be plain or branded)

##### Returns

`UnitRegistry`\<\[`...Edges[]`, `Edge`\<`From`, `To`\>, `Edge`\<`To`, `From`\>\]\> & [`UnitMap`](../type-aliases/UnitMap.md)\<\[`...Edges[]`, `Edge`\<`From`, `To`\>, `Edge`\<`To`, `From`\>\]\>

New registry instance with both converters registered
