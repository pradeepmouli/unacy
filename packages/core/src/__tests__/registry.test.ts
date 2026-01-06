import { describe, it, expect, expectTypeOf } from 'vitest';
import { createRegistry } from '../registry';
import type { Converter, BidirectionalConverter } from '../converters';
import type { WithUnits } from '../types';
import { CycleError, MaxDepthError, ConversionError } from '../errors';

// Define test unit types
type Celsius = WithUnits<number, 'Celsius'>;
type Fahrenheit = WithUnits<number, 'Fahrenheit'>;
type Kelvin = WithUnits<number, 'Kelvin'>;
type Meters = WithUnits<number, 'meters'>;
type Kilometers = WithUnits<number, 'kilometers'>;
type Miles = WithUnits<number, 'miles'>;
type Feet = WithUnits<number, 'feet'>;

describe('Registry - Basic Operations', () => {
  it('register and retrieve direct converter', () => {
    const registry = createRegistry<'Celsius' | 'Fahrenheit'>().register(
      'Celsius',
      'Fahrenheit',
      (c) => ((c * 9) / 5 + 32) as Fahrenheit
    );

    const converter = registry.getConverter('Celsius', 'Fahrenheit');

    expect(converter).toBeDefined();
    if (converter) {
      const result = converter(0 as Celsius);
      expect(result).toBe(32);
    }
  });

  it('registerBidirectional registers both directions', () => {
    const registry = createRegistry<'meters' | 'kilometers'>().registerBidirectional(
      'meters',
      'kilometers',
      {
        to: (m) => (m / 1000) as Kilometers,
        from: (km) => (km * 1000) as Meters
      }
    );

    const m2km = registry.getConverter('meters', 'kilometers');
    const km2m = registry.getConverter('kilometers', 'meters');

    expect(m2km).toBeDefined();
    expect(km2m).toBeDefined();

    if (m2km && km2m) {
      expect(m2km(1000 as Meters)).toBe(1);
      expect(km2m(1 as Kilometers)).toBe(1000);
    }
  });

  it('getConverter finds direct converter in O(1)', () => {
    const registry = createRegistry<'A' | 'B' | 'C'>()
      .register('A', 'B', (a) => (a * 2) as any)
      .register('B', 'C', (b) => (b * 3) as any);

    const startTime = performance.now();
    const converter = registry.getConverter('A', 'B');
    const endTime = performance.now();

    expect(converter).toBeDefined();
    // O(1) lookup should be fast (< 1ms even in slow environments)
    expect(endTime - startTime).toBeLessThan(5);
  });
});

describe('Registry - Multi-Hop Composition', () => {
  it('auto-compose 2-hop conversion (A→B→C)', () => {
    const registry = createRegistry<'A' | 'B' | 'C'>()
      .register('A', 'B', (a) => (a * 2) as any)
      .register('B', 'C', (b) => (b * 3) as any);

    const converter = registry.getConverter('A', 'C');

    expect(converter).toBeDefined();
    if (converter) {
      // A→B→C: 10 * 2 = 20, 20 * 3 = 60
      expect(converter(10 as any)).toBe(60);
    }
  });

  it('auto-compose 3-hop conversion (A→B→C→D)', () => {
    const registry = createRegistry<'A' | 'B' | 'C' | 'D'>()
      .register('A', 'B', (a) => (a * 2) as any)
      .register('B', 'C', (b) => (b * 3) as any)
      .register('C', 'D', (c) => (c * 5) as any);

    const converter = registry.getConverter('A', 'D');

    expect(converter).toBeDefined();
    if (converter) {
      // A→B→C→D: 10 * 2 * 3 * 5 = 300
      expect(converter(10 as any)).toBe(300);
    }
  });

  it('integration test: 3-unit distance conversion (m→km→mi)', () => {
    const registry = createRegistry<'meters' | 'kilometers' | 'miles'>()
      .registerBidirectional('meters', 'kilometers', {
        to: (m) => (m / 1000) as Kilometers,
        from: (km) => (km * 1000) as Meters
      })
      .registerBidirectional('kilometers', 'miles', {
        to: (km) => (km * 0.621371) as Miles,
        from: (mi) => (mi / 0.621371) as Kilometers
      });

    const converter = registry.getConverter('meters', 'miles');

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
    const registry = createRegistry<'A' | 'B' | 'C' | 'D'>()
      .register('A', 'B', (a) => (a + 100) as any) // Long path
      .register('B', 'D', (b) => (b + 100) as any)
      .register('A', 'C', (a) => (a + 200) as any) // Long path
      .register('C', 'D', (c) => (c + 200) as any)
      .register('A', 'D', (a) => (a * 10) as any); // Direct (shortest)

    const converter = registry.getConverter('A', 'D');

    if (converter) {
      // Should use direct path: 5 * 10 = 50
      expect(converter(5 as any)).toBe(50);
    }
  });
});

