[**unacy v1.0.0**](../README.md)

***

[unacy](../packages.md) / validateClass

# Function: validateClass()

> **validateClass**(`value`): `value is ClassType`

Defined in: [packages/core/src/utils/validation.ts:118](https://github.com/pradeepmouli/unacy/blob/7e5ab79c98ba3430d0f51e82fb8b3a1d058218ee/packages/core/src/utils/validation.ts#L118)

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
