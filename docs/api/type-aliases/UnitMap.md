[**unacy v1.0.0**](../README.md)

***

[unacy](../packages.md) / UnitMap

# Type Alias: UnitMap\<Edges\>

> **UnitMap**\<`Edges`\> = `{ [FU in FromUnits<Edges> as UnitsFor<FU>]: UnitAccessor<FU, Edges> }`

Defined in: [packages/core/src/registry.ts:100](https://github.com/pradeepmouli/unacy/blob/183504d164b047a8cc7d04fd3bd6664982040096/packages/core/src/registry.ts#L100)

Type for unit-based conversion accessors
Provides the shape: registry.Celsius.to.Fahrenheit(value)
Only allows conversions that have been registered

## Type Parameters

### Edges

`Edges` *extends* readonly `Edge`[]
