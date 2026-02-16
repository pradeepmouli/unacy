/**
 * Tests for Class-Based Units (User Story 2)
 * Following TDD: These tests are written FIRST
 */

import { describe, it, expect } from 'vitest';
import type { TypedMetadata } from '../types.js';
import { validateClass, isClassMetadata, detectMetadataKind } from '../utils/validation.js';

// Test class definitions
class Temperature {
  constructor(
    public value: number,
    public scale: 'C' | 'F' | 'K'
  ) {}

  toCelsius(): number {
    switch (this.scale) {
      case 'C':
        return this.value;
      case 'F':
        return ((this.value - 32) * 5) / 9;
      case 'K':
        return this.value - 273.15;
    }
  }
}

class Measurement {
  constructor(public value: number) {}

  toString(): string {
    return `${this.value}`;
  }
}

class Distance extends Measurement {
  constructor(
    value: number,
    public unit: string
  ) {
    super(value);
  }

  toString(): string {
    return `${this.value} ${this.unit}`;
  }
}

class EmptyClass {}

describe('Class Units - Basic Registration (T022)', () => {
  it('T022: should validate basic class structure', () => {
    expect(validateClass(Temperature)).toBe(true);
    expect(validateClass(Distance)).toBe(true);
  });

  it('T022: should reject non-class values', () => {
    expect(validateClass(null)).toBe(false);
    expect(validateClass(undefined)).toBe(false);
    expect(validateClass(123)).toBe(false);
    expect(validateClass('string')).toBe(false);
    expect(validateClass({})).toBe(false);
    expect(validateClass([])).toBe(false);
  });
});

describe('Class Units - Constructor Parameters (T023)', () => {
  it('T023: should validate class with constructor parameters', () => {
    expect(validateClass(Temperature)).toBe(true);
  });

  it('T023: should create metadata with class as type field', () => {
    const metadata: TypedMetadata<typeof Temperature> = {
      name: 'Temperature',
      type: Temperature
    };

    expect(metadata.type).toBe(Temperature);
    expect(metadata.name).toBe('Temperature');
  });
});

describe('Class Units - Class Methods (T024)', () => {
  it('T024: should validate class with methods', () => {
    expect(validateClass(Temperature)).toBe(true);
  });

  it('T024: should access prototype methods from metadata type', () => {
    const metadata: TypedMetadata<typeof Temperature> = {
      name: 'Temperature',
      type: Temperature
    };

    // Verify prototype methods exist
    expect(typeof metadata.type.prototype.toCelsius).toBe('function');
  });

  it('T024: should create instances using metadata type', () => {
    const metadata: TypedMetadata<typeof Temperature> = {
      name: 'Temperature',
      type: Temperature
    };

    const instance = new metadata.type(100, 'C');
    expect(instance.toCelsius()).toBe(100);
  });
});

describe('Class Units - Class Inheritance (T025)', () => {
  it('T025: should validate derived class', () => {
    expect(validateClass(Distance)).toBe(true);
  });

  it('T025: should validate base class', () => {
    expect(validateClass(Measurement)).toBe(true);
  });

  it('T025: should create metadata with derived class', () => {
    const metadata: TypedMetadata<typeof Distance> = {
      name: 'Distance',
      type: Distance
    };

    expect(metadata.type).toBe(Distance);

    // Verify instanceof works
    const instance = new metadata.type(100, 'meters');
    expect(instance instanceof Measurement).toBe(true);
    expect(instance instanceof Distance).toBe(true);
  });

  it('T025: should preserve prototype chain', () => {
    const metadata: TypedMetadata<typeof Distance> = {
      name: 'Distance',
      type: Distance
    };

    const instance = new metadata.type(42, 'km');
    expect(instance.toString()).toBe('42 km');
    expect(instance.value).toBe(42);
  });
});

describe('Class Units - Empty Class (T026)', () => {
  it('T026: should validate empty class', () => {
    expect(validateClass(EmptyClass)).toBe(true);
  });

  it('T026: should create metadata with empty class', () => {
    const metadata: TypedMetadata<typeof EmptyClass> = {
      name: 'EmptyClass',
      type: EmptyClass
    };

    expect(metadata.type).toBe(EmptyClass);
    const instance = new metadata.type();
    expect(instance instanceof EmptyClass).toBe(true);
  });
});

describe('Class Units - Metadata Introspection (T027)', () => {
  it('T027: should identify class metadata with type guard', () => {
    const classMetadata: TypedMetadata<typeof Temperature> = {
      name: 'Temperature',
      type: Temperature
    };

    expect(isClassMetadata(classMetadata)).toBe(true);
  });

  it('T027: should reject non-class metadata', () => {
    const primitiveMetadata = {
      name: 'Celsius',
      type: 'number'
    };

    enum LogLevel {
      DEBUG = 0,
      INFO = 1
    }

    const enumMetadata = {
      name: 'LogLevel',
      type: LogLevel
    };

    expect(isClassMetadata(primitiveMetadata)).toBe(false);
    expect(isClassMetadata(enumMetadata)).toBe(false);
    expect(isClassMetadata(null)).toBe(false);
    expect(isClassMetadata(undefined)).toBe(false);
  });

  it('T027: should detect class metadata kind', () => {
    const classMetadata: TypedMetadata<typeof Temperature> = {
      name: 'Temperature',
      type: Temperature
    };

    expect(detectMetadataKind(classMetadata)).toBe('class');
  });

  it('T027: should access class constructor from metadata', () => {
    const metadata: TypedMetadata<typeof Temperature> = {
      name: 'Temperature',
      type: Temperature
    };

    expect(metadata.type === Temperature).toBe(true);
    expect(typeof metadata.type).toBe('function');
  });

  it('T027: should distinguish arrow functions from classes', () => {
    // Arrow functions don't have prototype property in ES6+
    const arrowFn = () => {};
    expect(validateClass(arrowFn)).toBe(false);

    // Regular functions DO have prototypes
    function regularFn() {}
    expect(validateClass(regularFn)).toBe(true);
  });
});
