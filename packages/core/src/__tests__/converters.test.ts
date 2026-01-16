import { describe, it, expect, expectTypeOf } from 'vitest';
import type { Converter, BidirectionalConverter } from '../converters.js';
import type { WithUnits } from '../types.js';
import {
  CelsiusMetadata,
  FahrenheitMetadata,
  KelvinMetadata,
  MetersMetadata,
  FeetMetadata
} from './test-metadata.js';

// Define test unit types
type Celsius = WithUnits<number, typeof CelsiusMetadata>;
type Fahrenheit = WithUnits<number, typeof FahrenheitMetadata>;
type Kelvin = WithUnits<number, typeof KelvinMetadata>;
type Meters = WithUnits<number, typeof MetersMetadata>;
type Feet = WithUnits<number, typeof FeetMetadata>;

describe('Converter Type', () => {
  it('unidirectional converter returns correct type', () => {
    const celsiusToFahrenheit: Converter<Celsius, Fahrenheit> = (c) =>
      ((c * 9) / 5 + 32) as Fahrenheit;

    const celsius: Celsius = 25 as Celsius;
    const fahrenheit = celsiusToFahrenheit(celsius);

    expectTypeOf(fahrenheit).toEqualTypeOf<Fahrenheit>();
    expect(fahrenheit).toBe(77);
  });

  it('converter function is deterministic (same input → same output)', () => {
    const celsiusToFahrenheit: Converter<Celsius, Fahrenheit> = (c) =>
      ((c * 9) / 5 + 32) as Fahrenheit;

    const celsius: Celsius = 100 as Celsius;

    // Call multiple times with same input
    const result1 = celsiusToFahrenheit(celsius);
    const result2 = celsiusToFahrenheit(celsius);
    const result3 = celsiusToFahrenheit(celsius);

    expect(result1).toBe(result2);
    expect(result2).toBe(result3);
    expect(result1).toBe(212); // 100°C = 212°F
  });

  it('compile-time: wrong unit type to converter causes compile error', () => {
    const celsiusToFahrenheit: Converter<Celsius, Fahrenheit> = (c) =>
      ((c * 9) / 5 + 32) as Fahrenheit;

    const meters: Meters = 100 as Meters;

    // @ts-expect-error - Cannot pass Meters to Celsius→Fahrenheit converter
    const result = celsiusToFahrenheit(meters);

    expect(result).toBeDefined(); // Runtime still works but types don't match
  });

  it('maintains type safety through variables', () => {
    const metersToFeet: Converter<Meters, Feet> = (m) => (m * 3.28084) as Feet;

    const distance: Meters = 10 as Meters;
    const converted = metersToFeet(distance);

    expectTypeOf(converted).toEqualTypeOf<Feet>();
    expect(converted).toBeCloseTo(32.8084, 4);
  });

  it('works with different conversion formulas', () => {
    const celsiusToKelvin: Converter<Celsius, Kelvin> = (c) => (c + 273.15) as Kelvin;

    const celsius: Celsius = 0 as Celsius;
    const kelvin = celsiusToKelvin(celsius);

    expect(kelvin).toBe(273.15);
    expectTypeOf(kelvin).toEqualTypeOf<Kelvin>();
  });
});

