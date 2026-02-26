/**
 * Demo of non-primitive type support
 * This file demonstrates:
 * 1. Enum units (numeric and string enums)
 * 2. Class units (constructors as type identity)
 * 3. Record units (object shape schemas)
 * 4. Tuple units (ordered element schemas)
 * 5. Runtime type guards and introspection
 */

import { createRegistry } from './src/index.js';
import type { WithTypedUnits, InferFromRecordSchema, InferFromTupleSchema } from './src/types.js';
import {
  validateEnum,
  validateClass,
  validateRecordSchema,
  validateTupleSchema,
  isEnumMetadata,
  isClassMetadata,
  isRecordMetadata,
  isTupleMetadata,
  detectMetadataKind
} from './src/index.js';

console.log('=== Non-Primitive Type Support Demo ===\n');

// ===== Part 1: Enum Units =====
console.log('Part 1: Enum Units\n');

// Numeric enum
enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

// String enum
enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE'
}

// Metadata: `type` is the enum object itself
const LogLevelMeta = { name: 'LogLevel', type: LogLevel } as const;
const HttpMethodMeta = { name: 'HttpMethod', type: HttpMethod } as const;

// eslint-disable-next-line no-unused-vars -- illustrative
type LogLevelUnit = WithTypedUnits<typeof LogLevelMeta>;
// eslint-disable-next-line no-unused-vars -- illustrative
type HttpMethodUnit = WithTypedUnits<typeof HttpMethodMeta>;

console.log('Numeric enum validation:', validateEnum(LogLevel)); // true
console.log('String enum validation:', validateEnum(HttpMethod)); // true
console.log('LogLevel metadata kind:', detectMetadataKind(LogLevelMeta)); // 'enum'

// Register enum units in a registry
const enumRegistry = createRegistry().register(LogLevelMeta).register(HttpMethodMeta);

const level = enumRegistry.LogLevel(LogLevel.WARN);
console.log('Branded LogLevel value:', level); // 2
console.log('Is enum metadata?', isEnumMetadata(LogLevelMeta)); // true

// ===== Part 2: Class Units =====
console.log('\nPart 2: Class Units\n');

class Temperature {
  constructor(
    public value: number,
    public scale: string
  ) {}

  toString(): string {
    return `${this.value}°${this.scale}`;
  }
}

class Measurement {
  constructor(
    public amount: number,
    public unit: string,
    public timestamp: Date = new Date()
  ) {}
}

// Metadata: `type` is the class constructor itself
const TemperatureMeta = { name: 'Temperature', type: Temperature } as const;
const MeasurementMeta = { name: 'Measurement', type: Measurement } as const;

// eslint-disable-next-line no-unused-vars -- illustrative
type TemperatureUnit = WithTypedUnits<typeof TemperatureMeta>;
// eslint-disable-next-line no-unused-vars -- illustrative
type MeasurementUnit = WithTypedUnits<typeof MeasurementMeta>;

console.log('Class validation:', validateClass(Temperature)); // true
console.log('Temperature metadata kind:', detectMetadataKind(TemperatureMeta)); // 'class'
console.log('Is class metadata?', isClassMetadata(TemperatureMeta)); // true

// Register class units
const classRegistry = createRegistry().register(TemperatureMeta).register(MeasurementMeta);

const temp = classRegistry.Temperature(25, 'C');
console.log('Branded Temperature:', temp); // Temperature { value: 25, scale: 'C' }

// ===== Part 3: Record Units =====
console.log('\nPart 3: Record Units\n');

// Simple record schema
const PointSchema = { x: 'number', y: 'number' } as const;
const PointMeta = { name: 'Point', type: PointSchema } as const;

// Nested record schema
const LineSchema = {
  start: { x: 'number', y: 'number' },
  end: { x: 'number', y: 'number' }
} as const;
const LineMeta = { name: 'Line', type: LineSchema } as const;

