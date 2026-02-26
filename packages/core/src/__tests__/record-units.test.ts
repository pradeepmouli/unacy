/**
 * Tests for Record-Based Units (User Story 3)
 * Following TDD: These tests are written FIRST
 */

import { describe, it, expect } from 'vitest';
import type { TypedMetadata } from '../types.js';
import { validateRecordSchema, isRecordMetadata, detectMetadataKind } from '../utils/validation.js';

describe('Record Units - Basic Registration (T034)', () => {
  it('T034: should validate basic record schema', () => {
    const pointSchema = { x: 'number', y: 'number' } as const;
    expect(validateRecordSchema(pointSchema)).toBe(true);
  });

  it('T034: should reject non-record values', () => {
    expect(validateRecordSchema(null)).toBe(false);
    expect(validateRecordSchema(undefined)).toBe(false);
    expect(validateRecordSchema(123)).toBe(false);
    expect(validateRecordSchema('string')).toBe(false);
    expect(validateRecordSchema([])).toBe(false);
  });
});

describe('Record Units - Simple Record Schema (T035)', () => {
  it('T035: should validate Point schema', () => {
    const pointSchema = { x: 'number', y: 'number' } as const;
    expect(validateRecordSchema(pointSchema)).toBe(true);
  });

  it('T035: should create metadata with record schema as type field', () => {
    const schema = { x: 'number', y: 'number' } as const;
    const metadata: TypedMetadata<typeof schema> = {
      name: 'Point',
      type: schema
    };

    expect(metadata.type).toBe(schema);
    expect(metadata.name).toBe('Point');
    expect(metadata.type.x).toBe('number');
    expect(metadata.type.y).toBe('number');
  });

  it('T035: should validate schema with all primitive types', () => {
    const schema = {
      count: 'number',
      label: 'string',
      active: 'boolean',
      id: 'bigint'
    };
    expect(validateRecordSchema(schema)).toBe(true);
  });
});

describe('Record Units - Nested Record Schema (T036)', () => {
  it('T036: should validate nested record schema', () => {
    const addressSchema = {
      street: 'string',
      city: 'string',
      coordinates: {
        lat: 'number',
        lng: 'number'
      }
    };
    expect(validateRecordSchema(addressSchema)).toBe(true);
  });

  it('T036: should create metadata with nested schema', () => {
    const schema = {
      name: 'string',
      location: {
        x: 'number',
        y: 'number'
      }
    } as const;

    const metadata: TypedMetadata<typeof schema> = {
      name: 'Entity',
      type: schema
    };

    expect(metadata.type.name).toBe('string');
    expect(metadata.type.location.x).toBe('number');
    expect(metadata.type.location.y).toBe('number');
  });

  it('T036: should validate deeply nested schemas', () => {
    const deepSchema = {
      level1: {
        level2: {
          level3: {
            value: 'number'
          }
        }
      }
    };
    expect(validateRecordSchema(deepSchema)).toBe(true);
  });
});

describe('Record Units - Circular Reference Rejection (T037)', () => {
  it('T037: should reject circular reference with clear error message', () => {
    const circular: Record<string, unknown> = { name: 'string' };
    circular.self = circular;

    expect(() => validateRecordSchema(circular)).toThrow(
      'Circular references in record schemas are not supported'
    );
  });

  it('T037: should provide helpful error message for circular references', () => {
    const circular: Record<string, unknown> = { name: 'string' };
    circular.self = circular;

    expect(() => validateRecordSchema(circular)).toThrow(
      'restructure your schema to avoid self-referential structures'
    );
  });
});

describe('Record Units - Empty Record (T038)', () => {
  it('T038: should validate empty record schema', () => {
    expect(validateRecordSchema({})).toBe(true);
  });

  it('T038: should create metadata with empty record', () => {
    const schema = {} as const;
    const metadata: TypedMetadata<typeof schema> = {
      name: 'Empty',
      type: schema
    };

    expect(metadata.type).toBe(schema);
    expect(Object.keys(metadata.type).length).toBe(0);
  });
});

describe('Record Units - Invalid Type Name Rejection (T039)', () => {
  it('T039: should reject invalid type name in schema', () => {
    const invalidSchema = { x: 'number', y: 'invalid' };
    expect(() => validateRecordSchema(invalidSchema)).toThrow('Invalid type name "invalid"');
  });

  it('T039: should reject non-string, non-object schema values', () => {
    const invalidSchema = { x: 'number', y: 42 };
    expect(() => validateRecordSchema(invalidSchema)).toThrow('Invalid schema value');
  });

  it('T039: should provide the property name in error message', () => {
    const invalidSchema = { x: 'number', badProp: 'invalid_type' };
    expect(() => validateRecordSchema(invalidSchema)).toThrow('badProp');
  });
});

describe('Record Units - Metadata Introspection (T040)', () => {
  it('T040: should identify record metadata with type guard', () => {
    const schema = { x: 'number', y: 'number' } as const;
    const recordMetadata: TypedMetadata<typeof schema> = {
      name: 'Point',
      type: schema
    };

    expect(isRecordMetadata(recordMetadata)).toBe(true);
  });

  it('T040: should reject non-record metadata', () => {
    const primitiveMetadata = {
      name: 'Celsius',
      type: 'number'
    };

    const classMetadata = {
      name: 'Temperature',
      type: class {}
    };

    expect(isRecordMetadata(primitiveMetadata)).toBe(false);
    expect(isRecordMetadata(classMetadata)).toBe(false);
    expect(isRecordMetadata(null)).toBe(false);
    expect(isRecordMetadata(undefined)).toBe(false);
  });

  it('T040: should detect record metadata kind', () => {
    const schema = { x: 'number', y: 'number' } as const;
    const recordMetadata: TypedMetadata<typeof schema> = {
      name: 'Point',
      type: schema
    };

    expect(detectMetadataKind(recordMetadata)).toBe('record');
  });

  it('T040: should distinguish record from enum metadata', () => {
    enum LogLevel {
      DEBUG = 0,
      INFO = 1
    }

    const enumMetadata = { name: 'LogLevel', type: LogLevel };
    const recordMetadata = { name: 'Point', type: { x: 'number', y: 'number' } };

    expect(isRecordMetadata(enumMetadata)).toBe(false);
    expect(isRecordMetadata(recordMetadata)).toBe(true);
    expect(detectMetadataKind(enumMetadata)).toBe('enum');
    expect(detectMetadataKind(recordMetadata)).toBe('record');
  });

  it('T040: should access schema directly from metadata type field', () => {
    const schema = { x: 'number', y: 'number' } as const;
    const metadata: TypedMetadata<typeof schema> = {
      name: 'Point',
      type: schema
    };

    expect(metadata.type === schema).toBe(true);
    expect(metadata.type.x).toBe('number');
  });
});
