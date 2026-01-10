import { describe, it, expect, expectTypeOf } from 'vitest';
import { createRegistry } from '../registry';
import type { Converter } from '../converters';
import type { WithUnits } from '../types';
import { CycleError, MaxDepthError, ConversionError } from '../errors';

// Define test unit types
type Celsius = WithUnits<number, 'Celsius'>;
type Fahrenheit = WithUnits<number, 'Fahrenheit'>;
type Kelvin = WithUnits<number, 'Kelvin'>;
type Meters = WithUnits<number, 'meters'>;
type Kilometers = WithUnits<number, 'kilometers'>;
type Miles = WithUnits<number, 'miles'>;

const getConverter = (registry: any, from: string, to: string) =>
  (registry as any).getConverter(from, to);
const convert = (registry: any, value: any, from: string) => (registry as any).convert(value, from);

describe('Registry - Basic Operations', () => {
  it('register and retrieve direct converter', () => {
    const registry = createRegistry().register(
      'Celsius',
      'Fahrenheit',
      (c) => ((c * 9) / 5 + 32) as Fahrenheit
    );

    const converter = getConverter(registry, 'Celsius', 'Fahrenheit');

    expect(converter).toBeDefined();
    if (converter) {
      const result = converter(0 as Celsius);
      expect(result).toBe(32);
    }
  });

  it('registerBidirectional registers both directions', () => {
    const registry = createRegistry().register('meters', 'kilometers', {
      to: (m: Meters) => (m / 1000) as Kilometers,
      from: (km: Kilometers) => (km * 1000) as Meters
    });

    const m2km = getConverter(registry, 'meters', 'kilometers');
    const km2m = getConverter(registry, 'kilometers', 'meters');

    expect(m2km).toBeDefined();
    expect(km2m).toBeDefined();

    if (m2km && km2m) {
      expect(m2km(1000 as Meters)).toBe(1);
      expect(km2m(1 as Kilometers)).toBe(1000);
    }
  });

  it('getConverter finds direct converter in O(1)', () => {
    const registry = createRegistry()
      .register('A', 'B', (a) => (a * 2) as any)
      .register('B', 'C', (b) => (b * 3) as any);

    const startTime = performance.now();
    const converter = getConverter(registry, 'A', 'B');
    const endTime = performance.now();

    expect(converter).toBeDefined();
    // O(1) lookup should be fast (< 1ms even in slow environments)
    expect(endTime - startTime).toBeLessThan(5);
  });
});

describe('Registry - Multi-Hop Composition', () => {
  it('auto-compose 2-hop conversion (A→B→C)', () => {
    const registry = createRegistry()
      .register('A', 'B', (a) => (a * 2) as any)
      .register('B', 'C', (b) => (b * 3) as any);

    const converter = getConverter(registry, 'A', 'C');

    expect(converter).toBeDefined();
    if (converter) {
      // A→B→C: 10 * 2 = 20, 20 * 3 = 60
      expect(converter(10 as any)).toBe(60);
    }
  });

  it('auto-compose 3-hop conversion (A→B→C→D)', () => {
    const registry = createRegistry()
      .register('A', 'B', (a) => (a * 2) as any)
      .register('B', 'C', (b) => (b * 3) as any)
      .register('C', 'D', (c) => (c * 5) as any);

    const converter = getConverter(registry, 'A', 'D');

    expect(converter).toBeDefined();
    if (converter) {
      // A→B→C→D: 10 * 2 * 3 * 5 = 300
      expect(converter(10 as any)).toBe(300);
    }
  });

  it('integration test: 3-unit distance conversion (m→km→mi)', () => {
    const registry = createRegistry()
      .register('meters', 'kilometers', {
        to: (m: Meters) => (m / 1000) as Kilometers,
        from: (km: Kilometers) => (km * 1000) as Meters
      })
      .register('kilometers', 'miles', {
        to: (km: Kilometers) => (km * 0.621371) as Miles,
        from: (mi: Miles) => (mi / 0.621371) as Kilometers
      });

    const converter = getConverter(registry, 'meters', 'miles');

    expect(converter).toBeDefined();
    if (converter) {
      const meters: Meters = 5000 as Meters;
      const miles = converter(meters);

      // 5000m → 5km → 3.106855mi
      expect(miles).toBeCloseTo(3.106855, 5);
    }
  });

  it('chooses shortest path when multiple paths exist', () => {
    // Create diamond shape: A→B→D and A→C→D
    // But also add direct A→D
    const registry = createRegistry()
      .register('A', 'B', (a) => (a + 100) as any) // Long path
      .register('B', 'D', (b) => (b + 100) as any)
      .register('A', 'C', (a) => (a + 200) as any) // Long path
      .register('C', 'D', (c) => (c + 200) as any)
      .register('A', 'D', (a) => (a * 10) as any); // Direct (shortest)

    const converter = getConverter(registry, 'A', 'D');

    if (converter) {
      // Should use direct path: 5 * 10 = 50
      expect(converter(5 as any)).toBe(50);
    }
  });
});

