/**
 * Converter registry with auto-composition via BFS
 * @packageDocumentation
 */

import type {
  BidirectionalConverter,
  Converter,
  RelaxedConverter,
  RelaxedBidirectionalConverter
} from './converters.js';
import type {
  UnitsFor,
  WithUnits,
  TypedMetadata,
  NameFor,
  WithTypedUnits,
  UnitsOf,
  UnitMetadata,
  BaseMetadata,
  SupportedType,
  InferCallableArgs,
  Relax as RelaxUnits
} from './types.js';
import { ConversionError } from './errors.js';
import { findShortestPath, composeConverters } from './utils/graph.js';

/**
 * Represents a conversion edge from one unit to another
 * Edges store the unit names as strings, but the type system ensures
 * they correspond to valid WithUnits types
 */
type Edge<
  From extends WithTypedUnits<any> = WithTypedUnits<TypedMetadata<SupportedType>>,
  To extends WithTypedUnits<any> = WithTypedUnits<TypedMetadata<SupportedType>>
> = readonly [From, To];

/**
 * Extract all unique 'from' units from a list of edges
 */
type FromUnits<Edges extends readonly Edge[]> = Edges[number][0];

/**
 * Extract all 'to' units for a specific 'from' unit string
 */
type ToUnitsFor<Edges extends readonly Edge[], FromUnit extends WithTypedUnits<any>> = Extract<
  Edges[number],
  readonly [FromUnit, any]
>[1];

/**
 * Extract metadata type from a WithUnits type
 */
/**
 * Callable accessor object returned per unit from the registry.
 *
 * Provides three capabilities in one surface:
 * 1. **Callable** — call it to brand a plain value: `registry.Celsius(25)` → `Celsius`
 * 2. **`.to.<Unit>(value)`** — convert to another registered unit
 * 3. **`.register(toMeta, converter)`** — extend the registry from this unit
 *
 * Also reflects the unit's metadata properties directly (e.g., `registry.Celsius.symbol`).
 *
 * @template From - The branded unit type this accessor represents
 * @template Edges - Tuple of registered conversion edges in the registry
 *
 * @example
 * ```typescript
 * const temp = registry.Celsius(25);              // brand a value
 * const f = registry.Celsius.to.Fahrenheit(temp); // convert
 * registry.Celsius.symbol;                         // '°C' (if registered in metadata)
 * ```
 *
 * @useWhen You have a registry and want to convert, brand, or inspect a specific unit.
 *
 * @pitfalls
 * NEVER use the accessor's `.to.*` property at a type that doesn't exist in the
 * registry — TypeScript will report a type error, but at runtime the Proxy throws
 * `ConversionError` if the path is not reachable.
 *
 * NEVER call the accessor without arguments for non-primitive types — class-typed
 * units construct via `new Constructor(...args)`, so calling with zero args when
 * the constructor requires arguments will throw at runtime.
 *
 * @category Registry
 * @see UnitRegistry
 * @see createRegistry
 */
export type UnitAccessor<
  From extends WithTypedUnits<TypedMetadata<SupportedType>>,
  Edges extends readonly Edge[]
> = {
  /**
   * Create a branded value with this unit.
   * For tuples, pass members as individual arguments.
   * For classes, pass constructor parameters directly.
   * @param args - The value(s) to brand
   * @returns The value branded with this unit type
   */
  (...args: InferCallableArgs<From>): From;
  to: {
    [To in ToUnitsFor<Edges, From> as UnitsFor<To>]: (
      value: RelaxUnits<From>
    ) /*To avoid having to cast*/ => To;
  };
  /**
   * Add metadata to this unit
   */
  addMetadata<NewM extends Record<string, unknown>>(
    metadata: NewM
  ): UnitRegistry<Edges extends readonly (infer E)[] ? E[] : never> & UnitMap<Edges>;
  /**
   * Register a converter from this unit to another unit
   */
  register<To extends WithTypedUnits<ToMeta>, ToMeta extends TypedMetadata<SupportedType>>(
    to: UnitsFor<To> | ToMeta,
    converter: RelaxedConverter<From, To>
  ): UnitRegistry<[...Edges, Edge<From, To>]> & UnitMap<[...Edges, Edge<From, To>]>;
  register<To extends WithTypedUnits<ToMeta>, ToMeta extends TypedMetadata<SupportedType>>(
    to: UnitsFor<To> | ToMeta,
    converter: RelaxedBidirectionalConverter<From, To>
  ): UnitRegistry<[...Edges, Edge<From, To>, Edge<To, From>]> &
    UnitMap<[...Edges, Edge<From, To>, Edge<To, From>]>;
} & UnitsOf<From>;

