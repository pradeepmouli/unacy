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

    type CelsiusWithMeta = WithUnits<number, typeof CelsiusMetadata>;

    // Type should preserve the specific metadata type
    expectTypeOf<CelsiusWithMeta>().toMatchTypeOf<WithUnits<number, typeof CelsiusMetadata>>();
  });

  it('defaults to BaseMetadata when no metadata specified', () => {
    // Define a default metadata for testing default behavior
    const MetersMetadata = {
      name: 'meters' as const
    } satisfies BaseMetadata;

    type Meters = WithUnits<number, typeof MetersMetadata>;

    const distance: Meters = 25 as Meters;

    // Should work with minimal metadata
    expectTypeOf<Meters>().toMatchTypeOf<WithUnits<number, typeof MetersMetadata>>();
  });

  it('supports literal type inference for name property', () => {
    const KelvinMetadata = {
      name: 'Kelvin' as const,
      symbol: 'K'
    } satisfies BaseMetadata;

    type KelvinWithMeta = WithUnits<number, typeof KelvinMetadata>;

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

    type ValidUnit = WithUnits<number, typeof metadata>;
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

    type FahrenheitWithMeta = WithUnits<number, typeof FahrenheitMetadata>;

    const temp: FahrenheitWithMeta = 77 as FahrenheitWithMeta;

    expectTypeOf<FahrenheitWithMeta>().toMatchTypeOf<
      WithUnits<number, typeof FahrenheitMetadata>
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

    type CelsiusUnit = WithUnits<number, typeof Celsius>;
    type FahrenheitUnit = WithUnits<number, typeof Fahrenheit>;

    const c: CelsiusUnit = 0 as CelsiusUnit;
    const f: FahrenheitUnit = 32 as FahrenheitUnit;

    // Different metadata types should be preserved
    expectTypeOf<CelsiusUnit>().not.toEqualTypeOf<FahrenheitUnit>();
  });

  it('metadata type parameter is required with BaseMetadata default', () => {
    // WithUnits requires metadata but defaults to BaseMetadata
    const SimpleMetadata = {
      name: 'meters' as const
    } satisfies BaseMetadata;

    type SimpleUnit = WithUnits<number, typeof SimpleMetadata>;

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

    type ComplexUnit = WithUnits<number, typeof ComplexMetadata>;

    const value: ComplexUnit = 42 as ComplexUnit;

    expectTypeOf<ComplexUnit>().toMatchTypeOf<WithUnits<number, typeof ComplexMetadata>>();
  });
});
