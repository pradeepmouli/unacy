/**
 * Converter registry with auto-composition via BFS
 * @packageDocumentation
 */

import type { Converter, BidirectionalConverter, Relax } from './converters.js';
import type {
  OptionalWithUnits,
  UnitsFor,
  WithUnits,
  UnitMetadata,
  BaseMetadata,
  PrimitiveType,
  Relax as RelaxUnits
} from './types.js';
import { ConversionError } from './errors.js';
import { findShortestPath, composeConverters } from './utils/graph.js';
import type { Simplify } from 'type-fest';

/**
 * Represents a conversion edge from one unit to another
 * Edges store the unit names as strings, but the type system ensures
 * they correspond to valid WithUnits types
 */
type Edge<
  From extends WithUnits = WithUnits<PrimitiveType, BaseMetadata>,
  To extends WithUnits = WithUnits<PrimitiveType, BaseMetadata>
> = readonly [From, To];

/**
 * Extract all unique 'from' units from a list of edges
 */
type FromUnits<Edges extends readonly Edge[]> = Edges[number][0];

/**
 * Extract all 'to' units for a specific 'from' unit string
 */
type ToUnitsFor<Edges extends readonly Edge[], FromUnit extends WithUnits> = Extract<
  Edges[number],
  readonly [FromUnit, any]
>[1];

/**
 * Extract metadata type from a WithUnits type
 */
type ExtractMetadata<T> = T extends WithUnits<any, infer M extends BaseMetadata> ? M : BaseMetadata;

/**
 * Type for unit accessor with metadata and conversion methods
 * Can be called as a function to create branded unit values
 */
export type UnitAccessor<
  From extends WithUnits<PrimitiveType, BaseMetadata>,
  Edges extends readonly Edge[],
  FromUnits extends string
> = {
  /**
   * Create a branded value with this unit
   * @param value - The numeric value to brand
   * @returns The value branded with this unit type
   */
  (value: number): From;
  to: {
    [To in ToUnitsFor<Edges, From> as UnitsFor<To>]: (
      value: RelaxUnits<From>
    ) => To;
  };
  /**
   * Add metadata to this unit
   */
  addMetadata(
    metadata: UnitMetadata
  ): ConverterRegistry<Edges extends readonly (infer E)[] ? E[] : never> & ConverterMap<Edges>;
  /**
   * Register a converter from this unit to another unit
   */
  register<To extends WithUnits<PrimitiveType, ToMeta>, ToMeta extends BaseMetadata>(
    to: UnitsFor<To>,
    converter: Relax<Converter<From, To>>
  ): ConverterRegistry<[...Edges, Edge<From, To>]> & ConverterMap<[...Edges, Edge<From, To>]>;
  register<To extends WithUnits<PrimitiveType, ToMeta>, ToMeta extends BaseMetadata>(
    to: UnitsFor<To>,
    converter: Relax<BidirectionalConverter<From, To>>
  ): ConverterRegistry<[...Edges, Edge<From, To>, Edge<To, From>]> &
    ConverterMap<[...Edges, Edge<From, To>, Edge<To, From>]>;
} & ExtractMetadata<From>;

/**
 * Type for unit-based conversion accessors
 * Provides the shape: registry.Celsius.to.Fahrenheit(value)
 * Only allows conversions that have been registered
 */
export type ConverterMap<Edges extends readonly Edge[]> = {
  [FU in FromUnits<Edges> as UnitsFor<FU>]: UnitAccessor<FU, Edges, UnitsFor<FromUnits<Edges>>>;
};

/**
 * Registry for managing and composing unit converters
 */
