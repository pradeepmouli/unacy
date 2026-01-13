/**
 * Demo of exporting registry as namespace for selective imports
 * This pattern allows users to import only the converters they need
 */

import { createRegistry, type WithUnits } from './src/index.js';

// Define unit types
export type Celsius = WithUnits<number, 'Celsius'>;
export type Fahrenheit = WithUnits<number, 'Fahrenheit'>;
export type Kelvin = WithUnits<number, 'Kelvin'>;
export type Meters = WithUnits<number, 'Meters'>;
export type Feet = WithUnits<number, 'Feet'>;
export type Kilometers = WithUnits<number, 'Kilometers'>;

// ============================================================================
// Temperature Converters (would be in a separate file like 'temperature.ts')
// ============================================================================

const TemperatureRegistry = createRegistry()
  .register('Celsius', 'Fahrenheit', {
    to: (c: Celsius) => ((c * 9) / 5 + 32) as Fahrenheit,
    from: (f: Fahrenheit) => (((f - 32) * 5) / 9) as Celsius
  })
  .register('Celsius', 'Kelvin', (c: Celsius) => (c + 273.15) as Kelvin)
  .register('Kelvin', 'Celsius', (k: Kelvin) => (k - 273.15) as Celsius)
  .allow('Kelvin', 'Fahrenheit');

// Export individual unit converters using destructuring
//export const { Celsius, Fahrenheit, Kelvin } = TemperatureRegistry;

// Or export the entire registry if needed
export default TemperatureRegistry;

export const Temperature = TemperatureRegistry;

// ============================================================================
// Distance Converters (would be in a separate file like 'distance.ts')
// ============================================================================

const DistanceRegistry = createRegistry()
  .register('Meters', 'Feet', {
    to: (m: Meters) => (m * 3.28084) as Feet,
    from: (ft: Feet) => (ft / 3.28084) as Meters
  })
  .register('Meters', 'Kilometers', (m: Meters) => (m / 1000) as Kilometers)
  .register('Kilometers', 'Meters', (km: Kilometers) => (km * 1000) as Meters)
  .allow('Kilometers', 'Feet');

// Export individual unit converters using destructuring
export const { Meters, Feet, Kilometers } = DistanceRegistry;

// Or export the entire registry
export const Distance = DistanceRegistry;

// ============================================================================
// Usage Examples
// ============================================================================

console.log('=== Namespace Export Pattern Demo ===\n');

// Example 1: Import and use specific converters
console.log('Example 1: Using imported Celsius converter');
const temp = 25 as Celsius;
const fahrenheit = Celsius.to.Fahrenheit(temp);
console.log(`  ${temp}°C = ${fahrenheit}°F`);

// Example 2: Multi-hop conversion (enabled via allow())
console.log('\nExample 2: Multi-hop conversion (Kelvin -> Fahrenheit)');
const kelvin = 300 as Kelvin;
const fahrenheitFromKelvin = Kelvin.to.Fahrenheit(kelvin);
console.log(`  ${kelvin}K = ${fahrenheitFromKelvin}°F`);

// Example 3: Distance conversions
console.log('\nExample 3: Distance conversions');
const distance = 100 as Meters;
const feet = Meters.to.Feet(distance);
const kilometers = Meters.to.Kilometers(distance);
console.log(`  ${distance}m = ${feet}ft = ${kilometers}km`);

// Example 4: Using the full registry namespace
console.log('\nExample 4: Using full registry namespace');
const temp2 = Temperature.Fahrenheit.to.Celsius(77);
const dist2 = Distance.Kilometers.to.Feet(1 as Kilometers);
console.log(`  77°F = ${temp2}°C`);
console.log(`  1km = ${dist2}ft`);

// Example 5: Demonstrating type safety
console.log('\nExample 5: Type safety preserved');
console.log('  ✓ Celsius.to.Fahrenheit - Valid (same dimension)');
console.log('  ✓ Meters.to.Feet - Valid (same dimension)');
console.log('  ✗ Celsius.to.Meters - Compile error (different dimensions)');
// Celsius.to.Meters // Would cause: Property 'Meters' does not exist

console.log('\n=== Benefits of Namespace Pattern ===');
console.log('1. Tree-shaking: Import only what you need');
console.log('2. Clear API: Import { Celsius } from "@mylib/temperature"');
console.log('3. Type-safe: Cross-dimension conversions prevented at compile-time');
console.log('4. Organized: Separate registries for different unit dimensions');
console.log('5. Flexible: Can import individual converters or full registry');
