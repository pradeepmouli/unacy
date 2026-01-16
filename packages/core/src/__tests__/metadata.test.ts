import { describe, it, expect, expectTypeOf } from 'vitest';
import type { BaseMetadata } from '../types.js';

describe('BaseMetadata Type Constraints', () => {
  it('requires name property', () => {
    // Valid metadata with name
    const validMetadata: BaseMetadata = {
      name: 'Celsius'
    };

    expect(validMetadata.name).toBe('Celsius');
    expectTypeOf(validMetadata).toMatchTypeOf<BaseMetadata>();
  });

  it('compile-time: rejects metadata without name', () => {
    // @ts-expect-error - BaseMetadata requires name property
    const invalidMetadata: BaseMetadata = {
      symbol: '°C'
    };

    expect(invalidMetadata).toBeDefined();
  });

  it('allows additional properties (extensible)', () => {
    const extendedMetadata: BaseMetadata = {
      name: 'Celsius',
      symbol: '°C',
      description: 'Temperature in Celsius',
      customProperty: 'custom value',
      nested: {
        data: 'nested'
      }
    };

    expect(extendedMetadata.name).toBe('Celsius');
    expect(extendedMetadata['symbol']).toBe('°C');
    expect(extendedMetadata['description']).toBe('Temperature in Celsius');
    expectTypeOf(extendedMetadata).toMatchTypeOf<BaseMetadata>();
  });

  it('supports literal type inference with as const', () => {
    const Celsius = {
      name: 'Celsius' as const,
      symbol: '°C'
    } satisfies BaseMetadata;

    // Type should be narrowed to literal 'Celsius'
    expectTypeOf(Celsius.name).toEqualTypeOf<'Celsius'>();
    expectTypeOf(Celsius).toMatchTypeOf<BaseMetadata>();
  });

  it('name must be a string', () => {
    const metadata: BaseMetadata = {
      name: 'SomeUnit',
      otherProp: 123
    };

    expectTypeOf(metadata.name).toEqualTypeOf<string>();
  });

  it('supports Record<string, unknown> for arbitrary properties', () => {
    const metadata: BaseMetadata = {
      name: 'TestUnit',
      arbitraryKey: 'value',
      anotherKey: 42,
      yetAnother: true,
      complexData: { nested: [1, 2, 3] }
    };

    expect(metadata.name).toBe('TestUnit');
    expect(metadata['arbitraryKey']).toBe('value');
    expect(metadata['anotherKey']).toBe(42);
  });

  it('compile-time: name property is required and cannot be omitted', () => {
    // This should fail at compile time
    // @ts-expect-error - name is required
    const noName: BaseMetadata = {
      symbol: 'X'
    };

    expect(noName).toBeDefined();
  });

  it('works with type narrowing for specific metadata shapes', () => {
    interface TemperatureMetadata extends BaseMetadata {
      symbol: string;
      baseUnit: string;
    }

    const celsius: TemperatureMetadata = {
      name: 'Celsius',
      symbol: '°C',
      baseUnit: 'Kelvin'
    };

    expectTypeOf(celsius).toMatchTypeOf<BaseMetadata>();
    expectTypeOf(celsius).toMatchTypeOf<TemperatureMetadata>();
    expect(celsius.baseUnit).toBe('Kelvin');
  });
});
