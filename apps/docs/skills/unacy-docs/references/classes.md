# Classes

## Errors

### `UnacyError`
Base error class for all unacy errors.
*extends `Error`*
```ts
constructor(message: string): UnacyError
```
**Properties:**
- `name: string`
- `message: string`
- `stack: string` (optional)
- `cause: unknown` (optional)
```typescript
try {
  registry.convert(value, 'Celsius').to('Kelvin');
} catch (e) {
  if (e instanceof UnacyError) {
    console.error('Unit conversion failed:', e.message);
  }
}
```

### `CycleError`
Error thrown when a cycle is detected during BFS path-finding.
*extends `UnacyError`*
```ts
constructor(path: PropertyKey[]): CycleError
```
**Properties:**
- `path: PropertyKey[]`
- `name: string`
- `message: string`
- `stack: string` (optional)
- `cause: unknown` (optional)
```typescript
try {
  registry.getConverter('Celsius', 'Celsius'); // same unit
} catch (e) {
  if (e instanceof CycleError) {
    console.error('Cycle in path:', e.path.join(' → '));
  }
}
```

### `MaxDepthError`
Error thrown when BFS path-finding exceeds the maximum conversion depth.
*extends `UnacyError`*
```ts
constructor(from: PropertyKey, to: PropertyKey, maxDepth: number): MaxDepthError
```
**Properties:**
- `from: PropertyKey`
- `to: PropertyKey`
- `maxDepth: number`
- `name: string`
- `message: string`
- `stack: string` (optional)
- `cause: unknown` (optional)
```typescript
try {
  registry.getConverter('A', 'F'); // requires 6-hop path
} catch (e) {
  if (e instanceof MaxDepthError) {
    console.error(`Path A→F exceeds max depth of ${e.maxDepth}`);
  }
}
```

### `ConversionError`
Error thrown when a conversion cannot be performed.
*extends `UnacyError`*
```ts
constructor(from: PropertyKey, to: PropertyKey, reason?: string): ConversionError
```
**Properties:**
- `from: PropertyKey`
- `to: PropertyKey`
- `name: string`
- `message: string`
- `stack: string` (optional)
- `cause: unknown` (optional)
```typescript
try {
  registry.convert(temp, 'Celsius').to('Miles'); // no path
} catch (e) {
  if (e instanceof ConversionError) {
    console.error(`No path from ${String(e.from)} to ${String(e.to)}`);
  }
}
```

### `ParseError`
Error thrown when parsing a string into a format-tagged value fails.
*extends `UnacyError`*
```ts
constructor(format: string, input: string, reason: string): ParseError
```
**Properties:**
- `format: string`
- `input: string`
- `reason: string`
- `name: string`
- `message: string`
- `stack: string` (optional)
- `cause: unknown` (optional)
```typescript
try {
  parseISO('not-a-date');
} catch (e) {
  if (e instanceof ParseError) {
    console.error(`Failed to parse ${e.format}: ${e.reason}`);
    console.error(`Input was: ${e.input}`);
  }
}
```
