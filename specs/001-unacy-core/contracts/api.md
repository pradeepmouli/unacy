# API Contracts: Unacy Core Conversion Library

**Feature**: 001-unacy-core  
**Phase**: 1 - API Contract Definition  
**Date**: 2026-01-06

## Overview

This document defines the public API surface for the Unacy Core library using TypeScript type definitions. All contracts are compile-time types with documented runtime behavior where applicable.

---

## Type Contracts

### Core Type Brands

```typescript
/**
 * @file types.ts
 * Core type branding utilities for unit and format safety
 */

import type { Tagged } from 'type-fest';

/**
 * Brand a value with a unit identifier for compile-time unit safety.
 * 
 * @template T - Base type (e.g., number, bigint)
 * @template U - Unit identifier (e.g., 'Celsius', 'meters')
 * 
 * @example
 * ```typescript
 * type Celsius = WithUnits<number, 'Celsius'>;
 * const temp: Celsius = 25 as Celsius;
 * ```
 */
export type WithUnits<T, U extends PropertyKey> = Tagged<T, 'Units', U>;

/**
 * Brand a value with a format identifier for compile-time format safety.
 * 
 * @template T - Base type (e.g., Date, number, string)
 * @template F - Format identifier (e.g., 'ISO8601', 'UnixTimestamp')
 * 
 * @example
 * ```typescript
 * type ISO8601 = WithFormat<Date, 'ISO8601'>;
 * const date: ISO8601 = new Date() as ISO8601;
 * ```
 */
export type WithFormat<T, F extends string> = Tagged<T, 'Format', F>;
```

---

## Converter Contracts

```typescript
/**
 * @file converters.ts
 * Type-safe converter function signatures
 */

import type { WithUnits } from './types';

/**
 * Unidirectional converter from one unit to another.
 * 
 * @template TInput - Source unit-tagged type
 * @template TOutput - Destination unit-tagged type
 * 
 * @param input - Value tagged with source unit
 * @returns Value tagged with destination unit
 * 
 * @remarks
 * - Must be a pure function (no side effects)
 * - Should be deterministic (same input → same output)
 * - Document precision loss if applicable
 * 
 * @example
 * ```typescript
 * const c2f: Converter<Celsius, Fahrenheit> = (c) => 
 *   ((c * 9/5) + 32) as Fahrenheit;
 * ```
 */
export type Converter<
  TInput extends WithUnits<unknown, PropertyKey>,
  TOutput extends WithUnits<unknown, PropertyKey>
> = (input: TInput) => TOutput;

/**
 * Bidirectional converter with forward and reverse transformations.
 * 
 * @template TInput - First unit type
 * @template TOutput - Second unit type
 * 
 * @property to - Forward converter (TInput → TOutput)
 * @property from - Reverse converter (TOutput → TInput)
 * 
 * @remarks
 * - Round-trip should preserve value: `from(to(x)) ≈ x`
 * - Precision tolerance depends on conversion math
 * 
 * @example
 * ```typescript
 * const mKm: BidirectionalConverter<Meters, Kilometers> = {
 *   to: (m) => (m / 1000) as Kilometers,
 *   from: (km) => (km * 1000) as Meters
 * };
 * ```
 */
export type BidirectionalConverter<
  TInput extends WithUnits<unknown, PropertyKey>,
  TOutput extends WithUnits<unknown, PropertyKey>
> = {
  to: Converter<TInput, TOutput>;
  from: Converter<TOutput, TInput>;
};
```

---

## Formatter/Parser Contracts

