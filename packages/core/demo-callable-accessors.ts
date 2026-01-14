/**
 * Demo of callable unit accessors
 * This file demonstrates how to use registry.Unit(value) to create branded values
 */

import { createRegistry, type WithUnits } from './src/index.js';

console.log('=== Callable Unit Accessor Demo ===\n');

// Define unit types
type Celsius = WithUnits<number, 'Celsius'>;
type Fahrenheit = WithUnits<number, 'Fahrenheit'>;
type Kelvin = WithUnits<number, 'Kelvin'>;
type Meters = WithUnits<number, 'meters'>;
type Kilometers = WithUnits<number, 'kilometers'>;

// Create registry with temperature converters
const registry = createRegistry()
  .register('Celsius', 'Fahrenheit', (c) => (c * 9) / 5 + 32)
  .register('Fahrenheit', 'Celsius', (f) => ((f - 32) * 5) / 9)
  .register('Celsius', 'Kelvin', (c) => c + 273.15)
  .register('Kelvin', 'Celsius', (k) => k - 273.15)
  .allow('Fahrenheit', 'Kelvin')
  .allow('Kelvin', 'Fahrenheit')
  .Celsius.addMetadata({
    abbreviation: '°C',
    format: '${value}°C',
    description: 'Temperature in Celsius'
  })
  .Fahrenheit.addMetadata({
    abbreviation: '°F',
    format: '${value}°F',
    description: 'Temperature in Fahrenheit'
  })
  .Kelvin.addMetadata({
    abbreviation: 'K',
    format: '${value}K',
    description: 'Temperature in Kelvin'
  });

export default registry;

let a = registry.Celsius(10 + 5);

// ===== Part 1: Creating branded values using callable accessors =====
console.log('Part 1: Creating branded values\n');

// Old way: manual casting
const tempOld: Celsius = 25 as Celsius;
console.log('Old way (manual cast): const temp: Celsius = 25 as Celsius;');

// New way: callable accessor
const temp = registry.Celsius(25);
console.log('New way (callable):     const temp = registry.Celsius(25);');
console.log(`  Value: ${temp}\n`);

// ===== Part 2: Fluent workflow with callable accessors =====
console.log('Part 2: Fluent workflow\n');

// Create a temperature and convert it in one fluent chain
const fahrenheit = registry.Celsius.to.Fahrenheit(registry.Celsius(20));
console.log('Fluent conversion:');
console.log('  registry.Celsius.to.Fahrenheit(registry.Celsius(20))');
console.log(`  ${20}°C = ${fahrenheit}°F\n`);

// ===== Part 3: Multiple conversions =====
console.log('Part 3: Multiple conversions\n');

const baseTemp = registry.Celsius(0);
const f = registry.Celsius.to.Fahrenheit(baseTemp);
const k = registry.Celsius.to.Kelvin(baseTemp);

console.log('Converting 0°C to other units:');
console.log(`  Celsius:    ${baseTemp}°C`);
console.log(`  Fahrenheit: ${f}°F`);
console.log(`  Kelvin:     ${k}K\n`);

// ===== Part 4: Distance units with callable accessors =====
console.log('Part 4: Distance units\n');

const distanceRegistry = createRegistry().register('meters', 'kilometers', {
  to: (m) => m / 1000,
  from: (km) => km * 1000
});

// Create distance values using callable accessors
const distance = distanceRegistry.meters(5280);
const km = distanceRegistry.meters.to.kilometers(distance);

console.log('Distance conversion:');
console.log(`  ${distance} meters = ${km} kilometers\n`);

// ===== Part 5: Type safety demonstration =====
console.log('Part 5: Type safety (compile-time check)\n');

// The callable accessor returns a properly branded type
const typedTemp = registry.Celsius(15);
// This would be type-safe in TypeScript - the value is branded as Celsius
const converted = registry.Celsius.to.Fahrenheit(typedTemp);

console.log('Type-safe conversion:');
console.log(`  ${typedTemp}°C = ${converted}°F`);
console.log('  (TypeScript ensures Celsius is converted to Fahrenheit)\n');

// ===== Part 6: Combining with metadata =====
console.log('Part 6: Using metadata with callable accessors\n');

const displayTemp = registry.Celsius(23);
const format = (registry as any).Celsius.format;
const abbrev = (registry as any).Celsius.abbreviation;

console.log('Formatted display:');
console.log(`  Value: ${displayTemp}`);
console.log(`  Abbreviation: ${abbrev}`);
console.log(`  Formatted: ${format.replace('${value}', displayTemp.toString())}\n`);

console.log('=== Demo Complete ===');
