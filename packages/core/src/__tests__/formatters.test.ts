import { describe, it, expect, expectTypeOf } from 'vitest';
import type { Formatter, Parser, FormatterParser } from '../formatters';
import type { WithFormat } from '../types';
import { ParseError } from '../errors';
import { z } from 'zod';

// Define test format types
type ISO8601 = WithFormat<Date, 'ISO8601'>;
type UnixTimestamp = WithFormat<number, 'UnixTimestamp'>;
type HexColor = WithFormat<string, 'HexColor'>;
type YYYYMMDD = WithFormat<string, 'YYYY-MM-DD'>;

describe('Formatter Type', () => {
  it('formatter converts tagged value to string', () => {
    const formatISO: Formatter<ISO8601> = (date) => date.toISOString();

    const now = new Date('2026-01-06T12:00:00.000Z') as ISO8601;
    const str = formatISO(now);

    expect(typeof str).toBe('string');
    expect(str).toBe('2026-01-06T12:00:00.000Z');
  });

  it('formatter maintains format identity through transformation', () => {
    const formatHex: Formatter<HexColor> = (color) => color.toUpperCase();

    const color: HexColor = '#ff5733' as HexColor;
    const formatted = formatHex(color);

    expect(formatted).toBe('#FF5733');
    expectTypeOf(formatted).toEqualTypeOf<string>();
  });

  it('formatter works with different base types', () => {
    const formatTimestamp: Formatter<UnixTimestamp> = (ts) => String(ts);

    const timestamp: UnixTimestamp = Date.now() as UnixTimestamp;
    const str = formatTimestamp(timestamp);

    expect(typeof str).toBe('string');
    expect(str).toMatch(/^\d+$/);
  });
});

