[**unacy v1.0.0**](../README.md)

***

[unacy](../packages.md) / createRegistry

# Function: createRegistry()

> **createRegistry**\<`Edges`\>(): [`UnitRegistry`](../interfaces/UnitRegistry.md)\<`Edges` *extends* readonly `E`[] ? `E`[] : `never`\> & [`UnitMap`](../type-aliases/UnitMap.md)\<`Edges`\>

Defined in: [packages/core/src/registry.ts:583](https://github.com/pradeepmouli/unacy/blob/7e5ab79c98ba3430d0f51e82fb8b3a1d058218ee/packages/core/src/registry.ts#L583)

Create a new converter registry

## Type Parameters

### Edges

`Edges` *extends* readonly `Edge`\<`any`, `any`\>[] = \[\]

Optional tuple of Edge types to pre-declare available units and conversions

## Returns

[`UnitRegistry`](../interfaces/UnitRegistry.md)\<`Edges` *extends* readonly `E`[] ? `E`[] : `never`\> & [`UnitMap`](../type-aliases/UnitMap.md)\<`Edges`\>

Empty converter registry with unit-based accessors

## Example

```typescript
type Celsius = WithUnits<PrimitiveType, 'Celsius'>;
type Fahrenheit = WithUnits<PrimitiveType, 'Fahrenheit'>;
type Meters = WithUnits<PrimitiveType, 'meters'>;
type Kilometers = WithUnits<PrimitiveType, 'kilometers'>;

// Without pre-declared units
const registry = createRegistry()
  .register('Celsius', 'Fahrenheit', (c: Celsius) => ((c * 9/5) + 32) as Fahrenheit);

// With pre-declared edges (for unit accessor registration before converters exist)
const registry2 = createRegistry<[Edge<'meters', 'kilometers'>]>()
  .meters.register('kilometers', (m) => (m / 1000) as Kilometers);

const temp: Celsius = 25 as Celsius;
const fahrenheit = registry.Celsius.to.Fahrenheit(temp);
console.log(fahrenheit); // 77
```
