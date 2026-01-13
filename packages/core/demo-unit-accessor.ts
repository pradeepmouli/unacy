/**
 * Demo of the unit accessor API
 * This file demonstrates:
 * 1. registry.unit(value) API for creating branded values
 * 2. registry.unit.to.targetUnit(value) API for conversions
 * 3. registry.unit.addMetadata() for attaching metadata to units
 * 4. registry.unit.register() for unit-centric converter registration
 */

import { createRegistry, type WithUnits } from './src/index';
import { Celsius } from './namespace-export-demo.js';

console.log('=== Unit Accessor API Demo ===\n');

// Define unit types
type Fahrenheit = WithUnits<number, 'Fahrenheit'>;
type Kelvin = WithUnits<number, 'Kelvin'>;
type Meters = WithUnits<number, 'meters'>;
type Kilometers = WithUnits<number, 'kilometers'>;

// ===== Part 1: Basic Unit Accessor API =====
console.log('Part 1: Basic Unit Accessor API\n');

// Create registry with converters using traditional API
const tempRegistry = createRegistry()
  .register('Celsius', 'Kelvin', (c) => c + 273.15)
  .register('Kelvin', 'Celsius', (k) => k - 273.15)
  .register('Celsius', 'Fahrenheit', (c) => (c * 9) / 5 + 32)
  .register('Fahrenheit', 'Celsius', (f) => ((f - 32) * 5) / 9)
  .allow('Kelvin', 'Fahrenheit'); // Explicitly enable multi-hop path in types

// Create branded values using callable accessors (NEW!)
console.log('Creating branded values:');
const temp = tempRegistry.Celsius(25); // NEW: Callable accessor!
console.log(`  tempRegistry.Celsius(25) = ${temp}°C\n`);

// Compare with old way (still supported)
const tempOld = 25 as Celsius;
console.log('Old way (still works): const temp = 25 as Celsius;\n');

// Method 1: convert() method API
console.log('Method 1 (convert method):');
const f1 = tempRegistry.convert(temp, 'Celsius').to('Fahrenheit');
console.log(`  ${temp}°C = ${f1}°F`);

// Method 2: Unit accessor API
console.log('\nMethod 2 (unit accessor):');
const f2 = tempRegistry.Celsius.to.Fahrenheit(temp);
console.log(`  ${temp}°C = ${f2}°F`);

// Method 3: Fluent callable accessor (NEW!)
console.log('\nMethod 3 (fluent callable accessor - NEW!):');
const f3 = tempRegistry.Celsius.to.Fahrenheit(tempRegistry.Celsius(30));
console.log(`  tempRegistry.Celsius.to.Fahrenheit(tempRegistry.Celsius(30)) = ${f3}°F`);

// Test multi-hop with unit accessor
console.log('\nMulti-hop conversion (Celsius -> Kelvin -> Celsius):');
const kelvinValue = tempRegistry.Celsius.to.Kelvin(temp);
const backToCelsius = tempRegistry.Kelvin.to.Celsius(kelvinValue);
console.log(`  ${temp}°C = ${kelvinValue}K = ${backToCelsius}°C`);

// Test composed conversion (Kelvin -> Celsius -> Fahrenheit)
console.log('\nComposed conversion (Kelvin -> Fahrenheit via Celsius):');
const kelvin = 300 as Kelvin;
const fahrenheitFromKelvin = tempRegistry.Kelvin.to.Fahrenheit(kelvin);
console.log(`  ${kelvin}K = ${fahrenheitFromKelvin}°F`);

// ===== Part 2: Metadata Support =====
console.log('\n\nPart 2: Metadata Support\n');

// Add metadata to units
const registryWithMetadata = tempRegistry.Celsius.addMetadata({
  abbreviation: '°C',
  format: '${value}°C',
  description: 'Temperature in Celsius scale',
  symbol: '°C'
})
  .Fahrenheit.addMetadata({
    abbreviation: '°F',
    format: '${value}°F',
    description: 'Temperature in Fahrenheit scale'
  })
  .Kelvin.addMetadata({
    abbreviation: 'K',
    format: '${value}K',
    description: 'Temperature in Kelvin scale (absolute temperature)'
  });

