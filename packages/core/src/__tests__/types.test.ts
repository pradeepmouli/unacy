import { describe, it, expect, expectTypeOf } from 'vitest';
import type { WithUnits, WithFormat } from '../types';

describe('WithUnits Type Safety', () => {
  type Celsius = WithUnits<number, 'Celsius'>;
  type Fahrenheit = WithUnits<number, 'Fahrenheit'>;
  type Meters = WithUnits<number, 'meters'>;

  it('allows assignment with explicit cast', () => {
    const temp: Celsius = 25 as Celsius;
    expect(temp).toBe(25);
  });

  it('preserves numeric operations at runtime', () => {
    const temp1: Celsius = 10 as Celsius;
    const temp2: Celsius = 20 as Celsius;

    // Runtime operations work normally
    expect((temp1 as number) + (temp2 as number)).toBe(30);
  });

  it('compile-time: prevents assignment without cast', () => {
    // @ts-expect-error - Cannot assign plain number to branded type
    const temp: Celsius = 25;
    expect(temp).toBe(25); // Runtime still works, but type error at compile time
  });

  it('compile-time: prevents mixing different unit types', () => {
    const temp: Celsius = 25 as Celsius;

    // @ts-expect-error - Cannot assign Celsius to Fahrenheit
    const fahrenheit: Fahrenheit = temp;

    expect(fahrenheit).toBe(temp); // Runtime value is same, but type mismatch
  });

  it('compile-time: different units are not compatible', () => {
    const distance: Meters = 100 as Meters;

    // @ts-expect-error - Cannot assign Meters to Celsius
    const temp: Celsius = distance;

    expect(temp).toBe(distance);
  });

  it('type inference: maintains branded type through variables', () => {
    const temp1: Celsius = 25 as Celsius;
    const temp2 = temp1; // Type should be inferred as Celsius

    expectTypeOf(temp2).toEqualTypeOf<Celsius>();
  });

  it('type inference: array of branded types', () => {
    const temps: Celsius[] = [10, 20, 30].map((n) => n as Celsius);

    expectTypeOf(temps).toEqualTypeOf<Celsius[]>();
    expect(temps).toHaveLength(3);
  });

  it('supports different base types', () => {
    type BigIntMeters = WithUnits<bigint, 'meters'>;
    type StringCurrency = WithUnits<string, 'USD'>;

    const distance: BigIntMeters = 1000n as BigIntMeters;
    const money: StringCurrency = '100.50' as StringCurrency;

    expectTypeOf(distance).toEqualTypeOf<BigIntMeters>();
    expectTypeOf(money).toEqualTypeOf<StringCurrency>();

    expect(distance).toBe(1000n);
    expect(money).toBe('100.50');
  });

  it('supports string literal as unit identifier', () => {
    type CustomUnit = WithUnits<number, 'CustomUnit'>;

    const value: CustomUnit = 42 as CustomUnit;

    expectTypeOf(value).toEqualTypeOf<CustomUnit>();
    expect(value).toBe(42);
  });
});

describe('WithFormat Type Safety', () => {
  type ISO8601 = WithFormat<Date, 'ISO8601'>;
  type UnixTimestamp = WithFormat<number, 'UnixTimestamp'>;
  type HexColor = WithFormat<string, 'HexColor'>;

  it('allows assignment with explicit cast', () => {
    const date: ISO8601 = new Date() as ISO8601;
    expect(date).toBeInstanceOf(Date);
  });

  it('compile-time: prevents assignment without cast', () => {
    const now = new Date();

    // @ts-expect-error - Cannot assign Date to branded ISO8601
    const date: ISO8601 = now;

    expect(date).toBe(now);
  });

  it('compile-time: prevents mixing different format types', () => {
    const timestamp: UnixTimestamp = Date.now() as UnixTimestamp;

    // @ts-expect-error - Cannot assign UnixTimestamp to HexColor
    const color: HexColor = timestamp;

    expect(color).toBe(timestamp);
  });

  it('compile-time: different formats of same base type are incompatible', () => {
    const date: ISO8601 = new Date() as ISO8601;

    // Both are Dates, and branded types are assignable to base types
    const plainDate: Date = date;

    expect(plainDate).toBe(date);
  });

  it('type inference: maintains branded type', () => {
    const color1: HexColor = '#FF5733' as HexColor;
    const color2 = color1;

    expectTypeOf(color2).toEqualTypeOf<HexColor>();
  });

  it('supports different base types with same format name', () => {
    // Same format name but different base types
    type StringFormat = WithFormat<string, 'Custom'>;
    type NumberFormat = WithFormat<number, 'Custom'>;

    const str: StringFormat = 'test' as StringFormat;
    const num: NumberFormat = 123 as NumberFormat;

    expectTypeOf(str).toEqualTypeOf<StringFormat>();
    expectTypeOf(num).toEqualTypeOf<NumberFormat>();

    // These should be different types
    expectTypeOf(str).not.toEqualTypeOf<NumberFormat>();
  });

  it('type inference: array of formatted values', () => {
    const colors: HexColor[] = ['#FF0000', '#00FF00', '#0000FF'].map((c) => c as HexColor);

    expectTypeOf(colors).toEqualTypeOf<HexColor[]>();
    expect(colors).toHaveLength(3);
  });

  it('supports complex format identifiers', () => {
    type ComplexFormat = WithFormat<string, 'ISO8601-Extended+TZ'>;

    const value: ComplexFormat = '2026-01-06T12:00:00.000+00:00' as ComplexFormat;

    expectTypeOf(value).toEqualTypeOf<ComplexFormat>();
    expect(value).toContain('T');
  });
});

describe('WithUnits and WithFormat Interaction', () => {
  type CelsiusNumber = WithUnits<number, 'Celsius'>;
  type ISO8601Date = WithFormat<Date, 'ISO8601'>;

  it('units and formats are independent type brands', () => {
    const temp: CelsiusNumber = 25 as CelsiusNumber;
    const date: ISO8601Date = new Date() as ISO8601Date;

    expectTypeOf(temp).toEqualTypeOf<CelsiusNumber>();
    expectTypeOf(date).toEqualTypeOf<ISO8601Date>();

    // Different brand systems
    expectTypeOf(temp).not.toEqualTypeOf<ISO8601Date>();
  });

  it('can apply both brands (theoretical, but should type-check)', () => {
    // This is possible but unusual - a value with both unit AND format brands
    type BrandedNumber = WithFormat<WithUnits<number, 'Celsius'>, 'Scientific'>;

    const value: BrandedNumber = 25 as any as BrandedNumber;

    expectTypeOf(value).toEqualTypeOf<BrandedNumber>();
  });
});