describe('BidirectionalConverter Type', () => {
  it('bidirectional converter round-trip preserves value within tolerance', () => {
    const metersFeet: BidirectionalConverter<Meters, Feet> = {
      to: (m) => (m * 3.28084) as Feet,
      from: (f) => (f / 3.28084) as Meters
    };

    const original: Meters = 10 as Meters;
    const feet = metersFeet.to(original);
    const backToMeters = metersFeet.from(feet);

    expect(backToMeters).toBeCloseTo(original, 10);
    expectTypeOf(backToMeters).toEqualTypeOf<Meters>();
  });

  it('forward and reverse converters have correct types', () => {
    const celsiusFahrenheit: BidirectionalConverter<Celsius, Fahrenheit> = {
      to: (c) => ((c * 9) / 5 + 32) as Fahrenheit,
      from: (f) => (((f - 32) * 5) / 9) as Celsius
    };

    const celsius: Celsius = 20 as Celsius;
    const fahrenheit = celsiusFahrenheit.to(celsius);

    expectTypeOf(fahrenheit).toEqualTypeOf<Fahrenheit>();
    expectTypeOf(celsiusFahrenheit.to).toEqualTypeOf<Converter<Celsius, Fahrenheit>>();
    expectTypeOf(celsiusFahrenheit.from).toEqualTypeOf<Converter<Fahrenheit, Celsius>>();
  });

  it('round-trip multiple conversions', () => {
    const celsiusFahrenheit: BidirectionalConverter<Celsius, Fahrenheit> = {
      to: (c) => ((c * 9) / 5 + 32) as Fahrenheit,
      from: (f) => (((f - 32) * 5) / 9) as Celsius
    };

    const testValues: Celsius[] = [-40, -20, 0, 25, 37, 100].map((v) => v as Celsius);

    testValues.forEach((original) => {
      const fahrenheit = celsiusFahrenheit.to(original);
      const backToCelsius = celsiusFahrenheit.from(fahrenheit);

      expect(backToCelsius).toBeCloseTo(original, 10);
    });
  });

  it('handles edge cases in conversion', () => {
    const celsiusFahrenheit: BidirectionalConverter<Celsius, Fahrenheit> = {
      to: (c) => ((c * 9) / 5 + 32) as Fahrenheit,
      from: (f) => (((f - 32) * 5) / 9) as Celsius
    };

    // Absolute zero point where C and F scales intersect
    const absoluteZero: Celsius = -273.15 as Celsius;
    const fahrenheit = celsiusFahrenheit.to(absoluteZero);
    const backToCelsius = celsiusFahrenheit.from(fahrenheit);

    expect(backToCelsius).toBeCloseTo(absoluteZero, 10);
  });

  it('both directions maintain type safety', () => {
    const celsiusKelvin: BidirectionalConverter<Celsius, Kelvin> = {
      to: (c) => (c + 273.15) as Kelvin,
      from: (k) => (k - 273.15) as Celsius
    };

    const celsius: Celsius = 100 as Celsius;
    const kelvin = celsiusKelvin.to(celsius);

    expectTypeOf(kelvin).toEqualTypeOf<Kelvin>();

    // @ts-expect-error - Cannot pass Fahrenheit to Kelvin→Celsius converter
    const invalid = celsiusKelvin.from(77 as Fahrenheit);

    expect(invalid).toBeDefined();
  });

  it('precision loss is acceptable for approximate conversions', () => {
    const metersFeet: BidirectionalConverter<Meters, Feet> = {
      to: (m) => (m * 3.28084) as Feet,
      from: (f) => (f / 3.28084) as Meters
    };

    // Test with value that may have floating point precision issues
    const original: Meters = 1.23456789 as Meters;
    const feet = metersFeet.to(original);
    const backToMeters = metersFeet.from(feet);

    // Allow small precision loss
    expect(Math.abs(backToMeters - original)).toBeLessThan(0.0000001);
  });
});

describe('Converter Examples', () => {
  it('temperature conversions match expected values', () => {
    const celsiusToFahrenheit: Converter<Celsius, Fahrenheit> = (c) =>
      ((c * 9) / 5 + 32) as Fahrenheit;

    expect(celsiusToFahrenheit(0 as Celsius)).toBe(32); // Freezing point
    expect(celsiusToFahrenheit(100 as Celsius)).toBe(212); // Boiling point
    expect(celsiusToFahrenheit(37 as Celsius)).toBeCloseTo(98.6, 1); // Body temp
  });

  it('distance conversions match expected values', () => {
    const metersToFeet: Converter<Meters, Feet> = (m) => (m * 3.28084) as Feet;

    expect(metersToFeet(1 as Meters)).toBeCloseTo(3.28084, 4);
    expect(metersToFeet(10 as Meters)).toBeCloseTo(32.8084, 4);
    expect(metersToFeet(100 as Meters)).toBeCloseTo(328.084, 3);
  });
});