// Access metadata properties
console.log('Unit metadata:');
console.log(
  `  Celsius: ${(registryWithMetadata as any).Celsius.abbreviation} - ${(registryWithMetadata as any).Celsius.description}`
);
console.log(
  `  Fahrenheit: ${(registryWithMetadata as any).Fahrenheit.abbreviation} - ${(registryWithMetadata as any).Fahrenheit.description}`
);
console.log(
  `  Kelvin: ${(registryWithMetadata as any).Kelvin.abbreviation} - ${(registryWithMetadata as any).Kelvin.description}`
);

// Use format strings from metadata
const tempValue = 20 as Celsius;
const formatString = (registryWithMetadata as any).Celsius.format;
console.log(`\nFormatted value: ${formatString.replace('${value}', tempValue.toString())}`);

// ===== Part 3: Unit-Centric Registration =====
console.log('\n\nPart 3: Unit-Centric Registration\n');

// Register converters using the unit accessor API with pre-declared edges
type MeterEdge = readonly ['meters', 'kilometers'];
type KilometerEdge = readonly ['kilometers', 'meters'];
const distanceRegistry = createRegistry<[MeterEdge, KilometerEdge]>()
  // Register bidirectional converter from meters
  .meters.register('kilometers', {
    to: (m) => m / 1000,
    from: (km) => km * 1000
  })
  // Add metadata using method chaining
  .meters.addMetadata({ abbreviation: 'm', description: 'Length in meters' })
  .kilometers.addMetadata({ abbreviation: 'km', description: 'Length in kilometers' });

// Test the conversions
const distance = 5000 as Meters;
const distanceKm = (distanceRegistry as any).meters.to.kilometers(distance);
console.log(
  `Distance conversion: ${distance}${(distanceRegistry as any).meters.abbreviation} = ${distanceKm}${(distanceRegistry as any).kilometers.abbreviation}`
);

// Demonstrate using register() and then working with the result
const completeRegistry = distanceRegistry
  .register('Celsius', 'Fahrenheit', (c) => ((c * 9) / 5 + 32) as Fahrenheit)
  .register('Fahrenheit', 'Celsius', (f) => (((f - 32) * 5) / 9) as Celsius);

// Use both distance and temperature conversions (with any for demonstration)
console.log('\nCombined registry:');
console.log(
  `  Temperature: ${temp}°C = ${(completeRegistry as any).Celsius.to.Fahrenheit(temp)}°F`
);
console.log(
  `  Distance: ${distance}m = ${(completeRegistry as any).meters.to.kilometers(distance)}km`
);

// ===== Part 4: Custom Metadata Properties =====
console.log('\n\nPart 4: Custom Metadata Properties\n');

// Add custom metadata properties
type CelsiusEdge = readonly ['Celsius', 'Fahrenheit'];
const customRegistry = createRegistry<[CelsiusEdge]>()
  .Celsius.register('Fahrenheit', (c) => ((c * 9) / 5 + 32) as Fahrenheit)
  .Celsius.addMetadata({
    abbreviation: '°C',
    description: 'Temperature in Celsius',
    freezingPoint: 0,
    boilingPoint: 100,
    inventor: 'Anders Celsius',
    yearIntroduced: 1742
  });

console.log('Custom metadata:');
console.log(`  Unit: ${(customRegistry as any).Celsius.abbreviation}`);
console.log(`  Freezing point: ${(customRegistry as any).Celsius.freezingPoint}°C`);
console.log(`  Boiling point: ${(customRegistry as any).Celsius.boilingPoint}°C`);
console.log(`  Inventor: ${(customRegistry as any).Celsius.inventor}`);
console.log(`  Year introduced: ${(customRegistry as any).Celsius.yearIntroduced}`);

console.log('\n=== Demo Complete ===');
