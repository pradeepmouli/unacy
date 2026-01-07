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
 * Type for unit-based conversion accessors
 * Provides the shape: registry.celsius.to.fahrenheit(value)
 */
export type UnitConversionAccessors<Units extends PropertyKey> = {
  [From in Units]: {
    to: {
      [To in Exclude<Units, From>]: (value: WithUnits<any, From>) => WithUnits<any, To>;
    };
  };
};

/**
 * Internal implementation of ConverterRegistry
 */
class ConverterRegistryImpl<Units extends PropertyKey> implements ConverterRegistry<Units> {
  private readonly graph: Map<PropertyKey, Map<PropertyKey, Converter<any, any>>>;
  private readonly pathCache: Map<string, Converter<any, any>>;
  private readonly unitAccessors: Map<PropertyKey, any>;

  constructor(
    graph?: Map<PropertyKey, Map<PropertyKey, Converter<any, any>>>,
    pathCache?: Map<string, Converter<any, any>>
  ) {
    this.graph = graph || new Map();
    this.pathCache = pathCache || new Map();
    this.unitAccessors = new Map();
    
    // Build unit accessors dynamically
    this.buildUnitAccessors();
  }
  
  /**
   * Build dynamic unit accessors for fluent API: registry.celsius.to.fahrenheit(value)
   */
  private buildUnitAccessors(): void {
    // Get all unique units from the graph
    const allUnits = new Set<PropertyKey>();
    for (const from of this.graph.keys()) {
      allUnits.add(from);
      const toMap = this.graph.get(from);
      if (toMap) {
        for (const to of toMap.keys()) {
          allUnits.add(to);
        }
      }
    }
    
    // For each unit, create a `to` object with converter functions
    for (const fromUnit of allUnits) {
      const toAccessors: any = {};
      
      for (const toUnit of allUnits) {
        if (fromUnit !== toUnit) {
          // Create converter function
          toAccessors[toUnit] = (value: any) => {
            const converter = this.getConverter(fromUnit as any, toUnit as any);
            if (!converter) {
              throw new ConversionError(fromUnit, toUnit, 'No converter found');
            }
            return converter(value);
          };
        }
      }
      
      this.unitAccessors.set(fromUnit, { to: toAccessors });
    }
  }

  register<From extends Units, To extends Exclude<Units, From>>(
    from: From,
    to: To,
    converter: Converter<WithUnits<any, From>, WithUnits<any, To>>
  ): ConverterRegistry<Units> & UnitConversionAccessors<Units> {
    // Create new graph with the added converter
    const newGraph = new Map(this.graph);

    if (!newGraph.has(from)) {
      newGraph.set(from, new Map());
    }

    const fromMap = new Map(newGraph.get(from)!);
    fromMap.set(to, converter);
    newGraph.set(from, fromMap);

    // Return new registry instance (immutable) with proxy
    return createRegistryFromGraph<Units>(newGraph, new Map());
  }

  registerBidirectional<From extends Units, To extends Exclude<Units, From>>(
    from: From,
    to: To,
    converter: BidirectionalConverter<WithUnits<any, From>, WithUnits<any, To>>
  ): ConverterRegistry<Units> & UnitConversionAccessors<Units> {
    return this.register(from, to, converter.to).register(
      to as any,
      from as any,
      converter.from as any
    ) as ConverterRegistry<Units> & UnitConversionAccessors<Units>;
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
 * @returns Empty converter registry with unit-based accessors
 *
 * @example
 * ```typescript
 * const registry = createRegistry<'Celsius' | 'Fahrenheit'>()
 *   .register('Celsius', 'Fahrenheit', c => (c * 9/5 + 32) as Fahrenheit);
 * 
 * // Method 1: Using convert() method
 * const temp = 25 as Celsius;
 * const f1 = registry.convert(temp, 'Celsius').to('Fahrenheit');
 * 
 * // Method 2: Using unit accessors
 * const f2 = registry.celsius.to.fahrenheit(temp);
 * ```
 */
export function createRegistry<Units extends PropertyKey>(): ConverterRegistry<Units> & UnitConversionAccessors<Units> {
  return createRegistryFromGraph<Units>();
}

/**
 * Internal helper to create a registry with proxy from an existing graph
 */
function createRegistryFromGraph<Units extends PropertyKey>(
  graph?: Map<PropertyKey, Map<PropertyKey, Converter<any, any>>>,
  pathCache?: Map<string, Converter<any, any>>
): ConverterRegistry<Units> & UnitConversionAccessors<Units> {
  const registryImpl = new ConverterRegistryImpl<Units>(graph, pathCache);
  
  // Create a Proxy to intercept property access for unit accessors
  return new Proxy(registryImpl, {
    get(target: any, prop: string | symbol): any {
      // If the property exists on the registry implementation, return it
      if (prop in target || typeof prop === 'symbol') {
        return target[prop];
      }
      
      // Otherwise, check if it's a unit accessor
      const unitAccessor = target.unitAccessors.get(prop);
      if (unitAccessor) {
        return unitAccessor;
      }
      
      // Return undefined for unknown properties
      return undefined;
    }
  }) as ConverterRegistry<Units> & UnitConversionAccessors<Units>;
}
