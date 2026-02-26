import { describe, it, expect, expectTypeOf } from 'vitest';
import type { BaseMetadata } from '../types.js';
import {
  isEnumMetadata,
  isClassMetadata,
  isRecordMetadata,
  isTupleMetadata,
  detectMetadataKind
} from '../utils/validation.js';

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

describe('Type Category Introspection (T064, T069)', () => {
  // Define test types
  enum Status {
    ACTIVE = 0,
    INACTIVE = 1
  }
  enum Color {
    RED = 'red',
    GREEN = 'green',
    BLUE = 'blue'
  }
  class Widget {
    constructor(public id: number) {}
  }

  const primitiveMeta = { name: 'Celsius', type: 'number' };
  const numericEnumMeta = { name: 'Status', type: Status };
  const stringEnumMeta = { name: 'Color', type: Color };
  const classMeta = { name: 'Widget', type: Widget };
  const recordMeta = { name: 'Point', type: { x: 'number', y: 'number' } };
  const tupleMeta = { name: 'RGB', type: ['number', 'number', 'number'] };

  it('isEnumMetadata correctly identifies all types', () => {
    expect(isEnumMetadata(primitiveMeta)).toBe(false);
    expect(isEnumMetadata(numericEnumMeta)).toBe(true);
    expect(isEnumMetadata(stringEnumMeta)).toBe(true);
    expect(isEnumMetadata(classMeta)).toBe(false);
    expect(isEnumMetadata(recordMeta)).toBe(false);
    expect(isEnumMetadata(tupleMeta)).toBe(false);
  });

  it('isClassMetadata correctly identifies all types', () => {
    expect(isClassMetadata(primitiveMeta)).toBe(false);
    expect(isClassMetadata(numericEnumMeta)).toBe(false);
    expect(isClassMetadata(stringEnumMeta)).toBe(false);
    expect(isClassMetadata(classMeta)).toBe(true);
    expect(isClassMetadata(recordMeta)).toBe(false);
    expect(isClassMetadata(tupleMeta)).toBe(false);
  });

  it('isRecordMetadata correctly identifies all types', () => {
    expect(isRecordMetadata(primitiveMeta)).toBe(false);
    expect(isRecordMetadata(numericEnumMeta)).toBe(false);
    expect(isRecordMetadata(stringEnumMeta)).toBe(false);
    expect(isRecordMetadata(classMeta)).toBe(false);
    expect(isRecordMetadata(recordMeta)).toBe(true);
    expect(isRecordMetadata(tupleMeta)).toBe(false);
  });

  it('isTupleMetadata correctly identifies all types', () => {
    expect(isTupleMetadata(primitiveMeta)).toBe(false);
    expect(isTupleMetadata(numericEnumMeta)).toBe(false);
    expect(isTupleMetadata(stringEnumMeta)).toBe(false);
    expect(isTupleMetadata(classMeta)).toBe(false);
    expect(isTupleMetadata(recordMeta)).toBe(false);
    expect(isTupleMetadata(tupleMeta)).toBe(true);
  });

  it('detectMetadataKind correctly categorizes all types', () => {
    expect(detectMetadataKind(primitiveMeta)).toBe('primitive');
    expect(detectMetadataKind(numericEnumMeta)).toBe('enum');
    expect(detectMetadataKind(stringEnumMeta)).toBe('enum');
    expect(detectMetadataKind(classMeta)).toBe('class');
    expect(detectMetadataKind(recordMeta)).toBe('record');
    expect(detectMetadataKind(tupleMeta)).toBe('tuple');
  });

  it('detectMetadataKind handles edge cases', () => {
    expect(detectMetadataKind(null)).toBe('unknown');
    expect(detectMetadataKind(undefined)).toBe('unknown');
    expect(detectMetadataKind({})).toBe('unknown');
    expect(detectMetadataKind({ name: 'test' })).toBe('unknown');
  });

  it('type guards return false for null/undefined', () => {
    for (const guard of [isEnumMetadata, isClassMetadata, isRecordMetadata, isTupleMetadata]) {
      expect(guard(null)).toBe(false);
      expect(guard(undefined)).toBe(false);
      expect(guard(42)).toBe(false);
      expect(guard('string')).toBe(false);
    }
  });
});
