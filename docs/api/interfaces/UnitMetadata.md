[**unacy v1.0.0**](../README.md)

***

[unacy](../packages.md) / UnitMetadata

# Interface: UnitMetadata

Defined in: [packages/core/src/types.ts:254](https://github.com/pradeepmouli/unacy/blob/7e5ab79c98ba3430d0f51e82fb8b3a1d058218ee/packages/core/src/types.ts#L254)

Metadata that can be attached to units in the registry
Supports common properties like abbreviation, format, description,
and allows arbitrary custom properties via index signature

## Indexable

> \[`key`: `string`\]: `unknown`

Allow arbitrary custom metadata properties

## Properties

### abbreviation?

> `optional` **abbreviation?**: `string`

Defined in: [packages/core/src/types.ts:256](https://github.com/pradeepmouli/unacy/blob/7e5ab79c98ba3430d0f51e82fb8b3a1d058218ee/packages/core/src/types.ts#L256)

Short abbreviation for the unit (e.g., "°C", "m", "kg")

***

### description?

> `optional` **description?**: `string`

Defined in: [packages/core/src/types.ts:260](https://github.com/pradeepmouli/unacy/blob/7e5ab79c98ba3430d0f51e82fb8b3a1d058218ee/packages/core/src/types.ts#L260)

Human-readable description of the unit

***

### format?

> `optional` **format?**: `string`

Defined in: [packages/core/src/types.ts:258](https://github.com/pradeepmouli/unacy/blob/7e5ab79c98ba3430d0f51e82fb8b3a1d058218ee/packages/core/src/types.ts#L258)

Format string for displaying values (e.g., "${value}°C")

***

### symbol?

> `optional` **symbol?**: `string`

Defined in: [packages/core/src/types.ts:262](https://github.com/pradeepmouli/unacy/blob/7e5ab79c98ba3430d0f51e82fb8b3a1d058218ee/packages/core/src/types.ts#L262)

Symbol representation of the unit
