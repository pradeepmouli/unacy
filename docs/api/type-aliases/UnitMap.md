[**unacy v1.0.0**](../README.md)

***

[unacy](../packages.md) / UnitMap

# Type Alias: UnitMap\<Edges\>

> **UnitMap**\<`Edges`\> = `{ [FU in FromUnits<Edges> as UnitsFor<FU>]: UnitAccessor<FU, Edges> }`

Defined in: [packages/core/src/registry.ts:100](https://github.com/pradeepmouli/unacy/blob/7e5ab79c98ba3430d0f51e82fb8b3a1d058218ee/packages/core/src/registry.ts#L100)

Type for unit-based conversion accessors
Provides the shape: registry.Celsius.to.Fahrenheit(value)
Only allows conversions that have been registered

## Type Parameters

### Edges

`Edges` *extends* readonly `Edge`[]
