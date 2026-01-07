# Quickstart: Unacy Core Conversion Library

**Feature**: 001-unacy-core
**Phase**: 1 - Quickstart Guide
**Date**: 2026-01-06

## Overview

This guide demonstrates the core usage patterns for the Unacy Core library: defining unit-tagged types, creating converters, using the registry with auto-composition, and formatting/parsing tagged values.

---

## Installation

```bash
# Install from local monorepo package
pnpm add unacy

# Or in a workspace
pnpm --filter my-package add unacy@workspace:*
```

---

## Basic Usage: Unit Conversions

### 1. Define Unit Types

```typescript
import type { WithUnits } from 'unacy';

// Temperature units
type Celsius = WithUnits<number, 'Celsius'>;
type Fahrenheit = WithUnits<number, 'Fahrenheit'>;
type Kelvin = WithUnits<number, 'Kelvin'>;

// Distance units
type Meters = WithUnits<number, 'meters'>;
type Kilometers = WithUnits<number, 'kilometers'>;
type Miles = WithUnits<number, 'miles'>;
```

### 2. Create a Registry

```typescript
import { createRegistry } from 'unacy';

const tempRegistry = createRegistry<'Celsius' | 'Fahrenheit' | 'Kelvin'>();
```

### 3. Register Converters

```typescript
// Bidirectional converter (registers both directions)
const tempWithConverters = tempRegistry.registerBidirectional('Celsius', 'Fahrenheit', {
  to: (c) => ((c * 9/5) + 32) as Fahrenheit,
  from: (f) => ((f - 32) * 5/9) as Celsius
});

// Unidirectional converter
const fullTempRegistry = tempWithConverters
  .register('Celsius', 'Kelvin', (c) => (c + 273.15) as Kelvin)
  .register('Kelvin', 'Celsius', (k) => (k - 273.15) as Celsius);
```

### 4. Perform Conversions

```typescript
// Direct conversion
const temp = 25 as Celsius;
const fahrenheit = fullTempRegistry.convert(temp).to('Fahrenheit');
console.log(fahrenheit); // 77

// Multi-hop conversion (auto-composed: Celsius → Kelvin → Celsius → Fahrenheit)
const tempInKelvin = 300 as Kelvin;
const fahrenheitFromKelvin = fullTempRegistry.convert(tempInKelvin).to('Fahrenheit');
console.log(fahrenheitFromKelvin); // 80.33
```

---

## Advanced: Multi-Hop Composition

The registry automatically composes converters via shortest path (BFS):

```typescript
const distanceRegistry = createRegistry<'meters' | 'kilometers' | 'miles'>()
  .registerBidirectional('meters', 'kilometers', {
    to: (m) => (m / 1000) as Kilometers,
    from: (km) => (km * 1000) as Meters
  })
  .registerBidirectional('kilometers', 'miles', {
    to: (km) => (km * 0.621371) as Miles,
    from: (mi) => (mi / 0.621371) as Kilometers
  });

// No direct meters → miles converter registered!
// Registry auto-composes: meters → kilometers → miles
const meters = 5000 as Meters;
const miles = distanceRegistry.convert(meters).to('miles');
console.log(miles); // 3.106855 (via 5000m → 5km → 3.106855mi)
```

---

## Format-Tagged Values

### 1. Define Format Types

```typescript
import type { WithFormat } from 'unacy';

type ISO8601Date = WithFormat<Date, 'ISO8601'>;
type UnixTimestamp = WithFormat<number, 'UnixTimestamp'>;
type HexColor = WithFormat<string, 'HexColor'>;
```

### 2. Create Formatter/Parser Pairs

```typescript
import type { FormatterParser } from 'unacy';
import { z } from 'zod';
import { ParseError } from 'unacy';

const iso8601: FormatterParser<ISO8601Date> = {
  format: (date) => date.toISOString(),

  parse: (input) => {
    const schema = z.string().datetime();
    try {
      const validated = schema.parse(input);
      return new Date(validated) as ISO8601Date;
    } catch (err) {
      throw new ParseError('ISO8601', input, (err as Error).message);
    }
  }
};

const hexColor: FormatterParser<HexColor> = {
  format: (color) => color,

  parse: (input) => {
    const schema = z.string().regex(/^#[0-9A-Fa-f]{6}$/);
    try {
      return schema.parse(input) as HexColor;
    } catch {
      throw new ParseError('HexColor', input, 'Expected #RRGGBB format');
    }
  }
};
```

### 3. Use Round-Trip Transformations

```typescript
const now = new Date() as ISO8601Date;
const str = iso8601.format(now);
console.log(str); // "2026-01-06T12:34:56.789Z"

const parsed = iso8601.parse(str);
console.log(parsed.getTime() === now.getTime()); // true

// Invalid input throws ParseError
try {
  hexColor.parse('not-a-color');
} catch (err) {
  console.error(err); // ParseError: Cannot parse "not-a-color" as HexColor
}
```

---

## Type Safety Examples

### Compile-Time Error Prevention

