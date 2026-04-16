/**
 * Base error class for all unacy errors.
 *
 * @remarks
 * All unacy-specific errors extend `UnacyError`, so callers can catch the
 * entire error family with a single `catch (e) { if (e instanceof UnacyError) ... }`
 * guard while still discriminating by subclass when needed.
 *
 * `Object.setPrototypeOf` is called in the constructor to maintain a correct
 * prototype chain in environments that compile to ES5.
 *
 * @example
 * ```typescript
 * try {
 *   registry.convert(value, 'Celsius').to('Kelvin');
 * } catch (e) {
 *   if (e instanceof UnacyError) {
 *     console.error('Unit conversion failed:', e.message);
 *   }
 * }
 * ```
 *
 * @category Errors
 */
export class UnacyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UnacyError';

    // Maintain proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Error thrown when a cycle is detected during BFS path-finding.
 *
 * @remarks
 * This error is thrown by `findShortestPath` when `from === to` (a unit
 * being converted to itself). The registry's `getConverter` method re-throws
 * `CycleError` rather than silently returning `undefined`.
 *
 * @example
 * ```typescript
 * try {
 *   registry.getConverter('Celsius', 'Celsius'); // same unit
 * } catch (e) {
 *   if (e instanceof CycleError) {
 *     console.error('Cycle in path:', e.path.join(' → '));
 *   }
 * }
 * ```
 *
 * @pitfalls
 * NEVER call `registry.convert(value, 'X').to('X')` — converting a unit to
 * itself triggers cycle detection and throws `CycleError` at runtime.
 *
 * @category Errors
 */
export class CycleError extends UnacyError {
  public readonly path: PropertyKey[];

  constructor(path: PropertyKey[]) {
    const pathStr = path.map(String).join(' → ');
    super(`Cycle detected in conversion path: ${pathStr}`);
    this.name = 'CycleError';
    this.path = path;
  }
}

/**
 * Error thrown when BFS path-finding exceeds the maximum conversion depth.
 *
 * @remarks
 * The maximum depth is currently fixed at 5 hops. This prevents the BFS
 * from exploring excessively large graphs and guards against near-cycles
 * (long paths that would be impractical for production use anyway).
 *
 * If you hit this error, consider:
 * 1. Using `allow(A, Z)` to cache the composed path once found, avoiding
 *    repeated BFS traversal.
 * 2. Splitting a long dimension chain into domain-specific sub-registries.
 * 3. Registering a direct edge for the problematic pair.
 *
 * @example
 * ```typescript
 * try {
 *   registry.getConverter('A', 'F'); // requires 6-hop path
 * } catch (e) {
 *   if (e instanceof MaxDepthError) {
 *     console.error(`Path A→F exceeds max depth of ${e.maxDepth}`);
 *   }
 * }
 * ```
 *
 * @pitfalls
 * NEVER design a conversion graph that relies on paths longer than 5 hops —
 * `MaxDepthError` is thrown at runtime and cannot be caught as a type error.
 * Register intermediate direct edges or use `allow()` to cap the chain.
 *
 * @category Errors
 */
export class MaxDepthError extends UnacyError {
  public readonly from: PropertyKey;
  public readonly to: PropertyKey;
  public readonly maxDepth: number;

  constructor(from: PropertyKey, to: PropertyKey, maxDepth: number) {
    super(
      `Maximum conversion depth of ${maxDepth} exceeded when converting from ${String(from)} to ${String(to)}`
    );
    this.name = 'MaxDepthError';
    this.from = from;
    this.to = to;
    this.maxDepth = maxDepth;
  }
}

/**
 * Error thrown when a conversion cannot be performed.
 *
 * @remarks
 * `ConversionError` is the most common error consumers encounter. It is thrown
 * when no direct edge and no BFS-discoverable path exists between two units, or
 * when `allow()` is called for a pair with no reachable path.
 *
 * Inspect `e.from` and `e.to` to determine which units are missing a path, then
 * register the required converter with `registry.register(from, to, fn)`.
 *
 * @example
 * ```typescript
 * try {
 *   registry.convert(temp, 'Celsius').to('Miles'); // no path
 * } catch (e) {
 *   if (e instanceof ConversionError) {
 *     console.error(`No path from ${String(e.from)} to ${String(e.to)}`);
 *   }
 * }
 * ```
 *
 * @pitfalls
 * NEVER call `registry.convert(value, fromUnit).to(toUnit)` without handling
 * `ConversionError` — the path may not exist even if both units are registered.
 *
 * NEVER confuse a missing converter with a wrong-direction converter — if
 * `A → B` is registered but `B → A` is not, converting `B` to `A` throws
 * `ConversionError`, not a type error.
 *
 * @category Errors
 */
export class ConversionError extends UnacyError {
  public readonly from: PropertyKey;
  public readonly to: PropertyKey;

  constructor(from: PropertyKey, to: PropertyKey, reason?: string) {
    const reasonStr = reason ? `: ${reason}` : '';
    super(`Cannot convert from ${String(from)} to ${String(to)}${reasonStr}`);
    this.name = 'ConversionError';
    this.from = from;
    this.to = to;
  }
}

/**
 * Error thrown when parsing a string into a format-tagged value fails.
 *
 * @remarks
 * Thrown by `Parser<T>` implementations (and `createParserWithSchema`) when
 * input validation fails. Carries the format name, original input, and a
 * human-readable reason to help callers produce user-facing error messages.
 *
 * Input strings longer than 50 characters are truncated with `...` in the
 * error message to keep logs readable.
 *
 * @example
 * ```typescript
 * try {
 *   parseISO('not-a-date');
 * } catch (e) {
 *   if (e instanceof ParseError) {
 *     console.error(`Failed to parse ${e.format}: ${e.reason}`);
 *     console.error(`Input was: ${e.input}`);
 *   }
 * }
 * ```
 *
 * @pitfalls
 * NEVER catch `ParseError` silently and return a default value without logging —
 * silent coercion hides data-integrity issues that may corrupt downstream state.
 *
 * @category Errors
 */
export class ParseError extends UnacyError {
  public readonly format: string;
  public readonly input: string;
  public readonly reason: string;

  constructor(format: string, input: string, reason: string) {
    const truncatedInput = input.length > 50 ? `${input.slice(0, 50)}...` : input;
    const displayInput = input === '' ? '""' : truncatedInput;

    super(`Cannot parse "${displayInput}" as ${format}: ${reason}`);
    this.name = 'ParseError';
    this.format = format;
    this.input = input;
    this.reason = reason;
  }
}