/**
 * A map of unit name → `UnitAccessor` for all registered source units.
 *
 * Provides the fluent accessor shape:
 * `registry.Celsius.to.Fahrenheit(value)`
 * Only units that appear as the `From` side of a registered edge appear here.
 *
 * @remarks
 * `UnitMap` is a type-level view over the registered `Edges` tuple. Each call to
 * `registry.register(from, to, fn)` extends the `Edges` tuple at the type level,
 * adding a new key to `UnitMap`. This means the accessible unit names grow
 * monotonically — they are never removed once registered.
 *
 * @template Edges - Tuple of all registered conversion edges
 *
 * @category Registry
 */
export type UnitMap<Edges extends readonly Edge[]> = {
  [FU in FromUnits<Edges> as UnitsFor<FU>]: UnitAccessor<FU, Edges>;
};

/**
 * Registry for managing and composing unit converters.
 *
 * The central API of unacy. Each `register()` call returns a **new** registry
 * instance (immutable accumulator pattern) whose static type reflects the newly
 * added edge(s). At runtime, the registry stores edges in an adjacency map and
 * runs BFS when a direct edge is absent.
 *
 * @template Edges - Tuple of conversion edges accumulated so far
 *
 * @remarks
 * **Immutability**: every `register()` and `allow()` call produces a new
 * registry. Assigning the result back to the same variable is intentional —
 * the old instance remains valid but lacks the new edge in its type.
 *
 * **BFS caching**: multi-hop paths resolved via `getConverter` are cached by
 * a `"from->to"` key. Mutating the graph after caching is not supported — the
 * registry is designed to be built once and used many times.
 *
 * @example
 * ```typescript
 * const registry = createRegistry()
 *   .register(CelsiusMeta, FahrenheitMeta, { to: c => (c * 9/5) + 32, from: f => (f - 32) * 5/9 })
 *   .register(CelsiusMeta, KelvinMeta, c => c + 273.15)
 *   .allow(KelvinMeta, FahrenheitMeta);
 *
 * registry.Celsius.to.Fahrenheit(0 as Celsius); // 32
 * registry.Kelvin.to.Fahrenheit(273.15 as Kelvin); // 32
 * ```
 *
 * @useWhen You need a central, type-safe registry for a domain's units (e.g.,
 * temperature, length, currency) that enforces conversion safety at compile time.
 *
 * @avoidWhen You only need a single, always-direct conversion without
 * BFS composition — a plain `Converter<A, B>` function is simpler.
 *
 * @pitfalls
 * NEVER mutate the internal graph after calling `getConverter` on a path that
 * was composed via BFS — the path cache is not invalidated on mutation and will
 * return stale composed converters.
 *
 * NEVER discard the return value of `register()` — the original registry
 * instance does not have the new edge in its type or runtime graph.
 *
 * NEVER share a mutable registry reference across async boundaries where
 * concurrent calls could interleave `register` and `convert` — the registry is
 * designed to be fully built before any conversions are performed.
 *
 * @category Registry
 * @see createRegistry
 * @see UnitMap
 * @see UnitAccessor
 */
export interface UnitRegistry<Edges extends Edge[] = []> {
  register<From extends WithTypedUnits<FromMeta>, FromMeta extends TypedMetadata<SupportedType>>(
    unit: FromMeta
  ): this & { [K in NameFor<From>]: UnitAccessor<From, Edges> };
  /**
   * Register a unidirectional converter
   *
   * @param from - Source unit (string name or metadata object)
   * @param to - Destination unit (string name or metadata object)
   * @param converter - Converter function (input is branded, output can be plain or branded)
   * @returns New registry instance with the converter registered
   */
  register<
    From extends WithTypedUnits<FromMeta>,
    To extends WithTypedUnits<ToMeta>,
    FromMeta extends TypedMetadata<SupportedType>,
    ToMeta extends TypedMetadata<SupportedType>
  >(
    from: UnitsFor<From> | FromMeta,
    to: UnitsFor<To> | ToMeta,
    converter: RelaxedConverter<From, To>
  ): UnitRegistry<[...Edges, Edge<From, To>]> & UnitMap<[...Edges, Edge<From, To>]>;
  /**
   * Register a bidirectional converter (both directions)
   *
   * @param from - First unit (string name or metadata object)
   * @param to - Second unit (string name or metadata object)
   * @param converter - Bidirectional converter object (input branded, output can be plain or branded)
   * @returns New registry instance with both converters registered
   */
  register<
    From extends WithTypedUnits<FromMeta>,
    To extends WithTypedUnits<ToMeta>,
    FromMeta extends TypedMetadata<SupportedType>,
    ToMeta extends TypedMetadata<SupportedType>
  >(
    from: UnitsFor<From> | FromMeta,
    to: UnitsFor<To> | ToMeta,
    converter: RelaxedBidirectionalConverter<From, To>
  ): UnitRegistry<[...Edges, Edge<From, To>, Edge<To, From>]> &
    UnitMap<[...Edges, Edge<From, To>, Edge<To, From>]>;

