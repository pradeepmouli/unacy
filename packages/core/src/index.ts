/**
 * Unacy Core - Type-safe unit and format conversion library
 * @packageDocumentation
 */

// Core types
export type {
  WithUnits,
  WithTypedUnits,
  WithFormat,
  BaseMetadata,
  TypedMetadata,
  UnitMetadata,
  Relax,
  PrimitiveType,
  ToPrimitiveType,
  ToPrimitiveTypeName
} from './types.js';

// Converter types
export type { Converter, BidirectionalConverter } from './converters.js';

// Formatter/Parser types
export type { Formatter, Parser, FormatterParser } from './formatters.js';

// Registry
export type { UnitRegistry, UnitMap, UnitAccessor } from './registry.js';
export { createRegistry } from './registry.js';

// Errors
export { UnacyError, CycleError, MaxDepthError, ConversionError, ParseError } from './errors.js';

// Utilities
export { createParserWithSchema } from './utils/validation.js';
