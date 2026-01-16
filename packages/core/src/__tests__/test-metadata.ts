/**
 * Shared metadata definitions for test files
 */
import type { BaseMetadata } from '../types.js';

// Temperature units
export const CelsiusMetadata = {
  name: 'Celsius' as const,
  symbol: '°C'
} satisfies BaseMetadata;

export const FahrenheitMetadata = {
  name: 'Fahrenheit' as const,
  symbol: '°F'
} satisfies BaseMetadata;

export const KelvinMetadata = {
  name: 'Kelvin' as const,
  symbol: 'K'
} satisfies BaseMetadata;

// Distance units
export const MetersMetadata = {
  name: 'meters' as const,
  symbol: 'm'
} satisfies BaseMetadata;

export const KilometersMetadata = {
  name: 'kilometers' as const,
  symbol: 'km'
} satisfies BaseMetadata;

export const MilesMetadata = {
  name: 'miles' as const,
  symbol: 'mi'
} satisfies BaseMetadata;

export const FeetMetadata = {
  name: 'feet' as const,
  symbol: 'ft'
} satisfies BaseMetadata;

// Generic test units
export const AMetadata = {
  name: 'A' as const
} satisfies BaseMetadata;

export const BMetadata = {
  name: 'B' as const
} satisfies BaseMetadata;

export const CMetadata = {
  name: 'C' as const
} satisfies BaseMetadata;

export const DMetadata = {
  name: 'D' as const
} satisfies BaseMetadata;