  // Note: registerBidirectional() method was deprecated - use register() with BidirectionalConverter instead

  /**
   * Explicitly allow a conversion path in the type system (for multi-hop conversions)
   *
   * This method verifies that a conversion path exists at runtime (via BFS) and adds it
   * to the type system so it can be used with type-safe accessor syntax.
   *
   * @param from - Source unit (string name or metadata object)
   * @param to - Destination unit (string name or metadata object)
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
    From extends WithTypedUnits<FromMeta>,
    To extends WithTypedUnits<ToMeta>,
    FromMeta extends TypedMetadata<SupportedType>,
    ToMeta extends TypedMetadata<SupportedType>
  >(
    from: UnitsFor<From> | FromMeta,
    to: UnitsFor<To> | ToMeta
  ): UnitRegistry<[...Edges, Edge<From, To>]> & UnitMap<[...Edges, Edge<From, To>]>;
  /**
   * Get a converter (direct or composed via BFS)
   *
   * @param from - Source unit
   * @param to - Destination unit
   * @returns Converter function, or undefined if no path exists
   */
  getConverter<
    From extends WithUnits<SupportedType, BaseMetadata>,
    To extends WithUnits<SupportedType, BaseMetadata>
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
  convert<From extends WithUnits<SupportedType, BaseMetadata>>(
    value: From,
    fromUnit: UnitsFor<From>
  ): {
    to<To extends WithUnits<SupportedType, BaseMetadata>>(unit: UnitsFor<To>): To;
  };
}

/**
 * Internal implementation of ConverterRegistry
 */
class ConverterRegistryImpl<Edges extends Edge[] = []> implements UnitRegistry<Edges> {
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

      // Create a callable function that brands a value with the unit.
      // For tuples, collect spread args into an array.
      // For classes, construct an instance from the spread args.
      const metaType = (unitMetadata as any)?.type;
      const brandFunction =
        metaType && typeof metaType === 'function' && /^[A-Z]/.test(metaType.name ?? '')
          ? (...args: unknown[]) => new metaType(...args) as WithUnits<SupportedType, any>
          : metaType && Array.isArray(metaType)
            ? (...args: unknown[]) => args as unknown as WithUnits<SupportedType, any>
            : (value: unknown) => value as WithUnits<SupportedType, any>;

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

