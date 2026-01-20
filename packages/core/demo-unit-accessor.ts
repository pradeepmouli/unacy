/**
 * Demo of the unit accessor API
 * This file demonstrates:
 * 1. registry.unit(value) API for creating branded values
 * 2. registry.unit.to.targetUnit(value) API for conversions
 * 3. registry.unit.addMetadata() for attaching metadata to units
 * 4. registry.unit.register() for unit-centric converter registration
 */

import { createRegistry } from './src/index.js';
import type { WithTypedUnits } from './src/types.js';

console.log('=== Unit Accessor API Demo ===\n');

// Define metadata for temperature units (minimal: name + type)
const CelsiusMetadata = {
  name: 'Celsius' as const,
  type: 'number' as const
};

const FahrenheitMetadata = {
  name: 'Fahrenheit' as const,
  type: 'number' as const
};

const KelvinMetadata = {
  name: 'Kelvin' as const,
  type: 'number' as const
};

// Define metadata for distance units
const MetersMetadata = {
  name: 'meters' as const,
  type: 'number' as const
};

const KilometersMetadata = {
  name: 'kilometers' as const,
  type: 'number' as const
};

// Define unit types with metadata
type Celsius = WithTypedUnits<typeof CelsiusMetadata>;
type Fahrenheit = WithTypedUnits<typeof FahrenheitMetadata>;
type Kelvin = WithTypedUnits<typeof KelvinMetadata>;
type Meters = WithTypedUnits<typeof MetersMetadata>;
type _Kilometers = WithTypedUnits<typeof KilometersMetadata>;

// ===== Part 1: Basic Unit Accessor API =====
console.log('Part 1: Basic Unit Accessor API\n');

// Create registry with converters using traditional API
const tempRegistry = createRegistry()
  .register(CelsiusMetadata, FahrenheitMetadata, (c: Celsius) => ((c * 9) / 5 + 32) as Fahrenheit)
  .register(FahrenheitMetadata, CelsiusMetadata, (f: Fahrenheit) => (((f - 32) * 5) / 9) as Celsius)
  .register(CelsiusMetadata, KelvinMetadata, (c: Celsius) => (c + 273.15) as Kelvin)
  .register(KelvinMetadata, CelsiusMetadata, (k: Kelvin) => (k - 273.15) as Celsius)
  .allow(KelvinMetadata, FahrenheitMetadata); // Explicitly enable multi-hop path in types
// Create branded values using callable accessors (NEW!)
console.log('Creating branded values:');
const temp = tempRegistry.Celsius(25); // NEW: Callable accessor!
console.log(`  tempRegistry.Celsius(25) = ${temp}\n`);

// Compare with old way (still supported)
const _tempOld = 25 as Celsius;
console.log('Old way (still works): const temp = 25 as Celsius;\n');

// Method 1: convert() method API
console.log('Method 1 (convert method):');
const f1 = tempRegistry.convert(temp, 'Celsius').to('Fahrenheit');
console.log(`  ${temp} Celsius = ${f1} Fahrenheit`);

// Method 2: Unit accessor API
console.log('\nMethod 2 (unit accessor):');
const f2 = tempRegistry.Celsius.to.Fahrenheit(temp);
console.log(`  ${temp} Celsius = ${f2} Fahrenheit`);

// Method 3: Fluent callable accessor (NEW!)
console.log('\nMethod 3 (fluent callable accessor - NEW!):');
const f3 = tempRegistry.Celsius.to.Fahrenheit(tempRegistry.Celsius(30));
console.log(`  tempRegistry.Celsius.to.Fahrenheit(tempRegistry.Celsius(30)) = ${f3} Fahrenheit`);

// Test multi-hop with unit accessor
console.log('\nMulti-hop conversion (Celsius -> Kelvin -> Celsius):');
const kelvinValue = tempRegistry.Celsius.to.Kelvin(tempRegistry.Celsius(100));
const backToCelsius = tempRegistry.Kelvin.to.Celsius(kelvinValue);
console.log(`  100 Celsius = ${kelvinValue} Kelvin = ${backToCelsius} Celsius`);

// Test multi-hop conversion (Kelvin -> Fahrenheit via Celsius)
console.log('\nMulti-hop conversion (Kelvin -> Fahrenheit via Celsius):');
const kelvin = 300 as Kelvin;
const fahrenheitFromKelvin = tempRegistry.Kelvin.to.Fahrenheit(kelvin);
console.log(`  ${kelvin} Kelvin = ${fahrenheitFromKelvin} Fahrenheit`);

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

// Register converters using bidirectional API
const metersKmConverter = {
  to: (m: number) => m / 1000,
  from: (km: number) => km * 1000
};
const distanceRegistry = createRegistry()
  .register(MetersMetadata, KilometersMetadata, metersKmConverter)
  // Add metadata using method chaining
  .meters.addMetadata({ abbreviation: 'm', description: 'Length in meters' })
  .kilometers.addMetadata({ abbreviation: 'km', description: 'Length in kilometers' });

// Test the conversions
const distance = 5000 as Meters;
const distanceKm = distanceRegistry.meters.to.kilometers(distance);
console.log(
  `Distance conversion: ${distance}${(distanceRegistry as any).meters.abbreviation} = ${distanceKm}${(distanceRegistry as any).kilometers.abbreviation}`
);

// Demonstrate using register() and then working with the result
const completeRegistry = distanceRegistry
  .register(CelsiusMetadata, FahrenheitMetadata, (c: Celsius) => ((c * 9) / 5 + 32) as Fahrenheit)
  .register(
    FahrenheitMetadata,
    CelsiusMetadata,
    (f: Fahrenheit) => (((f - 32) * 5) / 9) as Celsius
  );

// Use both distance and temperature conversions (with any for demonstration)
console.log('\nCombined registry:');
console.log(
  `  Temperature: ${temp} Celsius = ${completeRegistry.Celsius.to.Fahrenheit(temp)} Fahrenheit`
);
console.log(`  Distance: ${distance}m = ${completeRegistry.meters.to.kilometers(distance)}km`);

// ===== Part 4: Custom Metadata Properties =====
console.log('\n\nPart 4: Custom Metadata Properties\n');

// Add custom metadata properties
const customRegistry = createRegistry()
  .register(CelsiusMetadata, FahrenheitMetadata, (c: number) => (c * 9) / 5 + 32)
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