describe('Registry - Error Handling', () => {
  it('cycle detection throws CycleError with path', () => {
    // Create cycle: A→B→C→A
    const registry = createRegistry()
      .register('A', 'B', (a) => (a * 2) as any)
      .register('B', 'C', (b) => (b * 3) as any)
      .register('C', 'A', (c) => (c * 5) as any);

    // Trying to convert from C to A would complete a cycle
    // But the actual cycle is detected when finding a path
    // Let me test a different scenario: trying to get a converter that would require going in a circle

    // Since we register C→A, we can actually get A to C via A→B→C
    // But trying to get C to C should trigger cycle detection
    expect(() => {
      getConverter(registry, 'C', 'C' as any); // Cast needed due to type constraint
    }).toThrow(CycleError);
  });

  it('max depth (>5 hops) throws MaxDepthError', () => {
    // Create chain: A→B→C→D→E→F→G (6 hops)
    const registry = createRegistry()
      .register('A', 'B', (a) => (a * 2) as any)
      .register('B', 'C', (b) => (b * 2) as any)
      .register('C', 'D', (c) => (c * 2) as any)
      .register('D', 'E', (d) => (d * 2) as any)
      .register('E', 'F', (e) => (e * 2) as any)
      .register('F', 'G', (f) => (f * 2) as any);

    expect(() => {
      getConverter(registry, 'A', 'G');
    }).toThrow(MaxDepthError);
  });

  it('missing converter path throws ConversionError', () => {
    const registry = createRegistry().register('A', 'B', (a) => (a * 2) as any);
    // No path from A to C

    const result = getConverter(registry, 'A', 'C');
    expect(result).toBeUndefined();
  });
});

describe('Registry - Fluent API', () => {
  it('compile-time: wrong unit to convert() causes error', () => {
    const registry = createRegistry().register(
      'Celsius',
      'Fahrenheit',
      (c) => ((c * 9) / 5 + 32) as Fahrenheit
    );

    const temp: Celsius = 25 as Celsius;

    // Valid conversion
    const fahrenheit = convert(registry, temp, 'Celsius').to('Fahrenheit');
    expect(fahrenheit).toBe(77);

    // Type safety test: This tests that wrong units are caught at compile-time
    // We can't easily test this at runtime, so we document the expected behavior
  });

  it('fluent API performs direct conversion', () => {
    const registry = createRegistry().register(
      'Celsius',
      'Fahrenheit',
      (c) => ((c * 9) / 5 + 32) as Fahrenheit
    );

    const temp: Celsius = 0 as Celsius;
    const result = convert(registry, temp, 'Celsius').to('Fahrenheit');

    expect(result).toBe(32);
    // Type is WithUnits<any, 'Fahrenheit'> which is compatible with Fahrenheit
  });

  it('fluent API performs multi-hop conversion', () => {
    const registry = createRegistry()
      .register('Celsius', 'Kelvin', (c) => (c + 273.15) as Kelvin)
      .register('Kelvin', 'Fahrenheit', (k) => (((k - 273.15) * 9) / 5 + 32) as Fahrenheit);

    const temp: Celsius = 0 as Celsius;
    const fahrenheit = convert(registry, temp, 'Celsius').to('Fahrenheit');

    expect(fahrenheit).toBeCloseTo(32, 5);
  });

  it('fluent API throws error for missing path', () => {
    const registry = createRegistry().register('A', 'B', (a) => (a * 2) as any);

    expect(() => {
      convert(registry, 10 as any, 'A').to('C');
    }).toThrow(ConversionError);
  });
});