  // Overload 1: Register a single unit with metadata only (no converters)
  register<From extends WithTypedUnits<FromMeta>, FromMeta extends TypedMetadata<SupportedType>>(
    unit: FromMeta
  ): this & { [K in NameFor<From>]: UnitAccessor<From, Edges> };
  // Overload 2: Register unidirectional converter
  register<
    From extends WithTypedUnits<FromMeta>,
    To extends WithTypedUnits<ToMeta>,
    FromMeta extends TypedMetadata<SupportedType>,
    ToMeta extends TypedMetadata<SupportedType>
  >(
    from: UnitsFor<From> | FromMeta,
    to: UnitsFor<To> | ToMeta,
    converter: Converter<From, To>
  ): UnitRegistry<[...Edges, Edge<From, To>]> & UnitMap<[...Edges, Edge<From, To>]>;
  // Overload 3: Bidirectional converter
  register<
    From extends WithTypedUnits<FromMeta>,
    To extends WithTypedUnits<ToMeta>,
    FromMeta extends TypedMetadata<SupportedType>,
    ToMeta extends TypedMetadata<SupportedType>
  >(
    from: UnitsFor<From> | FromMeta,
    to: UnitsFor<To> | ToMeta,
    converter: BidirectionalConverter<From, To>
  ): UnitRegistry<[...Edges, Edge<From, To>, Edge<To, From>]> &
    UnitMap<[...Edges, Edge<From, To>, Edge<To, From>]>;
  // Implementation
  register<
    From extends WithTypedUnits<FromMeta>,
    To extends WithTypedUnits<ToMeta>,
    FromMeta extends TypedMetadata<SupportedType>,
    ToMeta extends TypedMetadata<SupportedType>
  >(
    from: UnitsFor<From> | FromMeta,
    to?: UnitsFor<To> | ToMeta,
    converter?: Converter<From, To> | BidirectionalConverter<From, To>
  ): any {
    // Handle single unit registration (overload 1)
    if (to === undefined && converter === undefined) {
      const unitMetadata = from as FromMeta;
      const newMetadata = new Map(this.metadata);
      const unitName = unitMetadata.name;
      const existingMetadata = newMetadata.get(unitName) || {};
      newMetadata.set(unitName, { ...existingMetadata, ...unitMetadata });
      return createRegistryFromGraph<Edges>(this.graph, this.pathCache, newMetadata) as any;
    }

    // Extract metadata if provided and store unit names
    let fromName: UnitsFor<From>;
    let toName: UnitsFor<To>;
    const newMetadata = new Map(this.metadata);

    if (typeof from === 'object' && 'name' in from) {
      fromName = from.name as UnitsFor<From>;
      // Store metadata for the from unit
      const existingFromMetadata = newMetadata.get(fromName) || {};
      newMetadata.set(fromName, { ...existingFromMetadata, ...from });
    } else {
      fromName = from as UnitsFor<From>;
    }

    if (typeof to === 'object' && 'name' in to) {
      toName = to.name as UnitsFor<To>;
      // Store metadata for the to unit
      const existingToMetadata = newMetadata.get(toName) || {};
      newMetadata.set(toName, { ...existingToMetadata, ...to });
    } else {
      toName = to as UnitsFor<To>;
    }

    // Check if it's a bidirectional converter
    if (typeof converter === 'object' && 'to' in converter && 'from' in converter) {
      // Handle bidirectional converter
      const biConverter = converter as BidirectionalConverter<From, To>;
      // Pass the original metadata objects (not just names) to preserve metadata
      return this.register(from, to!, biConverter.to).register(
        to! as any,
        from as any,
        biConverter.from as any
      ) as any;
    }

    // Handle unidirectional converter
    const newGraph = new Map(this.graph);

    if (!newGraph.has(fromName)) {
      newGraph.set(fromName, new Map());
    }

    const fromMap = new Map(newGraph.get(fromName)!);
    fromMap.set(toName, converter as Converter<From, To>);
    newGraph.set(fromName, fromMap);

    // Return new registry instance (immutable) with proxy
    return createRegistryFromGraph<[...Edges, Edge<From, To>]>(
      newGraph,
      new Map(),
      newMetadata
    ) as any;
  }

  registerBidirectional<
    From extends WithTypedUnits<FromMeta>,
    To extends WithTypedUnits<ToMeta>,
    FromMeta extends TypedMetadata<SupportedType>,
    ToMeta extends TypedMetadata<SupportedType>
  >(
    from: UnitsFor<From>,
    to: UnitsFor<To>,
    converter: RelaxedBidirectionalConverter<From, To>
  ): UnitRegistry<[...Edges, Edge<From, To>, Edge<To, From>]> &
    UnitMap<[...Edges, Edge<From, To>, Edge<To, From>]> {
    return this.register(from, to, converter.to as any).register(
      to as any,
      from as any,
      converter.from as any
    ) as any;
  }

  allow<
    From extends WithTypedUnits<FromMeta>,
    To extends WithTypedUnits<ToMeta>,
    FromMeta extends TypedMetadata<SupportedType>,
    ToMeta extends TypedMetadata<SupportedType>
  >(
    from: UnitsFor<From> | FromMeta,
    to: UnitsFor<To> | ToMeta
  ): UnitRegistry<[...Edges, Edge<From, To>]> & UnitMap<[...Edges, Edge<From, To>]> {
    // Extract unit names from metadata objects if provided
    const fromName = typeof from === 'object' && 'name' in from ? from.name : from;
    const toName = typeof to === 'object' && 'name' in to ? to.name : to;

    // Verify that a conversion path exists at runtime
    const converter = this.getConverter(fromName as any, toName as any);
    if (!converter) {
      throw new ConversionError(fromName, toName, 'No conversion path exists');
    }

    // Return the same registry instance with updated type information
    // The actual conversion already works via BFS, we just need to expose it in types
    return this as any;
  }

  getConverter<
    From extends WithUnits<SupportedType, BaseMetadata>,
    To extends WithUnits<SupportedType, BaseMetadata>
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

