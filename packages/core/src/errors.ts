/**
 * Base error class for all Unacy errors
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
 * Error thrown when a cycle is detected in the conversion graph
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
 * Error thrown when maximum conversion depth is exceeded
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
 * Error thrown when a conversion cannot be performed
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
 * Error thrown when parsing a string into a tagged format fails
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