```typescript
/**
 * @file formatters.ts
 * Type-safe formatter and parser function signatures
 */

import type { WithFormat } from './types';

/**
 * Convert a format-tagged value to a string representation.
 * 
 * @template TInput - Format-tagged type
 * 
 * @param input - Value tagged with format
 * @returns String representation (loses format tag)
 * 
 * @remarks
 * - Output must be parseable by corresponding Parser
 * - Should produce human-readable or machine-parseable output
 * 
 * @example
 * ```typescript
 * const formatISO: Formatter<ISO8601Date> = (date) => date.toISOString();
 * ```
 */
export type Formatter<TInput extends WithFormat<unknown, string>> = (
  input: TInput
) => string;

/**
 * Parse a string into a format-tagged value with validation.
 * 
 * @template TOutput - Format-tagged type to produce
 * 
 * @param input - Plain string to parse
 * @returns Validated format-tagged value
 * @throws {ParseError} If input is invalid
 * 
 * @remarks
 * - MUST validate input before tagging
 * - MUST NOT return invalid tagged values
 * - Should use Zod or similar for schema validation
 * 
 * @example
 * ```typescript
 * const parseISO: Parser<ISO8601Date> = (input) => {
 *   const date = new Date(input);
 *   if (isNaN(date.getTime())) throw new ParseError('Invalid ISO8601');
 *   return date as ISO8601Date;
 * };
 * ```
 */
export type Parser<TOutput extends WithFormat<unknown, string>> = (
  input: string
) => TOutput;

/**
 * Paired formatter and parser for round-trip transformations.
 * 
 * @template T - Format-tagged type
 * 
 * @property format - Converts tagged value → string
 * @property parse - Converts string → tagged value
 * 
 * @remarks
 * - Round-trip must succeed: `parse(format(x)) ≡ x`
 * - Parser must reject invalid strings with clear errors
 * 
 * @example
 * ```typescript
 * const iso8601: FormatterParser<ISO8601Date> = {
 *   format: (d) => d.toISOString(),
 *   parse: (s) => new Date(s) as ISO8601Date
 * };
 * ```
 */
export type FormatterParser<T extends WithFormat<unknown, string>> = {
  format: Formatter<T>;
  parse: Parser<T>;
};
```

---

## Registry Contract

```typescript
/**
 * @file registry.ts
 * Converter registry with auto-composition via BFS
 */

import type { WithUnits } from './types';
import type { Converter, BidirectionalConverter } from './converters';

/**
 * Registry for managing and composing unit converters.
 * 
 * @template Units - Union of all registered unit identifiers
 * 
 * @remarks
 * - Immutable: all methods return new registry instances
 * - Auto-composes multi-hop conversions via BFS shortest path
 * - Detects cycles and enforces max path depth (5 hops)
 * - Caches composed converters for performance
 * 
 * @example
 * ```typescript
 * const registry = createRegistry<'m' | 'km' | 'mi'>()
 *   .register('m', 'km', m => (m / 1000) as Kilometers)
 *   .register('km', 'mi', km => (km * 0.621371) as Miles);
 * 
 * const meters = 5000 as Meters;
 * const miles = registry.convert(meters).to('mi'); // Auto-composes: m→km→mi
 * ```
 */
export interface ConverterRegistry<Units extends PropertyKey> {
  /**
   * Register a unidirectional converter.
   * 
   * @template From - Source unit (must be in Units union)
   * @template To - Destination unit (must be in Units union, excluding From)
   * 
   * @param from - Source unit identifier
   * @param to - Destination unit identifier
   * @param converter - Converter function
   * @returns New registry with converter registered
   * 
   * @remarks
   * - Duplicate registration overwrites previous converter
   * - Cannot register From → From (identity)
   * - Enables auto-composition with other converters
   */
  register<From extends Units, To extends Exclude<Units, From>>(
    from: From,
    to: To,
    converter: Converter<WithUnits<unknown, From>, WithUnits<unknown, To>>
  ): ConverterRegistry<Units>;

  /**
   * Register a bidirectional converter.
   * 
   * @template From - First unit
   * @template To - Second unit
   * 
   * @param from - First unit identifier
   * @param to - Second unit identifier
   * @param converter - Bidirectional converter with to/from
   * @returns New registry with both directions registered
   * 
   * @remarks
   * - Equivalent to two register() calls (From→To and To→From)
   * - Ensures round-trip conversions are consistent
   */
  registerBidirectional<From extends Units, To extends Exclude<Units, From>>(
    from: From,
    to: To,
    converter: BidirectionalConverter<
      WithUnits<unknown, From>,
      WithUnits<unknown, To>
    >
  ): ConverterRegistry<Units>;

  /**
   * Get a converter (direct or auto-composed).
   * 
   * @template From - Source unit
   * @template To - Destination unit
   * 
   * @param from - Source unit identifier
   * @param to - Destination unit identifier
   * @returns Converter function or undefined if no path exists
   * @throws {CycleError} If conversion path contains a cycle
   * @throws {MaxDepthError} If path exceeds 5 hops
   * 
   * @remarks
   * - O(1) for direct conversions (cached in graph)
   * - O(V+E) BFS for multi-hop (cached after first lookup)
   * - Prefers shortest path to minimize precision loss
   */
  getConverter<From extends Units, To extends Exclude<Units, From>>(
    from: From,
    to: To
  ): Converter<WithUnits<unknown, From>, WithUnits<unknown, To>> | undefined;

  /**
   * Fluent API for type-safe conversions.
   * 
   * @template From - Source unit of the value
   * 
   * @param value - Value tagged with source unit
   * @returns Conversion builder with to() method
   * 
   * @example
   * ```typescript
   * const meters = 5000 as Meters;
   * const km = registry.convert(meters).to('km');
   * const mi = registry.convert(meters).to('mi'); // Auto-composes
   * ```
   */
  convert<From extends Units>(
    value: WithUnits<unknown, From>
  ): {
    /**
     * Convert to destination unit.
     * 
     * @template To - Destination unit
     * @param unit - Destination unit identifier
     * @returns Converted value tagged with destination unit
     * @throws {ConversionError} If no path exists
     */
    to<To extends Exclude<Units, From>>(unit: To): WithUnits<unknown, To>;
  };
}

/**
 * Create a new empty converter registry.
 * 
 * @template Units - Union of unit identifiers to support
 * @returns Empty registry ready for converter registration
 * 
 * @example
 * ```typescript
 * const registry = createRegistry<'Celsius' | 'Fahrenheit' | 'Kelvin'>();
 * ```
 */
export function createRegistry<Units extends PropertyKey>(): ConverterRegistry<Units>;
```

