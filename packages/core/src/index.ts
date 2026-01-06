/**
 * Core utility functions and types for the monorepo
 * @packageDocumentation
 */

import { z } from 'zod';
import type { Tagged } from 'type-fest';

export type WithUnits<T, U extends PropertyKey> = Tagged<T, 'Units', U>;

export type WithFormat<T, F extends string> = Tagged<T, 'Format', F>;

export type Converter<
  TInput extends WithUnits<unknown, PropertyKey>,
  TOutput extends WithUnits<unknown, PropertyKey>
> = (input: TInput) => TOutput;

export type BidirectionalConverter<
  TInput extends WithUnits<unknown, PropertyKey>,
  TOutput extends WithUnits<unknown, PropertyKey>
> = {
  to: Converter<TInput, TOutput>;
  from: Converter<TOutput, TInput>;
};

export type Formatter<TInput extends WithFormat<unknown, string>> = (input: TInput) => string;

export type Parser<TOutput extends WithFormat<unknown, string>> = (input: string) => TOutput;

export type FormatterParser<T extends WithFormat<unknown, string>> = {
  format: Formatter<T>;
  parse: Parser<T>;
};

export type ConverterRegistry<Units extends PropertyKey> = {
  [input in Units]: {
    to: {
      [output in Exclude<Units, input>]: Converter<
        WithUnits<unknown, input>,
        WithUnits<unknown, output>
      >;
    };
  };
} & {
  register<
    TInput extends WithUnits<unknown, PropertyKey>,
    TOutput extends WithUnits<unknown, PropertyKey>
  >(
    converter: Converter<TInput, TOutput>
  ): ConverterRegistry<Units> & ConverterRegistry<TInput['Units'] | TOutput['Units']>;
};
