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
  SupportedType,
  EnumType,
  ClassType,
  RecordSchema,
  TupleSchema,
  ToPrimitiveTypeName
} from './types.js';

// Converter types
export type {
  Converter,
  BidirectionalConverter,
  RelaxedConverter,
  RelaxedBidirectionalConverter
} from './converters.js';

// Formatter/Parser types
export type { Formatter, Parser, FormatterParser } from './formatters.js';

// Registry
export type { UnitRegistry, UnitMap, UnitAccessor } from './registry.js';
export { createRegistry } from './registry.js';

// Errors
export { UnacyError, CycleError, MaxDepthError, ConversionError, ParseError } from './errors.js';

// Utilities
export {
  createParserWithSchema,
  validateEnum,
  validateClass,
  validateRecordSchema,
  validateTupleSchema,
  isEnumMetadata,
  isClassMetadata,
  isRecordMetadata,
  isTupleMetadata,
  detectMetadataKind
} from './utils/validation.js';

// Type inference utilities
export type {
  PrimitiveTypeFromName,
  InferFromRecordSchema,
  InferFromTupleSchema
} from './types.js';
