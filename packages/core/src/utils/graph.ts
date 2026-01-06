/**
 * Graph traversal utilities for converter registry
 * @packageDocumentation
 */

import { CycleError, MaxDepthError } from '../errors';
import type { Converter } from '../converters';

/**
 * Maximum allowed conversion path depth to prevent infinite loops
 */
const MAX_DEPTH = 5;

/**
 * Find the shortest path between two nodes using BFS.
 *
 * @param from - Starting node
 * @param to - Target node
 * @param adjacencyMap - Graph represented as adjacency list
 * @returns Array of nodes representing the shortest path, or null if no path exists
 * @throws {CycleError} If a cycle is detected during traversal
 * @throws {MaxDepthError} If path depth exceeds MAX_DEPTH
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
      // path currently has N nodes, adding neighbor makes N+1 nodes = N edges
      const numEdges = path.length; // This will be the number of edges after adding neighbor
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
 * @param path - Array of nodes representing the conversion path
 * @param registry - Map of converters keyed by [from, to]
 * @returns Composed converter function
 * @throws {Error} If any converter in the path is missing
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
