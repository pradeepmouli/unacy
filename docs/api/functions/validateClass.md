[**unacy v1.0.0**](../README.md)

***

[unacy](../packages.md) / validateClass

# Function: validateClass()

> **validateClass**(`value`): `value is ClassType`

Defined in: [packages/core/src/utils/validation.ts:118](https://github.com/pradeepmouli/unacy/blob/e832fb557c574392ab22fd14b1f66b3ded90f11a/packages/core/src/utils/validation.ts#L118)

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
