[**unacy v1.0.0**](../README.md)

***

[unacy](../packages.md) / validateClass

# Function: validateClass()

> **validateClass**(`value`): `value is ClassType`

Defined in: [packages/core/src/utils/validation.ts:118](https://github.com/pradeepmouli/unacy/blob/656040cb6a1ed107db77963b644a2a627efc52c2/packages/core/src/utils/validation.ts#L118)

Validate that a runtime value is a valid class constructor.

Checks that the value is a function with a `prototype` property.
Arrow functions and bound functions without prototypes are rejected.

## Parameters

### value

`unknown`

The value to validate

## Returns

`value is ClassType`

`true` if `value` is a valid `ClassType` constructor
