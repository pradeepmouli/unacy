[**unacy v1.0.0**](../README.md)

***

[unacy](../packages.md) / UnitMetadata

# Interface: UnitMetadata

Defined in: [packages/core/src/types.ts:245](https://github.com/pradeepmouli/unacy/blob/183504d164b047a8cc7d04fd3bd6664982040096/packages/core/src/types.ts#L245)

Metadata that can be attached to units in the registry
Supports common properties like abbreviation, format, description,
and allows arbitrary custom properties via index signature

## Indexable

> \[`key`: `string`\]: `unknown`

Allow arbitrary custom metadata properties

## Properties

### abbreviation?

> `optional` **abbreviation?**: `string`

Defined in: [packages/core/src/types.ts:247](https://github.com/pradeepmouli/unacy/blob/183504d164b047a8cc7d04fd3bd6664982040096/packages/core/src/types.ts#L247)

Short abbreviation for the unit (e.g., "°C", "m", "kg")

***

### description?

> `optional` **description?**: `string`

Defined in: [packages/core/src/types.ts:251](https://github.com/pradeepmouli/unacy/blob/183504d164b047a8cc7d04fd3bd6664982040096/packages/core/src/types.ts#L251)

Human-readable description of the unit

***

### format?

> `optional` **format?**: `string`

Defined in: [packages/core/src/types.ts:249](https://github.com/pradeepmouli/unacy/blob/183504d164b047a8cc7d04fd3bd6664982040096/packages/core/src/types.ts#L249)

Format string for displaying values (e.g., "${value}°C")

***

### symbol?

> `optional` **symbol?**: `string`

Defined in: [packages/core/src/types.ts:253](https://github.com/pradeepmouli/unacy/blob/183504d164b047a8cc7d04fd3bd6664982040096/packages/core/src/types.ts#L253)

Symbol representation of the unit
