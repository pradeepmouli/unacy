/**
 * Demo of the unit accessor API
 * This file demonstrates the new registry.unit.to.targetUnit(value) API
 */

import { createRegistry, type WithUnits } from './src/index';
import { Distance, Feet } from './namespace-export-demo.js';

console.log('=== Unit Accessor API Demo ===\n');

// Define unit types
type Celsius = WithUnits<number, 'Celsius'>;
type Fahrenheit = WithUnits<number, 'Fahrenheit'>;
type Kelvin = WithUnits<number, 'Kelvin'>;

// Create registry with converters
const tempRegistry = createRegistry()
  .register('Celsius', 'Fahrenheit', {
    to: (c: Celsius) => ((c * 9) / 5 + 32) as Fahrenheit,
    from: (f: Fahrenheit) => (((f - 32) * 5) / 9) as Celsius
  })
  .register('Celsius', 'Kelvin', (c: Celsius) => (c + 273.15) as Kelvin)
  .register('Kelvin', 'Celsius', (k: Kelvin) => (k - 273.15) as Celsius)
  .allow('Kelvin', 'Fahrenheit'); // Explicitly enable multi-hop path in types

// This demonstrates that the following would NOT be permitted at compile-time:
// tempRegistry.Celsius.to.Meters - Error: Property 'Meters' does not exist

// Test the new unit accessor API
const temp = 25 as Celsius;

// Method 1: convert() method API
console.log('Method 1 (convert method):');
const f1 = tempRegistry.convert(temp, 'Celsius').to('Fahrenheit');
console.log(`  ${temp}°C = ${f1}°F`);

// Method 2: Unit accessor API
console.log('\nMethod 2 (unit accessor):');
const f2 = tempRegistry.Celsius.to.Fahrenheit(temp);
console.log(`  ${temp}°C = ${f2}°F`);

// Test multi-hop with unit accessor
console.log('\nMulti-hop conversion (Celsius -> Kelvin -> Celsius):');
const kelvinValue = tempRegistry.Celsius.to.Kelvin(temp);
const backToCelsius = tempRegistry.Kelvin.to.Celsius(kelvinValue);
console.log(`  ${temp}°C = ${kelvinValue}K = ${backToCelsius}°C`);

// Test composed conversion (Kelvin -> Celsius -> Fahrenheit)
// With allow(), multi-hop conversions are now type-safe!
console.log('\nComposed conversion (Kelvin -> Fahrenheit via Celsius):');
const kelvin = 300 as Kelvin;
const fahrenheitFromKelvin = tempRegistry.Kelvin.to.Fahrenheit(kelvin); // Type-safe!
console.log(`  ${kelvin}K = ${fahrenheitFromKelvin}°F`);

// Both methods produce the same result
console.log('\nVerification:');
console.log(`  f1 === f2: ${f1 === f2}`);
