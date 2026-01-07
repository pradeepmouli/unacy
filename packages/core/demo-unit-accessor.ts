/**
 * Demo of the unit accessor API
 * This file demonstrates the new registry.unit.to.targetUnit(value) API
 */

import { createRegistry, type WithUnits } from './src/index';

// Define unit types
type Celsius = WithUnits<number, 'Celsius'>;
type Fahrenheit = WithUnits<number, 'Fahrenheit'>;
type Kelvin = WithUnits<number, 'Kelvin'>;

// Create registry with converters
const tempRegistry = createRegistry<'Celsius' | 'Fahrenheit' | 'Kelvin'>()
  .registerBidirectional('Celsius', 'Fahrenheit', {
    to: (c) => ((c * 9/5) + 32) as Fahrenheit,
    from: (f) => ((f - 32) * 5/9) as Celsius
  })
  .register('Celsius', 'Kelvin', (c) => (c + 273.15) as Kelvin)
  .register('Kelvin', 'Celsius', (k) => (k - 273.15) as Celsius);

// Test the new unit accessor API
const temp = 25 as Celsius;

// Method 1: Old API (still works)
console.log('Method 1 (convert method):');
const f1 = tempRegistry.convert(temp, 'Celsius').to('Fahrenheit');
console.log(`  ${temp}°C = ${f1}°F`);

// Method 2: New unit accessor API
console.log('\nMethod 2 (unit accessor):');
const f2 = tempRegistry.Celsius.to.Fahrenheit(temp);
console.log(`  ${temp}°C = ${f2}°F`);

// Test multi-hop with unit accessor
console.log('\nMulti-hop conversion (Celsius -> Kelvin -> Celsius -> Fahrenheit):');
const kelvin = 300 as Kelvin;
const fahrenheitFromKelvin = tempRegistry.Kelvin.to.Fahrenheit(kelvin);
console.log(`  ${kelvin}K = ${fahrenheitFromKelvin}°F`);

// Both methods produce the same result
console.log('\nVerification:');
console.log(`  f1 === f2: ${f1 === f2}`);