```typescript
// ✅ Valid: Celsius → Fahrenheit (using unit accessor API)
const temp1 = 25 as Celsius;
const f1 = fullTempRegistry.Celsius.to.Fahrenheit(temp1);

// ✅ Valid: Celsius → Fahrenheit (using convert method)
const f2 = fullTempRegistry.convert(temp1, 'Celsius').to('Fahrenheit');

// ❌ Compile error: Cannot convert to same unit
const temp2 = 25 as Celsius;
// const c2 = fullTempRegistry.convert(temp2, 'Celsius').to('Celsius'); // Error!

// ❌ Compile error: Unit not in registry
// const invalid = fullTempRegistry.convert(temp1).to('Rankine'); // Error!

// ❌ Compile error: Wrong tagged type
const meters = 100 as Meters;
// const f2 = fullTempRegistry.convert(meters).to('Fahrenheit'); // Error!
```

### Runtime Error Handling

```typescript
import { ConversionError, CycleError, MaxDepthError } from 'unacy';

// Missing converter path
const emptyRegistry = createRegistry<'A' | 'B' | 'C'>();
try {
  const a = 10 as WithUnits<number, 'A'>;
  emptyRegistry.convert(a).to('B');
} catch (err) {
  console.error(err); // ConversionError: Cannot convert from A to B
}

// Cycle detection (would need contrived registry setup)
// Registry detects A → B → C → A cycle and throws CycleError

// Max depth exceeded (>5 hops)
// Registry throws MaxDepthError if path requires >5 converters
```

---

## Best Practices

### 1. Define Unit Types at Module Boundary

```typescript
// units.ts
export type Celsius = WithUnits<number, 'Celsius'>;
export type Fahrenheit = WithUnits<number, 'Fahrenheit'>;

// api.ts
import type { Celsius, Fahrenheit } from './units';

export function getTemperature(): Celsius {
  return 25 as Celsius;
}
```

### 2. Use Bidirectional Converters When Possible

```typescript
// Reduces registry size and ensures round-trip consistency
registry.registerBidirectional('A', 'B', { to, from });

// Instead of:
registry.register('A', 'B', to);
registry.register('B', 'A', from);
```

### 3. Validate Parsers with Zod

```typescript
import { z } from 'zod';

const schema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

const parser: Parser<WithFormat<string, 'YYYY-MM-DD'>> = (input) => {
  try {
    return schema.parse(input) as WithFormat<string, 'YYYY-MM-DD'>;
  } catch (err) {
    throw new ParseError('YYYY-MM-DD', input, 'Invalid date format');
  }
};
```

### 4. Document Precision Loss

```typescript
// ⚠️ Document when conversions lose precision
const ftToMeters: Converter<Feet, Meters> = (ft) => {
  // NOTE: Conversion uses approximate factor; precision ±0.001m
  return (ft * 0.3048) as Meters;
};
```

### 5. Cache Registries for Performance

```typescript
// Create registry once, reuse across application
export const DISTANCE_REGISTRY = createRegistry<'m' | 'km' | 'mi'>()
  .registerBidirectional(/* ... */);

// In consuming code
import { DISTANCE_REGISTRY } from './registries';
const miles = DISTANCE_REGISTRY.convert(meters).to('mi');
```

---

## Testing Patterns

### Unit Tests with Vitest

```typescript
import { describe, it, expect, expectTypeOf } from 'vitest';
import type { WithUnits } from 'unacy';

describe('Temperature Conversions', () => {
  it('converts Celsius to Fahrenheit', () => {
    const celsius = 0 as Celsius;
    const fahrenheit = tempRegistry.convert(celsius).to('Fahrenheit');

    expect(fahrenheit).toBe(32);
    expectTypeOf(fahrenheit).toEqualTypeOf<Fahrenheit>();
  });

  it('round-trips preserve value', () => {
    const original = 25 as Celsius;
    const converted = tempRegistry.convert(original).to('Fahrenheit');
    const back = tempRegistry.convert(converted).to('Celsius');

    expect(back).toBeCloseTo(original, 5); // Precision tolerance
  });

  it('rejects same-unit conversion at compile time', () => {
    const temp = 25 as Celsius;
    // @ts-expect-error - Cannot convert to same unit
    tempRegistry.convert(temp).to('Celsius');
  });
});
```

---

## Migration from Existing Code

### Before: Untyped Conversions

```typescript
function celsiusToFahrenheit(c: number): number {
  return (c * 9/5) + 32;
}

const temp = 25;
const f = celsiusToFahrenheit(temp); // No compile-time safety
celsiusToFahrenheit(f); // Oops! Passed Fahrenheit to Celsius converter
```

### After: Typed with Unacy

```typescript
import type { WithUnits } from 'unacy';

type Celsius = WithUnits<number, 'Celsius'>;
type Fahrenheit = WithUnits<number, 'Fahrenheit'>;

const temp = 25 as Celsius;
const f = tempRegistry.convert(temp).to('Fahrenheit');

// Compile error: temp is Celsius, not Fahrenheit
// tempRegistry.convert(f).to('Fahrenheit'); // ❌ Won't compile
```

---

## Next Steps

1. **Implement converters**: Define converters for your domain units
2. **Write tests**: Use Vitest with `expectTypeOf` for type assertions
3. **Document precision**: Note any approximations or precision loss
4. **Optimize**: Cache registries; profile with large graphs (100+ units)
5. **Extend**: Add custom error handling or logging for conversions

---

**Quickstart Complete**: Ready to use Unacy Core for type-safe unit/format conversions!