export interface ConverterRegistry<Edges extends Edge[] = []> {
  /**
   * Register a unidirectional converter
   *
   * @param from - Source unit
   * @param to - Destination unit
   * @param converter - Converter function
   * @returns New registry instance with the converter registered
   */
  register<
    From extends WithUnits<PrimitiveType, FromMeta>,
    To extends WithUnits<PrimitiveType, ToMeta>,
    FromMeta extends BaseMetadata,
    ToMeta extends BaseMetadata
  >(
    from: UnitsFor<From>,
    to: UnitsFor<To>,
    converter: Converter<From, RelaxUnits<To>>
  ): ConverterRegistry<[...Edges, Edge<From, To>]> & ConverterMap<[...Edges, Edge<From, To>]>;
  /**
   * Register a bidirectional converter (both directions)
   *
   * @param from - First unit
   * @param to - Second unit
   * @param converter - Bidirectional converter object
   * @returns New registry instance with both converters registered
   */
  register<
    From extends WithUnits<PrimitiveType, FromMeta>,
    To extends WithUnits<PrimitiveType, ToMeta>,
    FromMeta extends BaseMetadata,
    ToMeta extends BaseMetadata
  >(
    from: UnitsFor<From>,
    to: UnitsFor<To>,
    converter: BidirectionalConverter<RelaxUnits<From>, RelaxUnits<To>>
  ): ConverterRegistry<[...Edges, Edge<From, To>, Edge<To, From>]> &
    ConverterMap<[...Edges, Edge<From, To>, Edge<To, From>]>;

  // Note: registerBidirectional() method was deprecated - use register() with BidirectionalConverter instead

  /**
   * Explicitly allow a conversion path in the type system (for multi-hop conversions)
   *
   * This method verifies that a conversion path exists at runtime (via BFS) and adds it
   * to the type system so it can be used with type-safe accessor syntax.
   *
   * @param from - Source unit string
   * @param to - Destination unit string
   * @returns New registry instance with the conversion path enabled in types
   * @throws ConversionError if no path exists between the units
   *
   * @example
   * ```typescript
   * const registry = createRegistry()
   *   .register('Celsius', 'Kelvin', c => (c + 273.15) as Kelvin)
   *   .register('Kelvin', 'Fahrenheit', k => ((k - 273.15) * 9/5 + 32) as Fahrenheit)
   *   .allow('Celsius', 'Fahrenheit'); // Enable multi-hop path in types
   *
   * // Now type-safe:
   * const f = registry.Celsius.to.Fahrenheit(temp);
   * ```
   */
  allow<
    From extends WithUnits<PrimitiveType, FromMeta>,
    To extends WithUnits<PrimitiveType, ToMeta>,
    FromMeta extends BaseMetadata,
    ToMeta extends BaseMetadata
  >(
    from: UnitsFor<From>,
    to: UnitsFor<To>
  ): ConverterRegistry<[...Edges, Edge<From, To>]> & ConverterMap<[...Edges, Edge<From, To>]>;
  /**
   * Get a converter (direct or composed via BFS)
   *
   * @param from - Source unit
   * @param to - Destination unit
   * @returns Converter function, or undefined if no path exists
   */
  getConverter<
    From extends WithUnits<PrimitiveType, BaseMetadata>,
    To extends WithUnits<PrimitiveType, BaseMetadata>
  >(
    from: UnitsFor<From>,
    to: UnitsFor<To>
  ): Converter<From, To> | undefined;
  /**
   * Convert a value using fluent API
   *
   * @param value - Value to convert
   * @param fromUnit - Source unit
   * @returns Object with to() method for conversion
   */
  convert<From extends WithUnits<PrimitiveType, BaseMetadata>>(
    value: From,
    fromUnit: UnitsFor<From>
  ): {
    to<To extends WithUnits<PrimitiveType, BaseMetadata>>(unit: UnitsFor<To>): To;
  };
}

/**
 * Internal implementation of ConverterRegistry
 */
class ConverterRegistryImpl<Edges extends Edge[] = []> implements ConverterRegistry<Edges> {
  private readonly graph: Map<PropertyKey, Map<PropertyKey, Converter<any, any>>>;
  private readonly pathCache: Map<string, Converter<any, any>>;
  private readonly unitAccessors: Map<PropertyKey, any>;
  private readonly metadata: Map<PropertyKey, UnitMetadata>;

