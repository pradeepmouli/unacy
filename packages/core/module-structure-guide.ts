/**
 * Example module structure for namespace exports
 *
 * This shows how you would organize your converter modules
 * for optimal tree-shaking and developer experience
 */

// ============================================================================
// File: src/converters/temperature.ts
// ============================================================================

/*
import { createRegistry, type WithUnits } from '@unacy/core';

/*
import { createRegistry, type WithUnits } from '@unacy/core';

type Celsius = WithUnits<number, 'Celsius'>;
type Fahrenheit = WithUnits<number, 'Fahrenheit'>;
type Kelvin = WithUnits<number, 'Kelvin'>;

const registry = createRegistry()
  .register('Celsius', 'Fahrenheit', {
    to: (c: Celsius) => ((c * 9 / 5) + 32) as Fahrenheit,
    from: (f: Fahrenheit) => ((f - 32) * 5 / 9) as Celsius
  })
  .register('Celsius', 'Kelvin', (c: Celsius) => (c + 273.15) as Kelvin)
  .register('Kelvin', 'Celsius', (k: Kelvin) => (k - 273.15) as Celsius)
  .allow('Kelvin', 'Fahrenheit')
  .allow('Fahrenheit', 'Kelvin');

// Export using destructuring - cleaner and more concise!
export const { Celsius, Fahrenheit, Kelvin } = registry;

// Full registry export (optional)
export const Temperature = registry;

// Re-export types for convenience
export type { Celsius as CelsiusValue, Fahrenheit as FahrenheitValue, Kelvin as KelvinValue };
*/

// ============================================================================
// File: src/converters/distance.ts
// ============================================================================

// Similar structure for distance units...

// ============================================================================
// File: src/converters/index.ts (Barrel export)
// ============================================================================

/*
export * from './temperature';
export * from './distance';
export * from './time';
export * from './weight';
// etc...
*/

// ============================================================================
// Usage in consumer code:
// ============================================================================

/*
// Option 1: Import specific converters (tree-shakeable)
import { Celsius, Fahrenheit } from '@mylib/converters/temperature';
const f = Celsius.to.Fahrenheit(25 as CelsiusValue);

// Option 2: Import full registry
import { Temperature } from '@mylib/converters/temperature';
const f = Temperature.Celsius.to.Fahrenheit(25 as CelsiusValue);

// Option 3: Import from barrel (convenience, but less tree-shakeable)
import { Celsius } from '@mylib/converters';
const f = Celsius.to.Fahrenheit(25 as CelsiusValue);

// Option 4: Namespace import
import * as Temp from '@mylib/converters/temperature';
const f = Temp.Celsius.to.Fahrenheit(25 as Temp.CelsiusValue);
*/

console.log(`
Module Organization Best Practices:

📁 Project Structure:
src/
├── converters/
│   ├── index.ts           # Barrel export (optional)
│   ├── temperature.ts     # Temperature conversions
│   ├── distance.ts        # Distance conversions
│   ├── time.ts           # Time conversions
│   └── weight.ts         # Weight conversions
└── types/                 # Shared type definitions

✨ Benefits:

1. Tree-Shaking Optimization
   - Bundlers can eliminate unused converters
   - Reduces bundle size for production apps

2. Clear Import Paths
   - import { Celsius } from '@mylib/temperature'
   - Self-documenting, easy to discover

3. Type Safety Throughout
   - Export types alongside converters
   - Full IntelliSense support

4. Maintainability
   - Each dimension in its own file
   - Easy to test and update independently

5. Flexible Usage Patterns
   - Named imports for specific needs
   - Namespace imports for bulk usage
   - Full registry for dynamic scenarios

📝 Example Package.json Exports:
{
  "exports": {
    ".": "./dist/index.js",
    "./temperature": "./dist/converters/temperature.js",
    "./distance": "./dist/converters/distance.js",
    "./time": "./dist/converters/time.js",
    "./weight": "./dist/converters/weight.js"
  }
}

This enables:
- import { Celsius } from '@mylib/temperature'
- import { Meters } from '@mylib/distance'
- import * as Converters from '@mylib' // All converters
`);
