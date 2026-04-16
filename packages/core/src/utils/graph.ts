/**
 * Graph traversal utilities for converter registry
 * @packageDocumentation
 */

import { CycleError, MaxDepthError } from '../errors.js';
import type { Converter } from '../converters.js';

/**
 * Maximum allowed conversion path depth to prevent infinite loops
 */
const MAX_DEPTH = 5;

/**
 * Find the shortest path between two nodes using BFS.
 *
 * Traverses the unit conversion graph breadth-first to find the minimum-hop
 * path from `from` to `to`. The result is used by `composeConverters` to build
 * a composed converter function for multi-hop conversions.
 *
 * @param from - Starting node (unit name key)
 * @param to - Target node (unit name key)
 * @param adjacencyMap - Graph represented as a nested adjacency list
 * @returns Array of nodes representing the shortest path (including `from` and `to`),
 *   or `null` if no path exists
 *
 * @throws {CycleError} If `from === to` (self-conversion cycle)
 * @throws {MaxDepthError} If any discovered path would exceed `MAX_DEPTH` (5) edges
 *
 * @remarks
 * The BFS visits each node at most once (`visited` set). Self-loops are detected
 * eagerly (`from === to` check) rather than during traversal.
 *
 * The maximum depth limit (`MAX_DEPTH = 5`) guards against sparse but deeply
 * connected graphs. If you regularly need 5+ hop chains, redesign the graph by
 * registering intermediate direct edges or using `allow()` to pre-compose paths.
 *
 * @example
 * ```typescript
 * // Internal usage in ConverterRegistryImpl.getConverter():
 * const path = findShortestPath('Celsius', 'Fahrenheit', graph);
 * // path = ['Celsius', 'Kelvin', 'Fahrenheit'] if only C→K and K→F are registered
 * ```
 *
 * @pitfalls
 * NEVER call this function directly from application code — use
 * `registry.convert(value, from).to(to)` or `registry.getConverter(from, to)`,
 * which add BFS caching and handle error propagation correctly.
 *
 * @category Graph
 * @see composeConverters
 */
export function findShortestPath(
  from: PropertyKey,
  to: PropertyKey,
  adjacencyMap: Map<PropertyKey, Map<PropertyKey, unknown>>
): PropertyKey[] | null {
  // Handle self-conversion (cycle detection)
  if (from === to) {
    throw new CycleError([from, to]);
  }

  // BFS queue: [currentNode, path]
  const queue: Array<[PropertyKey, PropertyKey[]]> = [[from, [from]]];
  const visited = new Set<PropertyKey>();
  visited.add(from);

  while (queue.length > 0) {
    const [current, path] = queue.shift()!;

    // Get neighbors
    const neighbors = adjacencyMap.get(current);
    if (!neighbors) {
      continue;
    }

    // Explore neighbors
    for (const neighbor of neighbors.keys()) {
      // Check max depth before extending path
      // path currently has N nodes (N-1 edges); adding neighbor would make N+1 nodes (N edges)
      const numEdges = path.length; // Number of edges after adding neighbor
      if (numEdges > MAX_DEPTH) {
        throw new MaxDepthError(from, to, MAX_DEPTH);
      }

      // Found target
      if (neighbor === to) {
        return [...path, neighbor];
      }

      // Cycle detection: if we've already visited this node in this path, skip it
      if (visited.has(neighbor)) {
        continue;
      }

      visited.add(neighbor);
      queue.push([neighbor, [...path, neighbor]]);
    }
  }

  // No path found
  return null;
}

/**
 * Compose multiple converters along a path into a single converter.
 *
 * Given a path `[A, B, C]` and a registry containing `A→B` and `B→C`
 * converters, produces a single `Converter<A, C>` that applies them left-to-right.
 *
 * @param path - Array of unit-name nodes representing the conversion path
 *   (at least 2 elements required: `[from, ..., to]`)
 * @param registry - Adjacency map of converters keyed by source unit name
 * @returns Composed converter function that applies each step in sequence
 *
 * @throws {Error} If the path has fewer than 2 nodes
 * @throws {Error} If any converter along the path is missing from the registry
 *
 * @remarks
 * The composition is a simple `reduce` — values pass through each converter in
 * order. Each intermediate result is an unbranded `any` at runtime; the type
 * safety is enforced at the call site by the registry's type signature.
 *
 * Floating-point precision accumulates with each hop. For chains where precision
 * matters, prefer registering a direct edge over relying on BFS composition.
 *
 * @example
 * ```typescript
 * // Internal usage: path found by findShortestPath
 * const composed = composeConverters(['Celsius', 'Kelvin', 'Fahrenheit'], graph);
 * composed(0); // applies C→K then K→F, returning 32
 * ```
 *
 * @pitfalls
 * NEVER call this function with a path containing a unit that has no outgoing
 * edge in the registry — it throws immediately with a non-descriptive `Error`.
 * Always confirm paths with `findShortestPath` first.
 *
 * NEVER rely on composed-converter precision for high-accuracy domains (e.g.,
 * financial or scientific calculations) — each hop introduces floating-point
 * rounding error. Register a direct converter instead.
 *
 * @category Graph
 * @see findShortestPath
 */
export function composeConverters(
  path: PropertyKey[],
  registry: Map<PropertyKey, Map<PropertyKey, Converter<any, any>>>
): Converter<any, any> {
  if (path.length < 2) {
    throw new Error('Path must contain at least 2 nodes');
  }

  // Build array of converters
  const converters: Converter<any, any>[] = [];
  for (let i = 0; i < path.length - 1; i++) {
    const from = path[i]!;
    const to = path[i + 1]!;

    const converterMap = registry.get(from);
    if (!converterMap) {
      throw new Error(`No converters registered from ${String(from)}`);
    }

    const converter = converterMap.get(to);
    if (!converter) {
      throw new Error(`No converter registered from ${String(from)} to ${String(to)}`);
    }

    converters.push(converter);
  }

  // Compose converters: apply them left-to-right
  return (input: any): any => {
    return converters.reduce((value, converter) => converter(value), input);
  };
}
