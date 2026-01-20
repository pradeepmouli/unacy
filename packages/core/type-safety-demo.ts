/**
 * Demonstration of improved type safety in registry
 * This file shows that invalid conversions are caught at compile-time
 */

import { createRegistry, type WithUnits, type BaseMetadata } from './src/index.js';

// Define metadata for temperature units
const CelsiusMetadata = {
  name: 'Celsius' as const,
  type: 'number' as const,
  symbol: '°C'
};

const FahrenheitMetadata = {
  name: 'Fahrenheit' as const,
  type: 'number' as const,
  symbol: '°F'
};

// Define metadata for distance units
const MetersMetadata = {
  name: 'Meters' as const,
  type: 'number' as const,
  symbol: 'm'
};

const FeetMetadata = {
  name: 'Feet' as const,
  type: 'number' as const,
  symbol: 'ft'
};

// Define unit types for different dimensions
type Celsius = WithUnits<number, typeof CelsiusMetadata>;
type Fahrenheit = WithUnits<number, typeof FahrenheitMetadata>;
type Meters = WithUnits<number, typeof MetersMetadata>;
type Feet = WithUnits<number, typeof FeetMetadata>;

// Create separate registries for temperature and distance
const tempRegistry = createRegistry().register(CelsiusMetadata, FahrenheitMetadata, {
  to: (c: number) => (c * 9) / 5 + 32,
  from: (f: number) => ((f - 32) * 5) / 9
});

const distanceRegistry = createRegistry().register(MetersMetadata, FeetMetadata, {
  to: (m: number) => (m * 3.28084) as Feet,
  from: (ft: number) => (ft / 3.28084) as Meters
});

// ✅ Valid: Converting within the same dimension
const temp = 25 as Celsius;
const fahrenheit = tempRegistry.Celsius.to.Fahrenheit(temp);
console.log(`${temp}°C = ${fahrenheit}°F`);

const distance = 10 as Meters;
const feet = distanceRegistry.Meters.to.Feet(distance);
console.log(`${distance}m = ${feet}ft`);

// ❌ Invalid: These will cause compile-time errors (uncomment to test):
// const invalid1 = tempRegistry.Celsius.to.Meters(temp);
// Error: Property 'Meters' does not exist on type '{ Fahrenheit: ... }'

// const invalid2 = distanceRegistry.Feet.to.Celsius(feet);
// Error: Property 'Celsius' does not exist on type '{ Meters: ... }'

// ✅ Valid: Combining registries (mixed dimensions)
const mixedRegistry = createRegistry()
  .register(CelsiusMetadata, FahrenheitMetadata, {
    to: (c: number) => ((c * 9) / 5 + 32) as Fahrenheit,
    from: (f: number) => (((f - 32) * 5) / 9) as Celsius
  })
  .register(MetersMetadata, FeetMetadata, {
    to: (m: number) => (m * 3.28084) as Feet,
    from: (ft: number) => (ft / 3.28084) as Meters
  });

// Both conversions work in the mixed registry
const temp2 = mixedRegistry.Celsius.to.Fahrenheit(25 as Celsius);
const dist2 = mixedRegistry.Meters.to.Feet(10 as Meters);
console.log(`Mixed registry: ${temp2}°F, ${dist2}ft`);

// ❌ But cross-dimension conversions are still prevented:
// const invalid3 = mixedRegistry.Celsius.to.Meters(temp);
// Error: Property 'Meters' does not exist on type '{ Fahrenheit: ... }'

console.log('\n✅ Type safety demonstration complete!');
console.log('The registry correctly prevents invalid cross-dimension conversions at compile-time.');
