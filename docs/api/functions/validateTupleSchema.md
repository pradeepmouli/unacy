[**unacy v1.0.0**](../README.md)

***

[unacy](../packages.md) / validateTupleSchema

# Function: validateTupleSchema()

> **validateTupleSchema**(`value`): `value is TupleSchema`

Defined in: [packages/core/src/utils/validation.ts:218](https://github.com/pradeepmouli/unacy/blob/7e5ab79c98ba3430d0f51e82fb8b3a1d058218ee/packages/core/src/utils/validation.ts#L218)

Validate that a runtime value is a valid tuple schema.

A valid tuple schema is an array of primitive type name strings,
optionally annotated with `?` (optional) or `...` (rest) modifiers.
Empty arrays are accepted.

## Parameters

### value

`unknown`

The value to validate

## Returns

`value is TupleSchema`

`true` if `value` is a valid `TupleSchema`

## Throws

If elements are not strings or contain invalid type names

## Example

```typescript
validateTupleSchema(['number', 'number', 'number']); // true
validateTupleSchema(['string', 'number?']); // true (optional)
validateTupleSchema(['number', '...string']); // true (rest)
```