describe('Parser Type', () => {
  it('parser converts string to tagged value with Zod validation', () => {
    const parseISO: Parser<ISO8601> = (input) => {
      const schema = z.string().datetime();
      const validated = schema.parse(input);
      return new Date(validated) as ISO8601;
    };

    const str = '2026-01-06T12:00:00.000Z';
    const date = parseISO(str);

    expectTypeOf(date).toEqualTypeOf<ISO8601>();
    expect(date).toBeInstanceOf(Date);
    expect(date.toISOString()).toBe(str);
  });

  it('invalid string input throws ParseError with context', () => {
    const parseHex: Parser<HexColor> = (input) => {
      const schema = z.string().regex(/^#[0-9A-Fa-f]{6}$/);
      try {
        return schema.parse(input) as HexColor;
      } catch {
        throw new ParseError('HexColor', input, 'Expected #RRGGBB format');
      }
    };

    expect(() => {
      parseHex('not-a-color');
    }).toThrow(ParseError);

    try {
      parseHex('invalid');
    } catch (err) {
      expect(err).toBeInstanceOf(ParseError);
      if (err instanceof ParseError) {
        expect(err.format).toBe('HexColor');
        expect(err.input).toBe('invalid');
        expect(err.reason).toBe('Expected #RRGGBB format');
      }
    }
  });

  it('parser rejects input before tagging (no invalid tagged values)', () => {
    const parsePositive: Parser<WithFormat<number, 'Positive'>> = (input) => {
      const schema = z
        .string()
        .transform((s) => parseFloat(s))
        .refine((n) => n > 0);
      try {
        return schema.parse(input) as WithFormat<number, 'Positive'>;
      } catch {
        throw new ParseError('Positive', input, 'Must be a positive number');
      }
    };

    expect(() => {
      parsePositive('-5');
    }).toThrow(ParseError);

    expect(() => {
      parsePositive('not-a-number');
    }).toThrow(ParseError);

    // Valid input should work
    const result = parsePositive('10');
    expect(result).toBe(10);
  });

  it('handles empty input', () => {
    const parseNonEmpty: Parser<WithFormat<string, 'NonEmpty'>> = (input) => {
      if (input === '') {
        throw new ParseError('NonEmpty', input, 'Cannot be empty');
      }
      return input as WithFormat<string, 'NonEmpty'>;
    };

    expect(() => {
      parseNonEmpty('');
    }).toThrow(ParseError);

    try {
      parseNonEmpty('');
    } catch (err) {
      if (err instanceof ParseError) {
        expect(err.message).toContain('""');
      }
    }
  });

  it('compile-time: wrong format type to parser causes error', () => {
    const parseISO: Parser<ISO8601> = (input) => {
      return new Date(input) as ISO8601;
    };

    const str = '2026-01-06T12:00:00.000Z';
    const date = parseISO(str);

    // @ts-expect-error - Cannot assign ISO8601 to HexColor
    const color: HexColor = date;

    expect(color).toBeDefined();
  });
});

describe('FormatterParser Type', () => {
  it('round-trip (format then parse) produces equivalent value', () => {
    const iso8601: FormatterParser<ISO8601> = {
      format: (date) => date.toISOString(),
      parse: (input) => {
        const schema = z.string().datetime();
        const validated = schema.parse(input);
        return new Date(validated) as ISO8601;
      }
    };

    const original = new Date('2026-01-06T12:00:00.000Z') as ISO8601;
    const formatted = iso8601.format(original);
    const parsed = iso8601.parse(formatted);

    expect(parsed.getTime()).toBe(original.getTime());
  });

  it('integration test: full formatter/parser pair for ISO8601 dates', () => {
    const iso8601: FormatterParser<ISO8601> = {
      format: (date) => date.toISOString(),
      parse: (input) => {
        const schema = z.string().datetime();
        try {
          const validated = schema.parse(input);
          return new Date(validated) as ISO8601;
        } catch {
          throw new ParseError('ISO8601', input, 'Invalid ISO8601 date format');
        }
      }
    };

    // Test formatting
    const date: ISO8601 = new Date('2026-01-06T12:34:56.789Z') as ISO8601;
    const str = iso8601.format(date);
    expect(str).toBe('2026-01-06T12:34:56.789Z');

    // Test parsing
    const parsed = iso8601.parse('2026-12-31T23:59:59.999Z');
    expect(parsed).toBeInstanceOf(Date);
    expect(parsed.toISOString()).toBe('2026-12-31T23:59:59.999Z');

    // Test round-trip
    const roundTrip = iso8601.parse(iso8601.format(date));
    expect(roundTrip.getTime()).toBe(date.getTime());

    // Test error handling
    expect(() => {
      iso8601.parse('invalid-date');
    }).toThrow(ParseError);
  });

  it('works with different format types', () => {
    const hexColor: FormatterParser<HexColor> = {
      format: (color) => color.toLowerCase(),
      parse: (input) => {
        const schema = z.string().regex(/^#[0-9a-fA-F]{6}$/);
        try {
          return schema.parse(input) as HexColor;
        } catch {
          throw new ParseError('HexColor', input, 'Expected #RRGGBB format');
        }
      }
    };

    const color: HexColor = '#FF5733' as HexColor;
    const formatted = hexColor.format(color);
    expect(formatted).toBe('#ff5733');

    const parsed = hexColor.parse('#00FF00');
    expectTypeOf(parsed).toEqualTypeOf<HexColor>();
    expect(parsed).toBe('#00FF00');

    // Round-trip with case normalization
    const original: HexColor = '#ABCDEF' as HexColor;
    const roundTrip = hexColor.parse(hexColor.format(original));
    expect(roundTrip.toLowerCase()).toBe(original.toLowerCase());
  });

  it('timestamp formatter/parser preserves value', () => {
    const unixTimestamp: FormatterParser<UnixTimestamp> = {
      format: (ts) => String(ts),
      parse: (input) => {
        const schema = z
          .string()
          .regex(/^\d+$/)
          .transform((s) => parseInt(s, 10));
        try {
          return schema.parse(input) as UnixTimestamp;
        } catch {
          throw new ParseError('UnixTimestamp', input, 'Expected Unix timestamp');
        }
      }
    };

    const timestamp: UnixTimestamp = Date.now() as UnixTimestamp;
    const str = unixTimestamp.format(timestamp);
    const parsed = unixTimestamp.parse(str);

    expect(parsed).toBe(timestamp);
  });
});

describe('Formatter/Parser Examples', () => {
  it('YYYY-MM-DD format with validation', () => {
    const yyyymmdd: FormatterParser<YYYYMMDD> = {
      format: (dateStr) => dateStr,
      parse: (input) => {
        const schema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
        try {
          const validated = schema.parse(input);
          // Additional validation: check if it's a valid date
          const parts = validated.split('-');
          const year = parseInt(parts[0]!, 10);
          const month = parseInt(parts[1]!, 10);
          const day = parseInt(parts[2]!, 10);
          const date = new Date(year, month - 1, day);
          if (
            date.getFullYear() !== year ||
            date.getMonth() !== month - 1 ||
            date.getDate() !== day
          ) {
            throw new Error('Invalid date');
          }
          return validated as YYYYMMDD;
        } catch {
          throw new ParseError('YYYY-MM-DD', input, 'Invalid date format');
        }
      }
    };

    // Valid dates
    expect(yyyymmdd.parse('2026-01-06')).toBe('2026-01-06');
    expect(yyyymmdd.parse('2026-12-31')).toBe('2026-12-31');

    // Invalid dates
    expect(() => yyyymmdd.parse('2026-13-01')).toThrow(ParseError); // Invalid month
    expect(() => yyyymmdd.parse('2026-02-30')).toThrow(ParseError); // Invalid day
    expect(() => yyyymmdd.parse('not-a-date')).toThrow(ParseError);
  });
});