  constructor(
    graph?: Map<PropertyKey, Map<PropertyKey, Converter<any, any>>>,
    pathCache?: Map<string, Converter<any, any>>,
    metadata?: Map<PropertyKey, UnitMetadata>
  ) {
    this.graph = graph || new Map();
    this.pathCache = pathCache || new Map();
    this.metadata = metadata || new Map();
    this.unitAccessors = new Map();

    // Build unit accessors dynamically
    this.buildUnitAccessors();
  }

  /**
   * Build dynamic unit accessors for fluent API: registry.Celsius.to.Fahrenheit(value)
   */
  private buildUnitAccessors(): void {
    // Get all unique units from the graph (both from and to)
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

    // Also include units that have metadata but no converters yet
    for (const unit of this.metadata.keys()) {
      allUnits.add(unit);
    }

    // For each unit, create a `to` object with converter functions
    for (const fromUnit of allUnits) {
      const toAccessors: any = {};

      for (const toUnit of allUnits) {
        if (fromUnit !== toUnit) {
          // Create converter function that will look up the converter at call time
          toAccessors[toUnit] = (value: any) => {
            const converter = this.getConverter(fromUnit as any, toUnit as any);
            if (!converter) {
              throw new ConversionError(fromUnit, toUnit, 'No converter found');
            }
            return converter(value);
          };
        }
      }

      // Wrap toAccessors in a Proxy to handle unknown units dynamically
      const toProxy = new Proxy(toAccessors, {
        get: (target: any, toProp: string | symbol) => {
          if (typeof toProp === 'symbol') {
            return target[toProp];
          }
          // If accessor exists, return it
          if (toProp in target) {
            return target[toProp];
          }
          // Otherwise, create a dynamic converter function
          return (value: any) => {
            const converter = this.getConverter(fromUnit as any, toProp as any);
            if (!converter) {
              throw new ConversionError(fromUnit, toProp, 'No converter found');
            }
            return converter(value);
          };
        }
      });

      // Get metadata for this unit
      const unitMetadata = this.metadata.get(fromUnit) || {};

      // Create a callable function that brands a value with the unit
      const brandFunction = (value: number) => value as WithUnits<PrimitiveType, any>;

      // Create unit accessor object with to, addMetadata, register, and metadata properties
      const unitAccessor: any = Object.assign(brandFunction, {
        to: toProxy,
        addMetadata: (metadata: UnitMetadata) => {
          const newMetadata = new Map(this.metadata);
          const existingMetadata = newMetadata.get(fromUnit) || {};
          newMetadata.set(fromUnit, { ...existingMetadata, ...metadata });
          return createRegistryFromGraph<Edges>(this.graph, this.pathCache, newMetadata);
        },
        register: (
          to: string | { name: string },
          converter: Converter<any, any> | BidirectionalConverter<any, any>
        ) => {
          return this.register(fromUnit as any, to as any, converter as any);
        }
      });

      // Add metadata properties as direct properties on the accessor
      // Wrap in a Proxy to provide dynamic access to metadata
      const accessorProxy = new Proxy(unitAccessor, {
        get: (target: any, prop: string | symbol) => {
          if (typeof prop === 'symbol') {
            return target[prop];
          }
          // If it's a known property (to, addMetadata, register), return it
          if (prop in target) {
            return target[prop];
          }
          // Otherwise, check if it's a metadata property
          if (prop in unitMetadata) {
            return unitMetadata[prop as keyof UnitMetadata];
          }
          return undefined;
        }
      });

      this.unitAccessors.set(fromUnit, accessorProxy);
    }
  }

