[**unacy v1.0.0**](../README.md)

***

[unacy](../packages.md) / isClassMetadata

# Function: isClassMetadata()

> **isClassMetadata**(`meta`): `meta is { name: string; type: ClassType }`

Defined in: [packages/core/src/utils/validation.ts:305](https://github.com/pradeepmouli/unacy/blob/183504d164b047a8cc7d04fd3bd6664982040096/packages/core/src/utils/validation.ts#L305)

Type guard: returns `true` when `meta.type` is a class constructor.

## Parameters

### meta

`unknown`

Metadata object to inspect

## Returns

`meta is { name: string; type: ClassType }`
