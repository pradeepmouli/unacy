[**unacy v1.0.0**](../README.md)

***

[unacy](../packages.md) / validateRecordSchema

# Function: validateRecordSchema()

> **validateRecordSchema**(`value`, `visited?`): `value is RecordSchema`

Defined in: [packages/core/src/utils/validation.ts:149](https://github.com/pradeepmouli/unacy/blob/48ee59106cbea9314eeb1c55929a92b1d10d8465/packages/core/src/utils/validation.ts#L149)

Validate that a runtime value is a valid record schema.

A valid record schema is a plain object whose leaf values are primitive
type name strings (`'number'`, `'string'`, `'boolean'`, `'bigint'`) or
nested record schema objects. Empty objects are accepted.

## Parameters

### value

`unknown`

The value to validate

### visited?

`Set`\<`unknown`\> = `...`

Internal set for circular reference detection

## Returns

`value is RecordSchema`

`true` if `value` is a valid `RecordSchema`

## Throws

If circular references or invalid type names are found

## Example

```typescript
validateRecordSchema({ x: 'number', y: 'number' }); // true
validateRecordSchema({ pos: { x: 'number' } }); // true (nested)
```
