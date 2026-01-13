import { describe, it, expect } from 'vitest';
import { UnacyError, CycleError, MaxDepthError, ConversionError, ParseError } from '../errors.js';

describe('UnacyError', () => {
  it('creates error with message', () => {
    const error = new UnacyError('Test error message');
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(UnacyError);
    expect(error.message).toBe('Test error message');
    expect(error.name).toBe('UnacyError');
  });

  it('includes stack trace', () => {
    const error = new UnacyError('Test error');
    expect(error.stack).toBeDefined();
  });
});

describe('CycleError', () => {
  it('creates error with cycle path', () => {
    const path = ['A', 'B', 'C', 'A'];
    const error = new CycleError(path);

    expect(error).toBeInstanceOf(UnacyError);
    expect(error.message).toContain('Cycle detected');
    expect(error.message).toContain('A → B → C → A');
    expect(error.name).toBe('CycleError');
    expect(error.path).toEqual(path);
  });

  it('formats path with different unit types', () => {
    const path = ['meters', 'kilometers', 'miles', 'meters'];
    const error = new CycleError(path);

    expect(error.message).toContain('meters → kilometers → miles → meters');
  });
});

describe('MaxDepthError', () => {
  it('creates error with from, to, and max depth', () => {
    const error = new MaxDepthError('meters', 'parsecs', 5);

    expect(error).toBeInstanceOf(UnacyError);
    expect(error.message).toContain('Maximum conversion depth');
    expect(error.message).toContain('meters');
    expect(error.message).toContain('parsecs');
    expect(error.message).toContain('5');
    expect(error.name).toBe('MaxDepthError');
    expect(error.from).toBe('meters');
    expect(error.to).toBe('parsecs');
    expect(error.maxDepth).toBe(5);
  });

  it('provides helpful message', () => {
    const error = new MaxDepthError('A', 'Z', 3);

    expect(error.message).toContain('exceeded');
    expect(error.message).toContain('A');
    expect(error.message).toContain('Z');
  });
});

describe('ConversionError', () => {
  it('creates error with from and to units', () => {
    const error = new ConversionError('Celsius', 'Kelvin');

    expect(error).toBeInstanceOf(UnacyError);
    expect(error.message).toContain('Cannot convert');
    expect(error.message).toContain('Celsius');
    expect(error.message).toContain('Kelvin');
    expect(error.name).toBe('ConversionError');
    expect(error.from).toBe('Celsius');
    expect(error.to).toBe('Kelvin');
  });

  it('accepts optional reason', () => {
    const error = new ConversionError('A', 'B', 'No path exists');

    expect(error.message).toContain('Cannot convert');
    expect(error.message).toContain('No path exists');
  });
});

describe('ParseError', () => {
  it('creates error with format, input, and reason', () => {
    const error = new ParseError('ISO8601', 'invalid-date', 'Invalid format');

    expect(error).toBeInstanceOf(UnacyError);
    expect(error.message).toContain('Cannot parse');
    expect(error.message).toContain('ISO8601');
    expect(error.message).toContain('invalid-date');
    expect(error.message).toContain('Invalid format');
    expect(error.name).toBe('ParseError');
    expect(error.format).toBe('ISO8601');
    expect(error.input).toBe('invalid-date');
    expect(error.reason).toBe('Invalid format');
  });

  it('truncates long input values', () => {
    const longInput = 'a'.repeat(100);
    const error = new ParseError('HexColor', longInput, 'Too long');

    expect(error.message.length).toBeLessThan(200);
    expect(error.message).toContain('...');
  });

  it('handles empty input', () => {
    const error = new ParseError('Number', '', 'Empty string');

    expect(error.message).toContain('""');
  });
});
