/**
 * Core type branding utilities for unit and format safety
 * @packageDocumentation
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
