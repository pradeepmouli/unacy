/**
 * Demo of exporting registry as namespace for selective imports
 * This pattern allows users to import only the converters they need
 */

import { createRegistry, type WithUnits, type BaseMetadata } from './src/index.js';

// Define metadata for temperature units
export const CelsiusMetadata = {
  name: 'Celsius' as const,
  symbol: '°C',
  description: 'Temperature in Celsius'
} satisfies BaseMetadata;

export const FahrenheitMetadata = {
  name: 'Fahrenheit' as const,
  symbol: '°F',
  description: 'Temperature in Fahrenheit'
} satisfies BaseMetadata;

export const KelvinMetadata = {
  name: 'Kelvin' as const,
  symbol: 'K',
  description: 'Absolute temperature'
} satisfies BaseMetadata;

// Define metadata for distance units
export const MetersMetadata = {
  name: 'Meters' as const,
  symbol: 'm',
  description: 'Distance in meters'
} satisfies BaseMetadata;

export const FeetMetadata = {
  name: 'Feet' as const,
  symbol: 'ft',
  description: 'Distance in feet'
} satisfies BaseMetadata;

export const KilometersMetadata = {
  name: 'Kilometers' as const,
  symbol: 'km',
  description: 'Distance in kilometers'
} satisfies BaseMetadata;

// Define unit types with metadata
export type Celsius = WithUnits<number, typeof CelsiusMetadata>;
export type Fahrenheit = WithUnits<number, typeof FahrenheitMetadata>;
export type Kelvin = WithUnits<number, typeof KelvinMetadata>;
export type Meters = WithUnits<number, typeof MetersMetadata>;
export type Feet = WithUnits<number, typeof FeetMetadata>;
export type Kilometers = WithUnits<number, typeof KilometersMetadata>;

// ============================================================================
// Temperature Converters (would be in a separate file like 'temperature.ts')
// ============================================================================

const TemperatureRegistry = createRegistry()
  .register('Celsius', 'Fahrenheit', {
    to: (c) => (c * 9) / 5 + 32,
    from: (f) => ((f - 32) * 5) / 9
  })
  .register('Celsius', 'Kelvin', (c) => c + 273.15)
  .register('Kelvin', 'Celsius', (k) => k - 273.15)
  .allow('Kelvin', 'Fahrenheit');

// Export individual unit converters using destructuring
export const { Celsius, Fahrenheit, Kelvin } = TemperatureRegistry;

// Or export the entire registry if needed
export default TemperatureRegistry;

export const Temperature = TemperatureRegistry;

// ============================================================================
// Distance Converters (would be in a separate file like 'distance.ts')
// ============================================================================

const DistanceRegistry = createRegistry()
  .register('Meters', 'Feet', {
    to: (m) => m * 3.28084,
    from: (ft) => ft / 3.28084
  })
  .register('Meters', 'Kilometers', (m) => m / 1000)
  .register('Kilometers', 'Meters', (km) => km * 1000)
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
