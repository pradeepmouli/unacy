/**
 * Shared metadata definitions for test files
 */
import type { TypedMetadata } from '../types.js';

// Temperature units
export const CelsiusMetadata = {
  name: 'Celsius' as const,
  type: 'number' as const
} satisfies TypedMetadata<number>;

export const FahrenheitMetadata = {
  name: 'Fahrenheit' as const,
  type: 'number' as const
} satisfies TypedMetadata<number>;

export const KelvinMetadata = {
  name: 'Kelvin' as const,
  type: 'number' as const
} satisfies TypedMetadata<number>;

// Distance units
export const MetersMetadata = {
  name: 'meters' as const,
  type: 'number' as const
} satisfies TypedMetadata<number>;

export const KilometersMetadata = {
  name: 'kilometers' as const,
  type: 'number' as const
} satisfies TypedMetadata<number>;

export const MilesMetadata = {
  name: 'miles' as const,
  type: 'number' as const
} satisfies TypedMetadata<number>;

export const FeetMetadata = {
  name: 'feet' as const,
  type: 'number' as const
} satisfies TypedMetadata<number>;

// Generic test units
export const AMetadata = {
  name: 'A' as const,
  type: 'number' as const
} satisfies TypedMetadata<number>;

export const BMetadata = {
  name: 'B' as const,
  type: 'number' as const
} satisfies TypedMetadata<number>;

export const CMetadata = {
  name: 'C' as const,
  type: 'number' as const
} satisfies TypedMetadata<number>;

export const DMetadata = {
  name: 'D' as const,
  type: 'number' as const
} satisfies TypedMetadata<number>;