// Complex nested schema
const AddressSchema = {
  street: 'string',
  city: 'string',
  zip: 'string',
  coords: { lat: 'number', lng: 'number' }
} as const;
const AddressMeta = { name: 'Address', type: AddressSchema } as const;

// Type inference from schemas
// eslint-disable-next-line no-unused-vars -- illustrative
type Point = InferFromRecordSchema<typeof PointSchema>;
// Inferred: { x: number; y: number }

// eslint-disable-next-line no-unused-vars -- illustrative
type Address = InferFromRecordSchema<typeof AddressSchema>;
// Inferred: { street: string; city: string; zip: string; coords: { lat: number; lng: number } }

console.log('Record schema validation:', validateRecordSchema(PointSchema)); // true
console.log('Nested schema validation:', validateRecordSchema(LineSchema)); // true
console.log('Point metadata kind:', detectMetadataKind(PointMeta)); // 'record'
console.log('Is record metadata?', isRecordMetadata(PointMeta)); // true
console.log('Is NOT enum metadata?', isEnumMetadata(PointMeta)); // false (disambiguated)

// Register record units
const recordRegistry = createRegistry()
  .register(PointMeta)
  .register(LineMeta)
  .register(AddressMeta);

const point = recordRegistry.Point({ x: 10, y: 20 });
console.log('Branded Point:', point); // { x: 10, y: 20 }

const address = recordRegistry.Address({
  street: '123 Main St',
  city: 'Springfield',
  zip: '62701',
  coords: { lat: 39.7817, lng: -89.6501 }
});
console.log('Branded Address:', address);

// ===== Part 4: Tuple Units =====
console.log('\nPart 4: Tuple Units\n');

// Simple tuple: RGB color
const RGBSchema = ['number', 'number', 'number'] as const;
const RGBMeta = { name: 'RGB', type: RGBSchema } as const;

// Tuple with optional element
const NameSchema = ['string', 'string', 'string?'] as const;
const NameMeta = { name: 'FullName', type: NameSchema } as const;

// Tuple with rest element
const HeaderSchema = ['string', '...string'] as const;
const _HeaderMeta = { name: 'Header', type: HeaderSchema } as const;

// Type inference from tuple schemas
// eslint-disable-next-line no-unused-vars -- illustrative
type RGB = InferFromTupleSchema<typeof RGBSchema>;
// Inferred: [number, number, number]

// eslint-disable-next-line no-unused-vars -- illustrative
type FullName = InferFromTupleSchema<typeof NameSchema>;
// Inferred: [string, string, string | undefined]

console.log('Tuple schema validation:', validateTupleSchema(RGBSchema)); // true
console.log('Optional element validation:', validateTupleSchema(NameSchema)); // true
console.log('Rest element validation:', validateTupleSchema(HeaderSchema)); // true
console.log('RGB metadata kind:', detectMetadataKind(RGBMeta)); // 'tuple'
console.log('Is tuple metadata?', isTupleMetadata(RGBMeta)); // true

// Register tuple units
const tupleRegistry = createRegistry().register(RGBMeta).register(NameMeta);

const red = tupleRegistry.RGB(255, 0, 0);
console.log('Branded RGB:', red); // [255, 0, 0]

// ===== Part 5: Non-Primitive Conversions =====
console.log('\nPart 5: Non-Primitive Conversions\n');

// --- Record-to-Record: Cartesian (x, y) ↔ Polar (r, θ) ---

const PolarSchema = { r: 'number', theta: 'number' } as const;
const PolarMeta = { name: 'Polar', type: PolarSchema } as const;

const coordRegistry = createRegistry()
  .register(PointMeta, PolarMeta, (p) => ({
    r: Math.sqrt(p.x * p.x + p.y * p.y),
    theta: Math.atan2(p.y, p.x)
  }))
  .register(PolarMeta, PointMeta, (p) => ({
    x: p.r * Math.cos(p.theta),
    y: p.r * Math.sin(p.theta)
  }));