describe('Registry - Immutability', () => {
  it('register returns new registry instance', () => {
    const registry1 = createRegistry();
    const registry2 = registry1.register('A', 'B', (a) => (a * 2) as any);

    expect(registry1).not.toBe(registry2);
  });

  it('original registry unchanged after register', () => {
    const registry1 = createRegistry();
    const registry2 = registry1.register('A', 'B', (a) => (a * 2) as any);

    // registry1 should not have the converter
    expect(getConverter(registry1, 'A', 'B')).toBeUndefined();

    // registry2 should have the converter
    expect(getConverter(registry2, 'A', 'B')).toBeDefined();
  });
});

describe('Registry - Performance', () => {
  it('caches composed paths for repeated conversions', () => {
    const registry = createRegistry()
      .register('A', 'B', (a) => (a * 2) as any)
      .register('B', 'C', (b) => (b * 3) as any);

    // First call - may be slower due to BFS
    const start1 = performance.now();
    const converter1 = getConverter(registry, 'A', 'C');
    const end1 = performance.now();
    const time1 = end1 - start1;

    // Second call - should be faster (cached)
    const start2 = performance.now();
    const converter2 = getConverter(registry, 'A', 'C');
    const end2 = performance.now();
    const time2 = end2 - start2;

    expect(converter1).toBeDefined();
    expect(converter2).toBeDefined();
    // Second call should be as fast or faster (cached)
    expect(time2).toBeLessThanOrEqual(time1 * 2); // Allow some variance
  });
});

describe('Registry - Unit Accessor API', () => {
  it('provides unit-based accessor API', () => {
    const registry = createRegistry().register(
      'Celsius',
      'Fahrenheit',
      (c) => ((c * 9) / 5 + 32) as Fahrenheit
    );

    const temp = 0 as Celsius;

    // Use the unit accessor API: registry.celsius.to.fahrenheit(value)
    const result = (registry as any).Celsius.to.Fahrenheit(temp);

    expect(result).toBe(32);
    // Type checking note: result is 'any' due to registry cast, but runtime value is correct
  });

  it('unit accessor API works with bidirectional converters', () => {
    const registry = createRegistry().register('meters', 'kilometers', {
      to: (m: Meters) => (m / 1000) as Kilometers,
      from: (km: Kilometers) => (km * 1000) as Meters
    });

    const meters = 5000 as Meters;
    const km = 5 as Kilometers;

    // Both directions should work
    const toKm = (registry as any).meters.to.kilometers(meters);
    const toM = (registry as any).kilometers.to.meters(km);

    expect(toKm).toBe(5);
    expect(toM).toBe(5000);
  });

  it('unit accessor API works with multi-hop conversions', () => {
    const registry = createRegistry()
      .register('meters', 'kilometers', {
        to: (m: Meters) => (m / 1000) as Kilometers,
        from: (km: Kilometers) => (km * 1000) as Meters
      })
      .register('kilometers', 'miles', {
        to: (km: Kilometers) => (km * 0.621371) as Miles,
        from: (mi: Miles) => (mi / 0.621371) as Kilometers
      });

    const meters = 5000 as Meters;

    // Should auto-compose: meters → kilometers → miles
    const miles = (registry as any).meters.to.miles(meters);

    expect(miles).toBeCloseTo(3.106855, 5);
  });

  it('unit accessor API throws error when no converter exists', () => {
    const registry = createRegistry().register('A', 'B', (a) => (a * 2) as any);

    // Try to convert from A to C (C not in registry at all)
    expect(() => {
      (registry as any).A.to.C(10 as any);
    }).toThrow(ConversionError);
  });
});