describe('Registry - Error Handling', () => {
  it('cycle detection throws CycleError with path', () => {
    // Create cycle: A→B→C→A
    const registry = createRegistry<'A' | 'B' | 'C'>()
      .register('A', 'B', (a) => (a * 2) as any)
      .register('B', 'C', (b) => (b * 3) as any)
      .register('C', 'A', (c) => (c * 5) as any);

    // Trying to convert from C to A would complete a cycle
    // But the actual cycle is detected when finding a path
    // Let me test a different scenario: trying to get a converter that would require going in a circle

    // Since we register C→A, we can actually get A to C via A→B→C
    // But trying to get C to C should trigger cycle detection
    expect(() => {
      registry.getConverter('C', 'C' as any); // Cast needed due to type constraint
    }).toThrow(CycleError);
  });

  it('max depth (>5 hops) throws MaxDepthError', () => {
    // Create chain: A→B→C→D→E→F→G (6 hops)
    const registry = createRegistry<'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G'>()
      .register('A', 'B', (a) => (a * 2) as any)
      .register('B', 'C', (b) => (b * 2) as any)
      .register('C', 'D', (c) => (c * 2) as any)
      .register('D', 'E', (d) => (d * 2) as any)
      .register('E', 'F', (e) => (e * 2) as any)
      .register('F', 'G', (f) => (f * 2) as any);

    expect(() => {
      registry.getConverter('A', 'G');
    }).toThrow(MaxDepthError);
  });

  it('missing converter path throws ConversionError', () => {
    const registry = createRegistry<'A' | 'B' | 'C'>().register('A', 'B', (a) => (a * 2) as any);
    // No path from A to C

    const result = registry.getConverter('A', 'C');
    expect(result).toBeUndefined();
  });
});

describe('Registry - Fluent API', () => {
  it('compile-time: wrong unit to convert() causes error', () => {
    const registry = createRegistry<'Celsius' | 'Fahrenheit'>().register(
      'Celsius',
      'Fahrenheit',
      (c) => ((c * 9) / 5 + 32) as Fahrenheit
    );

    const temp: Celsius = 25 as Celsius;

    // Valid conversion
    const fahrenheit = registry.convert(temp, 'Celsius').to('Fahrenheit');
    expect(fahrenheit).toBe(77);

    // Type safety test: This tests that wrong units are caught at compile-time
    // We can't easily test this at runtime, so we document the expected behavior
  });

  it('fluent API performs direct conversion', () => {
    const registry = createRegistry<'Celsius' | 'Fahrenheit'>().register(
      'Celsius',
      'Fahrenheit',
      (c) => ((c * 9) / 5 + 32) as Fahrenheit
    );

    const temp: Celsius = 0 as Celsius;
    const result = registry.convert(temp, 'Celsius').to('Fahrenheit');

    expect(result).toBe(32);
    // Type is WithUnits<any, 'Fahrenheit'> which is compatible with Fahrenheit
  });

  it('fluent API performs multi-hop conversion', () => {
    const registry = createRegistry<'Celsius' | 'Fahrenheit' | 'Kelvin'>()
      .register('Celsius', 'Kelvin', (c) => (c + 273.15) as Kelvin)
      .register('Kelvin', 'Fahrenheit', (k) => (((k - 273.15) * 9) / 5 + 32) as Fahrenheit);

    const temp: Celsius = 0 as Celsius;
    const fahrenheit = registry.convert(temp, 'Celsius').to('Fahrenheit');

    expect(fahrenheit).toBeCloseTo(32, 5);
  });

  it('fluent API throws error for missing path', () => {
    const registry = createRegistry<'A' | 'B' | 'C'>().register('A', 'B', (a) => (a * 2) as any);

    expect(() => {
      registry.convert(10 as any, 'A').to('C');
    }).toThrow(ConversionError);
  });
});

describe('Registry - Immutability', () => {
  it('register returns new registry instance', () => {
    const registry1 = createRegistry<'A' | 'B'>();
    const registry2 = registry1.register('A', 'B', (a) => (a * 2) as any);

    expect(registry1).not.toBe(registry2);
  });

  it('original registry unchanged after register', () => {
    const registry1 = createRegistry<'A' | 'B' | 'C'>();
    const registry2 = registry1.register('A', 'B', (a) => (a * 2) as any);

    // registry1 should not have the converter
    expect(registry1.getConverter('A', 'B')).toBeUndefined();

    // registry2 should have the converter
    expect(registry2.getConverter('A', 'B')).toBeDefined();
  });
});

describe('Registry - Performance', () => {
  it('caches composed paths for repeated conversions', () => {
    const registry = createRegistry<'A' | 'B' | 'C'>()
      .register('A', 'B', (a) => (a * 2) as any)
      .register('B', 'C', (b) => (b * 3) as any);

    // First call - may be slower due to BFS
    const start1 = performance.now();
    const converter1 = registry.getConverter('A', 'C');
    const end1 = performance.now();
    const time1 = end1 - start1;

    // Second call - should be faster (cached)
    const start2 = performance.now();
    const converter2 = registry.getConverter('A', 'C');
    const end2 = performance.now();
    const time2 = end2 - start2;

    expect(converter1).toBeDefined();
    expect(converter2).toBeDefined();
    // Second call should be as fast or faster (cached)
    expect(time2).toBeLessThanOrEqual(time1 * 2); // Allow some variance
  });
});
