/**
 * Tests for Enum-Based Units (User Story 1)
 * Following TDD: These tests are written FIRST and should FAIL initially
 */

import { describe, it, expect } from 'vitest';
import type { TypedMetadata } from '../types.js';
import { validateEnum, isEnumMetadata, detectMetadataKind } from '../utils/validation.js';

describe('Enum Units - Basic Registration', () => {
  // Test enum definitions
  enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3
  }

  enum Priority {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    CRITICAL = 'critical'
  }

  it('T010: should validate basic enum structure', () => {
    expect(validateEnum(LogLevel)).toBe(true);
    expect(validateEnum(Priority)).toBe(true);
  });

  it('T010: should reject non-enum values', () => {
    expect(validateEnum(null)).toBe(false);
    expect(validateEnum(undefined)).toBe(false);
    expect(validateEnum(123)).toBe(false);
    expect(validateEnum('string')).toBe(false);
    expect(validateEnum({})).toBe(false);
    expect(validateEnum([])).toBe(false);
  });
});

describe('Enum Units - Numeric Enums (T011)', () => {
  enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3
  }

  it('T011: should validate numeric enum', () => {
    expect(validateEnum(LogLevel)).toBe(true);
  });

  it('T011: should create metadata with enum as type field', () => {
    const metadata: TypedMetadata<typeof LogLevel> = {
      name: 'LogLevel',
      type: LogLevel
    };

    expect(metadata.type).toBe(LogLevel);
    expect(metadata.name).toBe('LogLevel');
  });

  it('T011: should access enum members from metadata type', () => {
    const metadata: TypedMetadata<typeof LogLevel> = {
      name: 'LogLevel',
      type: LogLevel
    };

    expect(metadata.type.DEBUG).toBe(0);
    expect(metadata.type.INFO).toBe(1);
    expect(metadata.type.WARN).toBe(2);
    expect(metadata.type.ERROR).toBe(3);
  });
});

describe('Enum Units - String Enums (T012)', () => {
  enum Priority {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    CRITICAL = 'critical'
  }

  it('T012: should validate string enum', () => {
    expect(validateEnum(Priority)).toBe(true);
  });

  it('T012: should create metadata with string enum as type field', () => {
    const metadata: TypedMetadata<typeof Priority> = {
      name: 'Priority',
      type: Priority
    };

    expect(metadata.type).toBe(Priority);
    expect(metadata.name).toBe('Priority');
  });

  it('T012: should access string enum members from metadata type', () => {
    const metadata: TypedMetadata<typeof Priority> = {
      name: 'Priority',
      type: Priority
    };

    expect(metadata.type.LOW).toBe('low');
    expect(metadata.type.MEDIUM).toBe('medium');
    expect(metadata.type.HIGH).toBe('high');
    expect(metadata.type.CRITICAL).toBe('critical');
  });
});

describe('Enum Units - Mixed Enum Rejection (T013)', () => {
  enum MixedEnum {
    A = 0,
    B = 'string'
  }

  it('T013: should reject mixed enum with clear error message', () => {
    expect(() => validateEnum(MixedEnum)).toThrow(
      'Mixed enums (with both numeric and string members) are not supported'
    );
  });

  it('T013: should provide helpful error message', () => {
    expect(() => validateEnum(MixedEnum)).toThrow(
      'Please use either numeric or string values consistently'
    );
  });
});

describe('Enum Units - Empty Enums (T014)', () => {
  it('T014: should reject completely empty objects', () => {
    const emptyObj = {};
    expect(validateEnum(emptyObj)).toBe(false);
  });

  it('T014: should handle TypeScript empty enum edge case', () => {
    enum EmptyEnum {}

    // TypeScript compiles empty enum to empty object at runtime
    // We reject empty objects as they're not valid enums
    expect(validateEnum(EmptyEnum)).toBe(false);
  });
});

describe('Enum Units - Metadata Introspection (T015)', () => {
  enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3
  }

  enum Priority {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high'
  }

  it('T015: should identify enum metadata with type guard', () => {
    const enumMetadata: TypedMetadata<typeof LogLevel> = {
      name: 'LogLevel',
      type: LogLevel
    };

    expect(isEnumMetadata(enumMetadata)).toBe(true);
  });

  it('T015: should reject non-enum metadata', () => {
    const primitiveMetadata = {
      name: 'Celsius',
      type: 'number'
    };

    const classMetadata = {
      name: 'Temperature',
      type: class {}
    };

    expect(isEnumMetadata(primitiveMetadata)).toBe(false);
    expect(isEnumMetadata(classMetadata)).toBe(false);
    expect(isEnumMetadata(null)).toBe(false);
    expect(isEnumMetadata(undefined)).toBe(false);
  });

  it('T015: should access enum value directly from metadata type field', () => {
    const metadata: TypedMetadata<typeof LogLevel> = {
      name: 'LogLevel',
      type: LogLevel
    };

    expect(metadata.type.DEBUG).toBe(0);
    expect(metadata.type.INFO).toBe(1);
    expect(metadata.type === LogLevel).toBe(true);
  });

  it('T015: should detect metadata kind for enums', () => {
    const numericMetadata: TypedMetadata<typeof LogLevel> = {
      name: 'LogLevel',
      type: LogLevel
    };

    const stringMetadata: TypedMetadata<typeof Priority> = {
      name: 'Priority',
      type: Priority
    };

    expect(detectMetadataKind(numericMetadata)).toBe('enum');
    expect(detectMetadataKind(stringMetadata)).toBe('enum');
  });

  it('T015: should detect primitive metadata kind', () => {
    const primitiveMetadata = { name: 'Celsius', type: 'number' };
    expect(detectMetadataKind(primitiveMetadata)).toBe('primitive');
  });
});
