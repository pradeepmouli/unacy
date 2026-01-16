import { describe, it, expect, expectTypeOf } from 'vitest';
import type { WithUnits, BaseMetadata } from '../types.js';

describe('WithUnits Type Inference with Metadata', () => {
  it('infers metadata type from provided metadata object', () => {
    // Define metadata with specific shape
    const CelsiusMetadata = {
      name: 'Celsius' as const,
      symbol: '°C',
      description: 'Temperature in Celsius'
    } satisfies BaseMetadata;

    type CelsiusWithMeta = WithUnits<number, 'Celsius', typeof CelsiusMetadata>;

    const temp: CelsiusWithMeta = 25 as CelsiusWithMeta;

    // Type should preserve the specific metadata type
    expectTypeOf<CelsiusWithMeta>().toMatchTypeOf<
      WithUnits<number, 'Celsius', typeof CelsiusMetadata>
    >();
  });

  it('defaults to BaseMetadata when no metadata specified', () => {
    type Celsius = WithUnits<number, 'Celsius'>;

    const temp: Celsius = 25 as Celsius;

    // Should default to BaseMetadata
    expectTypeOf<Celsius>().toMatchTypeOf<WithUnits<number, 'Celsius', BaseMetadata>>();
  });

  it('supports literal type inference for name property', () => {
    const KelvinMetadata = {
      name: 'Kelvin' as const,
      symbol: 'K'
    } satisfies BaseMetadata;

    type KelvinWithMeta = WithUnits<number, 'Kelvin', typeof KelvinMetadata>;

    // The name should be narrowed to literal type 'Kelvin'
    expectTypeOf<typeof KelvinMetadata.name>().toEqualTypeOf<'Kelvin'>();
  });

  it('compile-time: metadata should extend BaseMetadata', () => {
    // This test verifies that metadata types extend BaseMetadata
    // Once we add the constraint, this will enforce name property
    interface ValidMetadata extends BaseMetadata {
      symbol: string;
    }

    const metadata: ValidMetadata = {
      name: 'Test',
      symbol: 'T'
    };

    type ValidUnit = WithUnits<number, 'Test', ValidMetadata>;
    const unit: ValidUnit = 42 as ValidUnit;

    expect(unit).toBe(42);
  });

  it('allows extended metadata with custom properties', () => {
    interface TemperatureMetadata extends BaseMetadata {
      symbol: string;
      baseUnit: string;
      offset?: number;
    }

    const FahrenheitMetadata: TemperatureMetadata = {
      name: 'Fahrenheit',
      symbol: '°F',
      baseUnit: 'Kelvin',
      offset: 459.67
    };

    type FahrenheitWithMeta = WithUnits<number, 'Fahrenheit', typeof FahrenheitMetadata>;

    const temp: FahrenheitWithMeta = 77 as FahrenheitWithMeta;

    expectTypeOf<FahrenheitWithMeta>().toMatchTypeOf<
      WithUnits<number, 'Fahrenheit', typeof FahrenheitMetadata>
    >();
  });

  it('supports multiple units with different metadata types', () => {
    const Celsius = {
      name: 'Celsius' as const,
      symbol: '°C'
    } satisfies BaseMetadata;

    const Fahrenheit = {
      name: 'Fahrenheit' as const,
      symbol: '°F',
      freezingPoint: 32
    } satisfies BaseMetadata;

    type CelsiusUnit = WithUnits<number, 'Celsius', typeof Celsius>;
    type FahrenheitUnit = WithUnits<number, 'Fahrenheit', typeof Fahrenheit>;

    const c: CelsiusUnit = 0 as CelsiusUnit;
    const f: FahrenheitUnit = 32 as FahrenheitUnit;

    // Different metadata types should be preserved
    expectTypeOf<CelsiusUnit>().not.toEqualTypeOf<FahrenheitUnit>();
  });

  it('metadata type parameter is optional', () => {
    // WithUnits should work without explicit metadata type
    type SimpleUnit = WithUnits<number, 'meters'>;

    const distance: SimpleUnit = 100 as SimpleUnit;

    expect(distance).toBe(100);
  });

  it('supports metadata with nested complex types', () => {
    const ComplexMetadata = {
      name: 'Complex' as const,
      config: {
        precision: 2,
        formatting: {
          locale: 'en-US',
          style: 'decimal'
        }
      },
      tags: ['measurement', 'physical']
    } satisfies BaseMetadata;

    type ComplexUnit = WithUnits<number, 'Complex', typeof ComplexMetadata>;

    const value: ComplexUnit = 42 as ComplexUnit;

    expectTypeOf<ComplexUnit>().toMatchTypeOf<
      WithUnits<number, 'Complex', typeof ComplexMetadata>
    >();
  });
});