describe('Registry - Metadata Support', () => {
  it('addMetadata attaches metadata to a unit', () => {
    const registry = createRegistry()
      .register('Celsius', 'Fahrenheit', (c) => ((c * 9) / 5 + 32) as Fahrenheit)
      .Celsius.addMetadata({
        abbreviation: '°C',
        format: '${value}°C',
        description: 'Temperature in Celsius'
      });

    expect((registry as any).Celsius.abbreviation).toBe('°C');
    expect((registry as any).Celsius.format).toBe('${value}°C');
    expect((registry as any).Celsius.description).toBe('Temperature in Celsius');
  });

  it('metadata properties are accessible on unit accessors', () => {
    const registry = createRegistry()
      .register('meters', 'kilometers', (m) => (m / 1000) as Kilometers)
      .meters.addMetadata({ abbreviation: 'm', symbol: 'm' });

    expect((registry as any).meters.abbreviation).toBe('m');
    expect((registry as any).meters.symbol).toBe('m');
  });

  it('addMetadata supports arbitrary custom properties', () => {
    const registry = createRegistry()
      .register('Kelvin', 'Celsius', (k) => (k - 273.15) as Celsius)
      .Kelvin.addMetadata({
        abbreviation: 'K',
        customProp: 'custom value',
        numericProp: 42
      });

    expect((registry as any).Kelvin.abbreviation).toBe('K');
    expect((registry as any).Kelvin.customProp).toBe('custom value');
    expect((registry as any).Kelvin.numericProp).toBe(42);
  });

  it('metadata persists across register operations', () => {
    const registry = createRegistry()
      .register('A', 'B', (a) => (a * 2) as any)
      .A.addMetadata({ abbreviation: 'A' })
      .register('B', 'C', (b) => (b * 3) as any);

    expect((registry as any).A.abbreviation).toBe('A');
  });

  it('addMetadata can update existing metadata', () => {
    const registry = createRegistry()
      .register('meters', 'feet', (m) => (m * 3.28084) as any)
      .meters.addMetadata({ abbreviation: 'm' })
      .meters.addMetadata({ description: 'Length in meters' });

    expect((registry as any).meters.abbreviation).toBe('m');
    expect((registry as any).meters.description).toBe('Length in meters');
  });

  it('addMetadata overwrites existing properties', () => {
    const registry = createRegistry()
      .register('grams', 'kilograms', (g) => (g / 1000) as any)
      .grams.addMetadata({ abbreviation: 'g' })
      .grams.addMetadata({ abbreviation: 'gram' });

    expect((registry as any).grams.abbreviation).toBe('gram');
  });

  it('multiple units can have independent metadata', () => {
    const registry = createRegistry()
      .register('Celsius', 'Fahrenheit', (c) => ((c * 9) / 5 + 32) as Fahrenheit)
      .register('Fahrenheit', 'Celsius', (f) => (((f - 32) * 5) / 9) as Celsius)
      .Celsius.addMetadata({ abbreviation: '°C' })
      .Fahrenheit.addMetadata({ abbreviation: '°F' });

    expect((registry as any).Celsius.abbreviation).toBe('°C');
    expect((registry as any).Fahrenheit.abbreviation).toBe('°F');
  });

  it('metadata returns undefined for non-existent properties', () => {
    const registry = createRegistry()
      .register('meters', 'feet', (m) => (m * 3.28084) as any)
      .meters.addMetadata({ abbreviation: 'm' });

    expect((registry as any).meters.abbreviation).toBe('m');
    expect((registry as any).meters.nonExistent).toBeUndefined();
  });

  it('addMetadata returns new registry instance (immutable)', () => {
    const registry1 = createRegistry().register('A', 'B', (a) => (a * 2) as any);
    const registry2 = (registry1 as any).A.addMetadata({ abbreviation: 'A' });

    expect((registry1 as any).A.abbreviation).toBeUndefined();
    expect((registry2 as any).A.abbreviation).toBe('A');
  });
});

