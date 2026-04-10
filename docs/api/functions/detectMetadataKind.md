[**unacy v1.0.0**](../README.md)

***

[unacy](../packages.md) / detectMetadataKind

# Function: detectMetadataKind()

> **detectMetadataKind**(`meta`): `"primitive"` \| `"enum"` \| `"class"` \| `"tuple"` \| `"record"` \| `"unknown"`

Defined in: [packages/core/src/utils/validation.ts:368](https://github.com/pradeepmouli/unacy/blob/e832fb557c574392ab22fd14b1f66b3ded90f11a/packages/core/src/utils/validation.ts#L368)

Detect the kind of a metadata object by inspecting its `type` field.

Resolution priority: `primitive` → `class` → `tuple` → `record` → `enum`.
Returns `'unknown'` when the value is not a recognised metadata shape.

## Parameters

### meta

`unknown`

Metadata object to categorise

## Returns

`"primitive"` \| `"enum"` \| `"class"` \| `"tuple"` \| `"record"` \| `"unknown"`

The detected kind string
