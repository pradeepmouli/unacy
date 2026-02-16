/**
 * Tests for Tuple-Based Units (User Story 4)
 * Following TDD: These tests are written FIRST
 */

import { describe, it, expect } from 'vitest';
import type { TypedMetadata } from '../types.js';
import { validateTupleSchema, isTupleMetadata, detectMetadataKind } from '../utils/validation.js';

describe('Tuple Units - Basic Registration (T048)', () => {
  it('T048: should validate basic tuple schema', () => {
    const rgb = ['number', 'number', 'number'] as const;
    expect(validateTupleSchema(rgb)).toBe(true);
  });

  it('T048: should reject non-tuple values', () => {
    expect(validateTupleSchema(null)).toBe(false);
    expect(validateTupleSchema(undefined)).toBe(false);
    expect(validateTupleSchema(123)).toBe(false);
    expect(validateTupleSchema('string')).toBe(false);
    expect(validateTupleSchema({})).toBe(false);
  });
});

describe('Tuple Units - Simple Tuple Schema (T049)', () => {
  it('T049: should validate RGB triplet', () => {
    const rgb = ['number', 'number', 'number'] as const;
    expect(validateTupleSchema(rgb)).toBe(true);
  });

  it('T049: should create metadata with tuple schema as type field', () => {
    const schema = ['number', 'number', 'number'] as const;
    const metadata: TypedMetadata<typeof schema> = {
      name: 'RGB',
      type: schema
    };

    expect(metadata.type).toBe(schema);
    expect(metadata.name).toBe('RGB');
    expect(metadata.type[0]).toBe('number');
    expect(metadata.type[1]).toBe('number');
    expect(metadata.type[2]).toBe('number');
  });

  it('T049: should validate mixed-type tuple', () => {
    const mixed = ['string', 'number', 'boolean'] as const;
    expect(validateTupleSchema(mixed)).toBe(true);
  });
});

describe('Tuple Units - Optional Elements (T050)', () => {
  it('T050: should validate tuple with optional element', () => {
    const rgba = ['number', 'number', 'number', 'number?'] as const;
    expect(validateTupleSchema(rgba)).toBe(true);
  });

  it('T050: should create metadata with optional tuple elements', () => {
    const schema = ['number', 'number', 'number', 'number?'] as const;
    const metadata: TypedMetadata<typeof schema> = {
      name: 'RGBA',
      type: schema
    };

    expect(metadata.type.length).toBe(4);
    expect(metadata.type[3]).toBe('number?');
  });

  it('T050: should validate multiple optional elements', () => {
    const schema = ['string', 'number?', 'boolean?'] as const;
    expect(validateTupleSchema(schema)).toBe(true);
  });
});

describe('Tuple Units - Rest Elements (T051)', () => {
  it('T051: should validate tuple with rest element', () => {
    const variadic = ['string', '...number'] as const;
    expect(validateTupleSchema(variadic)).toBe(true);
  });

  it('T051: should create metadata with rest tuple element', () => {
    const schema = ['string', '...number'] as const;
    const metadata: TypedMetadata<typeof schema> = {
      name: 'NamedValues',
      type: schema
    };

    expect(metadata.type.length).toBe(2);
    expect(metadata.type[0]).toBe('string');
    expect(metadata.type[1]).toBe('...number');
  });
});

describe('Tuple Units - Empty Tuple (T052)', () => {
  it('T052: should validate empty tuple', () => {
    expect(validateTupleSchema([])).toBe(true);
  });

  it('T052: should create metadata with empty tuple', () => {
    const schema = [] as const;
    const metadata: TypedMetadata<typeof schema> = {
      name: 'Empty',
      type: schema
    };

    expect(metadata.type).toBe(schema);
    expect(metadata.type.length).toBe(0);
  });
});

describe('Tuple Units - Invalid Type Name Rejection (T053)', () => {
  it('T053: should reject invalid type name in tuple', () => {
    const invalid = ['number', 'invalid'] as unknown[];
    expect(() => validateTupleSchema(invalid)).toThrow('Invalid type name "invalid"');
  });

  it('T053: should reject non-string elements', () => {
    const invalid = ['number', 42] as unknown[];
    expect(() => validateTupleSchema(invalid)).toThrow('must be a string');
  });

  it('T053: should provide index in error message', () => {
    const invalid = ['number', 'invalid'] as unknown[];
    expect(() => validateTupleSchema(invalid)).toThrow('index 1');
  });
});

describe('Tuple Units - Metadata Introspection (T054)', () => {
  it('T054: should identify tuple metadata with type guard', () => {
    const schema = ['number', 'number', 'number'] as const;
    const tupleMetadata: TypedMetadata<typeof schema> = {
      name: 'RGB',
      type: schema
    };

    expect(isTupleMetadata(tupleMetadata)).toBe(true);
  });

  it('T054: should reject non-tuple metadata', () => {
    const primitiveMetadata = {
      name: 'Celsius',
      type: 'number'
    };

    const recordMetadata = {
      name: 'Point',
      type: { x: 'number', y: 'number' }
    };

    expect(isTupleMetadata(primitiveMetadata)).toBe(false);
    expect(isTupleMetadata(recordMetadata)).toBe(false);
    expect(isTupleMetadata(null)).toBe(false);
    expect(isTupleMetadata(undefined)).toBe(false);
  });

  it('T054: should detect tuple metadata kind', () => {
    const schema = ['number', 'number', 'number'] as const;
    const tupleMetadata: TypedMetadata<typeof schema> = {
      name: 'RGB',
      type: schema
    };

    expect(detectMetadataKind(tupleMetadata)).toBe('tuple');
  });

  it('T054: should distinguish tuple from other metadata types', () => {
    enum Size {
      S = 0,
      M = 1,
      L = 2
    }

    const enumMeta = { name: 'Size', type: Size };
    const classMeta = { name: 'Temp', type: class {} };
    const recordMeta = { name: 'Point', type: { x: 'number' } };
    const tupleMeta = { name: 'RGB', type: ['number', 'number', 'number'] };
    const primitiveMeta = { name: 'C', type: 'number' };

    expect(detectMetadataKind(enumMeta)).toBe('enum');
    expect(detectMetadataKind(classMeta)).toBe('class');
    expect(detectMetadataKind(recordMeta)).toBe('record');
    expect(detectMetadataKind(tupleMeta)).toBe('tuple');
    expect(detectMetadataKind(primitiveMeta)).toBe('primitive');
  });

  it('T054: should access schema directly from metadata type field', () => {
    const schema = ['number', 'string', 'boolean'] as const;
    const metadata: TypedMetadata<typeof schema> = {
      name: 'Triple',
      type: schema
    };

    expect(metadata.type === schema).toBe(true);
    expect(metadata.type[0]).toBe('number');
    expect(metadata.type[1]).toBe('string');
    expect(metadata.type[2]).toBe('boolean');
  });
});
