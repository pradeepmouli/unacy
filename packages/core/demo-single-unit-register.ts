/**
 * Demonstrates the single-unit register method
 * This allows registering unit metadata before defining converters
 */

import { createRegistry, type WithTypedUnits } from './src/index.js';

// Define unit metadata
const Celsius = {
  name: 'Celsius' as const,
  type: 'number' as const
};

const Fahrenheit = {
  name: 'Fahrenheit' as const,
  type: 'number' as const
};

const Kelvin = {
  name: 'Kelvin' as const,
  type: 'number' as const
};

// Type aliases for clarity
type Celsius = WithTypedUnits<typeof Celsius>;
type Fahrenheit = WithTypedUnits<typeof Fahrenheit>;
type Kelvin = WithTypedUnits<typeof Kelvin>;

// Example 1: Register units first, then add converters later
console.log('=== Example 1: Pre-register units ===\n');

// Step 1: Register unit metadata without converters
const step1 = createRegistry().register(Celsius).register(Fahrenheit).register(Kelvin);

console.log('Units registered:');
console.log('- Celsius can be created:', step1.Celsius(25));
console.log('- Fahrenheit can be created:', step1.Fahrenheit(77));
console.log('- Kelvin can be created:', step1.Kelvin(298.15));

// Step 2: Now add converters between the registered units
const step2 = step1
  .register(Celsius, Fahrenheit, (c) => (c * 9) / 5 + 32)
  .register(Fahrenheit, Celsius, (f) => ((f - 32) * 5) / 9);

console.log('\nAfter adding Celsius<->Fahrenheit converters:');
const tempC = step2.Celsius(25);
console.log('25°C =', step2.Celsius.to.Fahrenheit(tempC), '°F');

// Step 3: Add more converters
const step3 = step2
  .register(Celsius, Kelvin, (c) => c + 273.15)
  .register(Kelvin, Celsius, (k) => k - 273.15)
  .allow(Fahrenheit, Kelvin)
  .allow(Kelvin, Fahrenheit);

console.log('\nAfter adding Celsius<->Kelvin converters:');
console.log('25°C =', step3.Celsius.to.Kelvin(tempC), 'K');
console.log('25°C =', step3.Celsius.to.Fahrenheit(tempC), '°F');

// Example 2: Traditional approach for comparison
console.log('\n=== Example 2: Traditional approach (register with converters) ===\n');

const traditional = createRegistry()
  .register(Celsius, Fahrenheit, (c: Celsius) => ((c * 9) / 5 + 32) as Fahrenheit)
  .register(Fahrenheit, Celsius, (f: Fahrenheit) => (((f - 32) * 5) / 9) as Celsius)
  .register(Celsius, Kelvin, (c: Celsius) => (c + 273.15) as Kelvin)
  .register(Kelvin, Celsius, (k: Kelvin) => (k - 273.15) as Celsius)
  .allow(Fahrenheit, Kelvin)
  .allow(Kelvin, Fahrenheit);

console.log('With traditional approach:');
const temp2 = traditional.Celsius(25);
console.log('25°C =', traditional.Celsius.to.Fahrenheit(temp2), '°F');
console.log('25°C =', traditional.Celsius.to.Kelvin(temp2), 'K');

/**
 * Key benefits of the single-unit register method:
 *
 * 1. **Pre-declare units**: Register unit metadata before defining converters
 * 2. **Separation of concerns**: Define units separately from conversion logic
 * 3. **Flexible workflow**: Add converters incrementally as needed
 * 4. **Type safety**: Full type checking for registered units
 * 5. **Metadata access**: Units are available immediately after registration
 *
 * Use cases:
 * - Modular applications where units are defined in one place and converters in another
 * - Incremental development where converters are added as features are built
 * - Plugin systems where third-party code can add converters to pre-defined units
 */
