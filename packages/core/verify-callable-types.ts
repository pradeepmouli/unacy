/**
 * Type-level verification of callable unit accessors
 * This file demonstrates compile-time type safety
 */

import {
  Celsius as CelsiusMetadata,
  Fahrenheit as FahrenheitMetadata,
  Kelvin as KelvinMetadata
} from './namespace-export-demo.js';
import { createRegistry, type WithUnits, type WithTypedUnits } from './src/index.js';

// Define unit types
type Celsius = WithTypedUnits<typeof CelsiusMetadata>;
type Fahrenheit = WithTypedUnits<typeof FahrenheitMetadata>;
type Kelvin = WithTypedUnits<typeof KelvinMetadata>;

// Create registry
const registry = createRegistry()
  .register(CelsiusMetadata, FahrenheitMetadata, (c) => ((c * 9) / 5 + 32) as Fahrenheit)
  .register('Fahrenheit', 'Celsius', (f: Fahrenheit) => (((f - 32) * 5) / 9) as Celsius)
  .register('Celsius', 'Kelvin', (c: Celsius) => (c + 273.15) as Kelvin)
  .register('Kelvin', 'Celsius', (k: Kelvin) => (k - 273.15) as Celsius)
  .allow('Fahrenheit', 'Kelvin')
  .allow('Kelvin', 'Fahrenheit');

// Type verification tests
function verifyTypes() {
  // Test 1: Callable accessor returns correct type
  const temp1 = registry.Celsius(25);
  const _checkIsCelsius: Celsius = temp1; // ✓ Should compile

  // Test 2: Can be used with conversions
  const fahrenheit = registry.Celsius.to.Fahrenheit(temp1);
  const _checkIsFahrenheit: Fahrenheit = fahrenheit; // ✓ Should compile

  // Test 3: Fluent chain works
  const temp2 = registry.Fahrenheit.to.Celsius(registry.Fahrenheit(77));
  const _checkIsCelsius2: Celsius = temp2; // ✓ Should compile

  // Test 4: Works with metadata
  const registryWithMeta = registry.Celsius.addMetadata({
    abbreviation: '°C',
    format: '${value}°C'
  });
  const temp3 = registryWithMeta.Celsius(30);
  const _checkIsCelsius3: Celsius = temp3; // ✓ Should compile

  // Test 5: Multiple unit types work independently
  const c = registry.Celsius(0);
  const f = registry.Fahrenheit(32);
  const k = registry.Kelvin(273.15);

  const _c: Celsius = c; // ✓
  const _f: Fahrenheit = f; // ✓
  const _k: Kelvin = k; // ✓

  // Test 6: Cross conversions maintain types
  const c2f = registry.Celsius.to.Fahrenheit(c);
  const f2c = registry.Fahrenheit.to.Celsius(f);
  const k2c = registry.Kelvin.to.Celsius(k);

  const _c2f: Fahrenheit = c2f; // ✓
  const _f2c: Celsius = f2c; // ✓
  const _k2c: Celsius = k2c; // ✓

  console.log('✓ All type checks passed!');
}

// Runtime verification
function verifyRuntime() {
  console.log('=== Runtime Type Verification ===\n');

  // Test callable returns correct value
  const temp = registry.Celsius(25);
  console.log(`registry.Celsius(25) = ${temp}`);
  console.assert(temp === 25, 'Value should be 25');

  // Test conversions work
  const fahrenheit = registry.Celsius.to.Fahrenheit(temp);
  console.log(`registry.Celsius.to.Fahrenheit(${temp}) = ${fahrenheit}`);
  console.assert(fahrenheit === 77, 'Should be 77°F');

  // Test fluent chain
  const fluent = registry.Celsius.to.Fahrenheit(registry.Celsius(0));
  console.log(`registry.Celsius.to.Fahrenheit(registry.Celsius(0)) = ${fluent}`);
  console.assert(fluent === 32, 'Should be 32°F');

  // Test multiple units
  const c = registry.Celsius(100);
  const f = registry.Fahrenheit(212);
  const k = registry.Kelvin(373.15);

  console.log(`\nMultiple units:`);
  console.log(`  Celsius:    ${c}°C`);
  console.log(`  Fahrenheit: ${f}°F`);
  console.log(`  Kelvin:     ${k}K`);

  console.log('\n✓ All runtime checks passed!');
}

// Run verifications
verifyTypes();
verifyRuntime();
