[**unacy v1.0.0**](../README.md)

***

[unacy](../packages.md) / validateEnum

# Function: validateEnum()

> **validateEnum**(`value`): `value is EnumType`

Defined in: [packages/core/src/utils/validation.ts:65](https://github.com/pradeepmouli/unacy/blob/e832fb557c574392ab22fd14b1f66b3ded90f11a/packages/core/src/utils/validation.ts#L65)

Validate that a runtime value is a valid TypeScript enum object.

Accepts numeric enums (with reverse-mapped keys filtered out) and
string enums. Rejects empty objects and mixed enums whose forward
entries contain both string and number values.

## Parameters

### value

`unknown`

The value to validate

## Returns

`value is EnumType`

`true` if `value` is a valid `EnumType`

## Throws

If the enum contains both numeric and string members

## Example

```typescript
enum LogLevel { DEBUG = 0, INFO = 1 }
validateEnum(LogLevel); // true
validateEnum({}); // false
```
