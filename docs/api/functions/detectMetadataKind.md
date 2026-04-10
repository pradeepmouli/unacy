[**unacy v1.0.0**](../README.md)

***

[unacy](../packages.md) / detectMetadataKind

# Function: detectMetadataKind()

> **detectMetadataKind**(`meta`): `"primitive"` \| `"enum"` \| `"class"` \| `"tuple"` \| `"record"` \| `"unknown"`

Defined in: [packages/core/src/utils/validation.ts:368](https://github.com/pradeepmouli/unacy/blob/48ee59106cbea9314eeb1c55929a92b1d10d8465/packages/core/src/utils/validation.ts#L368)

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