  register<
    From extends WithUnits<PrimitiveType, BaseMetadata>,
    To extends WithUnits<PrimitiveType, BaseMetadata>
  >(
    from: UnitsFor<From> | { name: UnitsFor<From> },
    to: UnitsFor<To> | { name: UnitsFor<To> },
    converter: Converter<From, To> | BidirectionalConverter<From, To>
  ): ConverterRegistry<any> & ConverterMap<any> {
    if (typeof from === 'object' && 'name' in from) {
      from = from.name;
    }
    if (typeof to === 'object' && 'name' in to) {
      to = to.name;
    }
    // Check if it's a bidirectional converter
    if (typeof converter === 'object' && 'to' in converter && 'from' in converter) {
      // Handle bidirectional converter
      const biConverter = converter as BidirectionalConverter<From, To>;
      return this.register(from, to, biConverter.to).register(
        to as any,
        from as any,
        biConverter.from as any
      ) as any;
    }

    // Handle unidirectional converter
    const newGraph = new Map(this.graph);

    if (!newGraph.has(from)) {
      newGraph.set(from, new Map());
    }

    const fromMap = new Map(newGraph.get(from)!);
    fromMap.set(to, converter as Converter<From, To>);
    newGraph.set(from, fromMap);

    // Return new registry instance (immutable) with proxy
    return createRegistryFromGraph<[...Edges, Edge<From, To>]>(
      newGraph,
      new Map(),
      this.metadata
    ) as any;
  }

  registerBidirectional<
    From extends WithUnits<PrimitiveType, BaseMetadata>,
    To extends WithUnits<PrimitiveType, BaseMetadata>
  >(
    from: UnitsFor<From>,
    to: UnitsFor<To>,
    converter: Relax<BidirectionalConverter<From, To>>
  ): ConverterRegistry<[...Edges, Edge<From, To>, Edge<To, From>]> &
    ConverterMap<[...Edges, Edge<From, To>, Edge<To, From>]> {
    return this.register(from, to, converter.to as any).register(
      to as any,
      from as any,
      converter.from as any
    ) as any;
  }

  allow<
    From extends WithUnits<PrimitiveType, FromMeta>,
    To extends WithUnits<PrimitiveType, ToMeta>,
    FromMeta extends BaseMetadata,
    ToMeta extends BaseMetadata
  >(
    from: UnitsFor<From>,
    to: UnitsFor<To>
  ): ConverterRegistry<[...Edges, Edge<From, To>]> & ConverterMap<[...Edges, Edge<From, To>]> {
    // Verify that a conversion path exists at runtime
    const converter = this.getConverter(from as any, to as any);
    if (!converter) {
      throw new ConversionError(from, to, 'No conversion path exists');
    }

    // Return the same registry instance with updated type information
    // The actual conversion already works via BFS, we just need to expose it in types
    return this as any;
  }

