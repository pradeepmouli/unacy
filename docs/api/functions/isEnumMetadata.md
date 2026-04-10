[**unacy v1.0.0**](../README.md)

***

[unacy](../packages.md) / isEnumMetadata

# Function: isEnumMetadata()

> **isEnumMetadata**(`meta`): `meta is { name: string; type: EnumType }`

Defined in: [packages/core/src/utils/validation.ts:269](https://github.com/pradeepmouli/unacy/blob/e832fb557c574392ab22fd14b1f66b3ded90f11a/packages/core/src/utils/validation.ts#L269)

Type guard: returns `true` when `meta.type` is an enum object.

Distinguishes enums from record schemas by first checking whether the
value passes `validateRecordSchema`; if it does, the metadata is
classified as a record, not an enum.

## Parameters

### meta

`unknown`

Metadata object to inspect

## Returns

`meta is { name: string; type: EnumType }`