---

## Error Contracts

```typescript
/**
 * @file errors.ts
 * Error types for conversion and parsing failures
 */

/**
 * Base error for all Unacy-related errors.
 */
export class UnacyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UnacyError';
  }
}

/**
 * Thrown when a conversion path contains a cycle.
 * 
 * @example
 * ```typescript
 * // If A→B→C→A cycle is detected:
 * throw new CycleError(['A', 'B', 'C', 'A']);
 * ```
 */
export class CycleError extends UnacyError {
  constructor(public path: PropertyKey[]) {
    super(`Cycle detected in conversion path: ${path.join(' → ')}`);
    this.name = 'CycleError';
  }
}

/**
 * Thrown when conversion path exceeds max depth (5 hops).
 */
export class MaxDepthError extends UnacyError {
  constructor(public from: PropertyKey, public to: PropertyKey) {
    super(`No conversion path found from ${String(from)} to ${String(to)} within max depth`);
    this.name = 'MaxDepthError';
  }
}

/**
 * Thrown when conversion fails or no path exists.
 */
export class ConversionError extends UnacyError {
  constructor(public from: PropertyKey, public to: PropertyKey, reason?: string) {
    super(`Cannot convert from ${String(from)} to ${String(to)}${reason ? `: ${reason}` : ''}`);
    this.name = 'ConversionError';
  }
}

/**
 * Thrown when parsing a string into a format-tagged value fails.
 */
export class ParseError extends UnacyError {
  constructor(public format: string, public input: string, reason?: string) {
    super(`Cannot parse "${input}" as ${format}${reason ? `: ${reason}` : ''}`);
    this.name = 'ParseError';
  }
}
```

---

## Public API Surface

```typescript
/**
 * @file index.ts
 * Main entry point exporting public API
 */

// Type brands
export type { WithUnits, WithFormat } from './types';

// Converter types
export type { Converter, BidirectionalConverter } from './converters';

// Formatter/Parser types
export type { Formatter, Parser, FormatterParser } from './formatters';

// Registry
export type { ConverterRegistry } from './registry';
export { createRegistry } from './registry';

// Errors
export {
  UnacyError,
  CycleError,
  MaxDepthError,
  ConversionError,
  ParseError
} from './errors';
```

---

## API Guarantees

| Contract | Compile-Time Guarantee | Runtime Guarantee |
|----------|------------------------|-------------------|
| `WithUnits<T, U>` | Unit type mismatch rejected | No runtime overhead (phantom type) |
| `WithFormat<T, F>` | Format type mismatch rejected | No runtime overhead (phantom type) |
| `Converter<In, Out>` | Input/output type safety | Deterministic pure function |
| `ConverterRegistry` | Unit membership enforced | BFS shortest path, cycle detection |
| `Parser<Out>` | Output format type enforced | Throws `ParseError` on invalid input |
| `createRegistry()` | Returns typed registry | Empty graph, immutable updates |

---

**Contracts Complete**: All public API types, interfaces, and error classes defined. Ready for quickstart documentation (Phase 1 completion).