  getConverter<
    From extends WithUnits<PrimitiveType, BaseMetadata>,
    To extends WithUnits<PrimitiveType, BaseMetadata>
  >(from: UnitsFor<From>, to: UnitsFor<To>): Converter<From, To> | undefined {
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

  convert<From extends WithUnits<PrimitiveType, BaseMetadata>>(
    value: From,
    fromUnit: UnitsFor<From> | { name: UnitsFor<From> }
  ): {
    to<To extends WithUnits<PrimitiveType, BaseMetadata>>(unit: UnitsFor<To>): To;
  } {
    if (typeof fromUnit === 'object' && 'name' in fromUnit) {
      fromUnit = fromUnit.name;
    }
    return {
      to: <To extends WithUnits<PrimitiveType, BaseMetadata>>(unit: UnitsFor<To>): To => {
        const converter = this.getConverter(fromUnit as any, unit as any);
        if (!converter) {
          throw new ConversionError(fromUnit, unit, 'No converter found');
        }
        return converter(value) as To;
      }
    };
  }
}

/**
 * Create a new converter registry
 *
 * @template Edges - Optional tuple of Edge types to pre-declare available units and conversions
 * @returns Empty converter registry with unit-based accessors
 *
 * @example
 * ```typescript
 * type Celsius = WithUnits<PrimitiveType, 'Celsius'>;
 * type Fahrenheit = WithUnits<PrimitiveType, 'Fahrenheit'>;
 * type Meters = WithUnits<PrimitiveType, 'meters'>;
 * type Kilometers = WithUnits<PrimitiveType, 'kilometers'>;
 *
 * // Without pre-declared units
 * const registry = createRegistry()
 *   .register('Celsius', 'Fahrenheit', (c: Celsius) => ((c * 9/5) + 32) as Fahrenheit);
 *
 * // With pre-declared edges (for unit accessor registration before converters exist)
 * const registry2 = createRegistry<[Edge<'meters', 'kilometers'>]>()
 *   .meters.register('kilometers', (m) => (m / 1000) as Kilometers);
 *
 * const temp: Celsius = 25 as Celsius;
 * const fahrenheit = registry.Celsius.to.Fahrenheit(temp);
 * console.log(fahrenheit); // 77
 * ```
 */
export function createRegistry<Edges extends readonly Edge[] = []>(): ConverterRegistry<
  Edges extends readonly (infer E)[] ? E[] : never
> &
  ConverterMap<Edges> {
  return createRegistryFromGraph<Edges extends readonly (infer E)[] ? E[] : never>() as any;
}

/**
 * Internal helper to create a registry with proxy from an existing graph
 */
function createRegistryFromGraph<Edges extends Edge[] = []>(
  graph?: Map<PropertyKey, Map<PropertyKey, Converter<any, any>>>,
  pathCache?: Map<string, Converter<any, any>>,
  metadata?: Map<PropertyKey, UnitMetadata>
): ConverterRegistry<Edges> & ConverterMap<Edges> {
  const registryImpl = new ConverterRegistryImpl<Edges>(graph, pathCache, metadata);

  // Create a Proxy to intercept property access for unit accessors
  return new Proxy(registryImpl, {
    get(target: any, prop: string | symbol): any {
      // If the property exists on the registry implementation, return it
      if (prop in target || typeof prop === 'symbol') {
        return target[prop];
      }

      // Check if it's a unit accessor we've already built
      const unitAccessor = target.unitAccessors.get(prop);
      if (unitAccessor) {
        return unitAccessor;
      }

      // For unknown units, create a dynamic accessor on the fly
      // This ensures we can call .register() or .addMetadata() on any unit name
      const toProxy = new Proxy(
        {},
        {
          get: (_: any, toProp: string | symbol) => {
            if (typeof toProp === 'symbol') {
              return undefined;
            }
            return (value: any) => {
              const converter = target.getConverter(prop as any, toProp as any);
              if (!converter) {
                throw new ConversionError(prop, toProp, 'No converter found');
              }
              return converter(value);
            };
          }
        }
      );

      // Get metadata for this unit (may be empty)
      const unitMetadata = target.metadata.get(prop) || {};

      // Create a callable function that brands a value with the unit
      const brandFunction = (value: number) => value as WithUnits<PrimitiveType, any>;

      // Create unit accessor with all methods
      const dynamicAccessor: any = Object.assign(brandFunction, {
        to: toProxy,
        addMetadata: (metadata: UnitMetadata) => {
          const newMetadata = new Map(target.metadata) as Map<PropertyKey, UnitMetadata>;
          const existingMetadata = newMetadata.get(prop) || {};
          newMetadata.set(prop, { ...existingMetadata, ...metadata });
          return createRegistryFromGraph<any>(target.graph, target.pathCache, newMetadata);
        },
        register: (
          to: string | { name: string },
          converter: Converter<any, any> | BidirectionalConverter<any, any>
        ) => {
          return target.register(prop as any, to as any, converter as any);
        }
      });

      // Wrap in Proxy to provide dynamic access to metadata
      const accessorProxy = new Proxy(dynamicAccessor, {
        get: (accessorTarget: any, metaProp: string | symbol) => {
          if (typeof metaProp === 'symbol') {
            return accessorTarget[metaProp];
          }
          // If it's a known property (to, addMetadata, register), return it
          if (metaProp in accessorTarget) {
            return accessorTarget[metaProp];
          }
          // Otherwise, check if it's a metadata property
          if (metaProp in unitMetadata) {
            return unitMetadata[metaProp as keyof UnitMetadata];
          }
          return undefined;
        }
      });

      return accessorProxy;
    }
  }) as ConverterRegistry<Edges> & ConverterMap<Edges>;
}