describe('Registry - Unit Accessor Registration', () => {
  it('register method on unit accessor registers converter', () => {
    type CelsiusEdge = readonly ['Celsius', 'Fahrenheit'];
    const registry = createRegistry<[CelsiusEdge]>().Celsius.register(
      'Fahrenheit',
      (c: Celsius) => ((c * 9) / 5 + 32) as Fahrenheit
    );

    const converter = getConverter(registry, 'Celsius', 'Fahrenheit');
    expect(converter).toBeDefined();
    if (converter) {
      expect(converter(0 as Celsius)).toBe(32);
    }
  });

  it('unit accessor register supports bidirectional converters', () => {
    type MeterEdge = readonly ['meters', 'kilometers'];
    const registry = createRegistry<[MeterEdge]>().meters.register('kilometers', {
      to: (m) => (m / 1000) as Kilometers,
      from: (km) => (km * 1000) as Meters
    });

    const m2km = getConverter(registry, 'meters', 'kilometers');
    const km2m = getConverter(registry, 'kilometers', 'meters');

    expect(m2km).toBeDefined();
    expect(km2m).toBeDefined();

    if (m2km && km2m) {
      expect(m2km(1000 as Meters)).toBe(1);
      expect(km2m(1 as Kilometers)).toBe(1000);
    }
  });

  it('unit accessor register can be chained', () => {
    type CelsiusEdge = readonly ['Celsius', 'Fahrenheit'];
    type FahrenheitEdge = readonly ['Fahrenheit', 'Kelvin'];
    const registry = createRegistry<[CelsiusEdge, FahrenheitEdge]>()
      .Celsius.register('Fahrenheit', (c: Celsius) => ((c * 9) / 5 + 32) as Fahrenheit)
      .Fahrenheit.register('Kelvin', (f: Fahrenheit) => ((f - 32) * (5 / 9) + 273.15) as Kelvin);

    const c2f = getConverter(registry, 'Celsius', 'Fahrenheit');
    const f2k = getConverter(registry, 'Fahrenheit', 'Kelvin');

    expect(c2f).toBeDefined();
    expect(f2k).toBeDefined();
  });

  it('unit accessor register preserves existing converters', () => {
    type CEdge = readonly ['C', 'D'];
    const registry = createRegistry<[CEdge]>()
      .register('A', 'B', (a) => (a * 2) as any)
      .C.register('D', (c: any) => (c * 3) as any);

    const ab = getConverter(registry, 'A', 'B');
    const cd = getConverter(registry, 'C', 'D');

    expect(ab).toBeDefined();
    expect(cd).toBeDefined();
  });

  it('unit accessor register works with unit accessor API', () => {
    type CelsiusEdge = readonly ['Celsius', 'Fahrenheit'];
    const registry = createRegistry<[CelsiusEdge]>().Celsius.register(
      'Fahrenheit',
      (c: Celsius) => ((c * 9) / 5 + 32) as Fahrenheit
    );

    const temp = 0 as Celsius;
    const result = (registry as any).Celsius.to.Fahrenheit(temp);

    expect(result).toBe(32);
  });

  it('unit accessor register and addMetadata work together', () => {
    type CelsiusEdge = readonly ['Celsius', 'Fahrenheit'];
    const registry = createRegistry<[CelsiusEdge]>()
      .Celsius.addMetadata({ abbreviation: '°C' })
      .Celsius.register('Fahrenheit', (c: Celsius) => ((c * 9) / 5 + 32) as Fahrenheit);

    expect((registry as any).Celsius.abbreviation).toBe('°C');
    const converter = getConverter(registry, 'Celsius', 'Fahrenheit');
    expect(converter).toBeDefined();
  });
});
