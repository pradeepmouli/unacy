/**
 * Converter registry with auto-composition via BFS
 * @packageDocumentation
 */

import type { Converter, BidirectionalConverter } from './converters';
import type { WithUnits } from './types';
import { ConversionError } from './errors';
import { findShortestPath, composeConverters } from './utils/graph';

/**
 * Registry for managing and composing unit converters
 */
export interface ConverterRegistry<Units extends PropertyKey> {
  /**
   * Register a unidirectional converter
   *
   * @param from - Source unit
   * @param to - Destination unit
   * @param converter - Converter function
   * @returns New registry instance with the converter registered
   */
  register<From extends Units, To extends Exclude<Units, From>>(
    from: From,
    to: To,
    converter: Converter<WithUnits<any, From>, WithUnits<any, To>>
  ): ConverterRegistry<Units>;

  /**
   * Register a bidirectional converter (both directions)
   *
   * @param from - First unit
   * @param to - Second unit
   * @param converter - Bidirectional converter object
   * @returns New registry instance with both converters registered
   */
  registerBidirectional<From extends Units, To extends Exclude<Units, From>>(
    from: From,
    to: To,
    converter: BidirectionalConverter<WithUnits<any, From>, WithUnits<any, To>>
  ): ConverterRegistry<Units>;

  /**
   * Get a converter (direct or composed via BFS)
   *
   * @param from - Source unit
   * @param to - Destination unit
   * @returns Converter function, or undefined if no path exists
   */
  getConverter<From extends Units, To extends Exclude<Units, From>>(
    from: From,
    to: To
  ): Converter<WithUnits<any, From>, WithUnits<any, To>> | undefined;

  /**
   * Fluent conversion API
   *
   * @param value - Value to convert
   * @returns Object with `to()` method for specifying target unit
   *
   * @example
   * ```typescript
   * const temp: Celsius = 25 as Celsius;
   * // Pass the unit explicitly via a wrapper object
   * const result = registry.convert(temp, 'Celsius').to('Fahrenheit');
   * ```
   */
  convert<From extends Units>(
    value: WithUnits<any, From>,
    fromUnit: From
  ): {
    to<To extends Exclude<Units, From>>(unit: To): WithUnits<any, To>;
  };
}

/**
 * Internal implementation of ConverterRegistry
 */
class ConverterRegistryImpl<Units extends PropertyKey> implements ConverterRegistry<Units> {
  private readonly graph: Map<PropertyKey, Map<PropertyKey, Converter<any, any>>>;
  private readonly pathCache: Map<string, Converter<any, any>>;

  constructor(
    graph?: Map<PropertyKey, Map<PropertyKey, Converter<any, any>>>,
    pathCache?: Map<string, Converter<any, any>>
  ) {
    this.graph = graph || new Map();
    this.pathCache = pathCache || new Map();
  }

  register<From extends Units, To extends Exclude<Units, From>>(
    from: From,
    to: To,
    converter: Converter<WithUnits<any, From>, WithUnits<any, To>>
  ): ConverterRegistry<Units> {
    // Create new graph with the added converter
    const newGraph = new Map(this.graph);

    if (!newGraph.has(from)) {
      newGraph.set(from, new Map());
    }

    const fromMap = new Map(newGraph.get(from)!);
    fromMap.set(to, converter);
    newGraph.set(from, fromMap);

    // Return new registry instance (immutable)
    return new ConverterRegistryImpl<Units>(newGraph, new Map());
  }

  registerBidirectional<From extends Units, To extends Exclude<Units, From>>(
    from: From,
    to: To,
    converter: BidirectionalConverter<WithUnits<any, From>, WithUnits<any, To>>
  ): ConverterRegistry<Units> {
    return this.register(from, to, converter.to).register(
      to as any,
      from as any,
      converter.from as any
    );
  }

  getConverter<From extends Units, To extends Exclude<Units, From>>(
    from: From,
    to: To
  ): Converter<WithUnits<any, From>, WithUnits<any, To>> | undefined {
    // Check cache first
    const cacheKey = `${String(from)}->${String(to)}`;
    const cached = this.pathCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Try direct lookup (O(1))
    const fromMap = this.graph.get(from);
    if (fromMap) {
      const direct = fromMap.get(to);
      if (direct) {
        this.pathCache.set(cacheKey, direct);
        return direct;
      }
    }

    // Fallback to BFS for multi-hop path
    try {
      const path = findShortestPath(from, to, this.graph);

      if (!path) {
        return undefined;
      }

      const composed = composeConverters(path, this.graph);
      this.pathCache.set(cacheKey, composed);
      return composed;
    } catch (error) {
      // For cycle and max depth errors, we should propagate them
      // For other errors, return undefined
      if (
        error instanceof Error &&
        (error.constructor.name === 'CycleError' || error.constructor.name === 'MaxDepthError')
      ) {
        throw error;
      }
      return undefined;
    }
  }

  convert<From extends Units>(
    value: WithUnits<any, From>,
    fromUnit: From
  ): {
    to<To extends Exclude<Units, From>>(unit: To): WithUnits<any, To>;
  } {
    return {
      to: <To extends Exclude<Units, From>>(unit: To): WithUnits<any, To> => {
        const converter = this.getConverter(fromUnit as any, unit as any);
        if (!converter) {
          throw new ConversionError(fromUnit, unit, 'No converter found');
        }
        return converter(value);
      }
    };
  }
}

/**
 * Create a new converter registry
 *
 * @template Units - Union type of all unit identifiers
 * @returns Empty converter registry
 *
 * @example
 * ```typescript
 * const registry = createRegistry<'Celsius' | 'Fahrenheit'>()
 *   .register('Celsius', 'Fahrenheit', c => (c * 9/5 + 32) as Fahrenheit);
 * ```
 */
export function createRegistry<Units extends PropertyKey>(): ConverterRegistry<Units> {
  return new ConverterRegistryImpl<Units>();
}