  convert<From extends WithUnits<SupportedType, BaseMetadata>>(
    value: From,
    fromUnit: UnitsFor<From> | { name: UnitsFor<From> }
  ): {
    to<To extends WithUnits<SupportedType, BaseMetadata>>(unit: UnitsFor<To>): To;
  } {
    if (typeof fromUnit === 'object' && 'name' in fromUnit) {
      fromUnit = fromUnit.name;
    }
    return {
      to: <To extends WithUnits<SupportedType, BaseMetadata>>(unit: UnitsFor<To>): To => {
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
 * Create a new, empty converter registry.
 *
 * The factory entry point for unacy. Returns an empty `UnitRegistry` that can
 * be grown incrementally via chained `.register()` calls. Each call produces a
 * new registry instance with an expanded type signature reflecting the new edge.
 *
 * @template Edges - Optional tuple of Edge types to pre-declare available units
 * and conversions before `register()` calls (rarely needed in practice).
 *
 * @returns Empty converter registry with full type-safe unit accessor support
 *
 * @example
 * ```typescript
 * import { createRegistry, type WithUnits, type BaseMetadata } from 'unacy';
 *
 * const CelsiusMeta = { name: 'Celsius' as const, symbol: '°C' } satisfies BaseMetadata;
 * const FahrenheitMeta = { name: 'Fahrenheit' as const, symbol: '°F' } satisfies BaseMetadata;
 * const KelvinMeta = { name: 'Kelvin' as const, symbol: 'K' } satisfies BaseMetadata;
 *
 * type Celsius = WithUnits<number, typeof CelsiusMeta>;
 * type Fahrenheit = WithUnits<number, typeof FahrenheitMeta>;
 * type Kelvin = WithUnits<number, typeof KelvinMeta>;
 *
 * const registry = createRegistry()
 *   .register(CelsiusMeta, FahrenheitMeta, { to: c => (c * 9/5) + 32, from: f => (f - 32) * 5/9 })
 *   .register(CelsiusMeta, KelvinMeta, c => c + 273.15)
 *   .allow(KelvinMeta, FahrenheitMeta); // lift BFS-composed path into types
 *
 * const f = registry.Celsius.to.Fahrenheit(25 as Celsius); // 77
 * const k = registry.Celsius.to.Kelvin(0 as Celsius);      // 273.15
 * ```
 *
 * @useWhen You need a type-safe, composable unit conversion graph for a domain.
 * The primary entry point for all unacy usage.
 *
 * @avoidWhen You only need a single direct conversion with no type guarantees —
 * a plain function is lighter and requires no registry setup overhead.
 *
 * @pitfalls
 * NEVER reassign a registry variable without capturing the `register()` return
 * value — each call returns a new instance; the original is unchanged.
 * ```typescript
 * // WRONG — result is discarded
 * const r = createRegistry();
 * r.register(CelsiusMeta, FahrenheitMeta, converter); // r is not updated
 *
 * // CORRECT — chain the calls
 * const registry = createRegistry()
 *   .register(CelsiusMeta, FahrenheitMeta, converter);
 * ```
 *
 * NEVER add values of different units directly in arithmetic — the type system
 * prevents this at compile time, but if you bypass it with `as`, the runtime
 * will silently produce incorrect results with no error.
 *
 * NEVER use `as` to cast a `Quantity<Celsius>` to `Quantity<Fahrenheit>` —
 * this defeats the entire purpose of the phantom type system.
 *
 * @category Registry
 * @see UnitRegistry
 * @see UnitMap
 */
export function createRegistry<Edges extends readonly Edge[] = []>(): UnitRegistry<
  Edges extends readonly (infer E)[] ? E[] : never
> &
  UnitMap<Edges> {
  return createRegistryFromGraph<Edges extends readonly (infer E)[] ? E[] : never>() as any;
}

/**
 * Internal helper to create a registry with proxy from an existing graph
 */
function createRegistryFromGraph<Edges extends Edge[] = []>(
  graph?: Map<PropertyKey, Map<PropertyKey, Converter<any, any>>>,
  pathCache?: Map<string, Converter<any, any>>,
  metadata?: Map<PropertyKey, UnitMetadata>
): UnitRegistry<Edges> & UnitMap<Edges> {
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

      // Create a callable function that brands a value with the unit.
      // For tuples, collect spread args into an array.
      // For classes, construct an instance from the spread args.
      const metaType = (unitMetadata as any)?.type;
      const brandFunction =
        metaType && typeof metaType === 'function' && /^[A-Z]/.test(metaType.name ?? '')
          ? (...args: unknown[]) => new metaType(...args) as WithUnits<SupportedType, any>
          : metaType && Array.isArray(metaType)
            ? (...args: unknown[]) => args as unknown as WithUnits<SupportedType, any>
            : (value: unknown) => value as WithUnits<SupportedType, any>;

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
  }) as UnitRegistry<Edges> & UnitMap<Edges>;
}