const cartesian = coordRegistry.Point({ x: 3, y: 4 });
const polar = coordRegistry.Point.to.Polar(cartesian);
console.log('Cartesian (3, 4) → Polar:', polar); // { r: 5, theta: 0.9273 }

const backToXY = coordRegistry.Polar.to.Point(polar);
console.log('Polar → Cartesian:', backToXY); // { x: 3, y: 4 } (approx)

// --- Tuple-to-Tuple: RGB ↔ HSL ---

const HSLSchema = ['number', 'number', 'number'] as const;
const HSLMeta = { name: 'HSL', type: HSLSchema } as const;

const colorRegistry = createRegistry()
  .register(RGBMeta, HSLMeta, (rgb) => {
    const r = rgb[0] / 255;
    const g = rgb[1] / 255;
    const b = rgb[2] / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;
    if (max === min) return [0, 0, Math.round(l * 100)] as [number, number, number];
    const d = max - min;
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    let h = 0;
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
    return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)] as [
      number,
      number,
      number
    ];
  })
  .register(HSLMeta, RGBMeta, (hsl) => {
    const h = hsl[0] / 360;
    const s = hsl[1] / 100;
    const l = hsl[2] / 100;
    if (s === 0) {
      const v = Math.round(l * 255);
      return [v, v, v] as [number, number, number];
    }
    const hue2rgb = (p: number, q: number, t: number): number => {
      const tt = t < 0 ? t + 1 : t > 1 ? t - 1 : t;
      if (tt < 1 / 6) return p + (q - p) * 6 * tt;
      if (tt < 1 / 2) return q;
      if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    return [
      Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
      Math.round(hue2rgb(p, q, h) * 255),
      Math.round(hue2rgb(p, q, h - 1 / 3) * 255)
    ] as [number, number, number];
  });

const rgb = colorRegistry.RGB(255, 128, 0);
const hsl = colorRegistry.RGB.to.HSL(rgb);
console.log('RGB (255, 128, 0) → HSL:', hsl); // [30, 100, 50]

const backToRGB = colorRegistry.HSL.to.RGB(hsl);
console.log('HSL → RGB:', backToRGB); // [255, 128, 0] (approx)

// ===== Part 6: Mixed Registry =====
console.log('\nPart 6: Mixed Primitive and Non-Primitive Types\n');

const CelsiusMeta = { name: 'Celsius', type: 'number' } as const;
const FahrenheitMeta = { name: 'Fahrenheit', type: 'number' } as const;

// One registry can hold primitives and non-primitives together
const mixedRegistry = createRegistry()
  // Primitives with converters
  .register(CelsiusMeta, FahrenheitMeta, (c) => (c * 9) / 5 + 32)
  .register(FahrenheitMeta, CelsiusMeta, (f) => ((f - 32) * 5) / 9)
  // Non-primitives (standalone)
  .register(LogLevelMeta)
  .register(PointMeta)
  .register(RGBMeta);

console.log(
  'Celsius to Fahrenheit:',
  mixedRegistry.Celsius.to.Fahrenheit(mixedRegistry.Celsius(100))
); // 212
console.log('Mixed registry has enum:', mixedRegistry.LogLevel(LogLevel.ERROR)); // 3
console.log('Mixed registry has record:', mixedRegistry.Point({ x: 1, y: 2 })); // { x: 1, y: 2 }
console.log('Mixed registry has tuple:', mixedRegistry.RGB(0, 128, 255)[0]); // [0, 128, 255]

// ===== Part 6: Runtime Introspection =====
console.log('\nPart 6: Runtime Introspection\n');

const allMetas = [CelsiusMeta, LogLevelMeta, TemperatureMeta, PointMeta, RGBMeta];

for (const meta of allMetas) {
  const kind = detectMetadataKind(meta);
  console.log(`  ${meta.name}: ${kind}`);
}
// Output:
//   Celsius: primitive
//   LogLevel: enum
//   Temperature: class
//   Point: record
//   RGB: tuple

console.log('\n=== Demo Complete ===');
