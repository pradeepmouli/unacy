[**unacy v1.0.0**](../README.md)

***

[unacy](../packages.md) / UnitMap

# Type Alias: UnitMap\<Edges\>

> **UnitMap**\<`Edges`\> = `{ [FU in FromUnits<Edges> as UnitsFor<FU>]: UnitAccessor<FU, Edges> }`

Defined in: [packages/core/src/registry.ts:100](https://github.com/pradeepmouli/unacy/blob/e832fb557c574392ab22fd14b1f66b3ded90f11a/packages/core/src/registry.ts#L100)

Type for unit-based conversion accessors
Provides the shape: registry.Celsius.to.Fahrenheit(value)
Only allows conversions that have been registered

## Type Parameters

### Edges

`Edges` *extends* readonly `Edge`[]
