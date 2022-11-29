import { _Codes, _Types } from './types';
import type { AsyncReturnType, UnidentifiedError } from './types';
import { isObjectWithKey, isNonNullObject } from '../type-guards';

/**
 * Converts an unknown error into a default {@link UnidentifiedError} that's easier to work with.
 */
export const createUnexpectedError = (error: unknown): UnidentifiedError => {
  const defaultMessage = 'There was an unexpected error.';

  const unexpectedError: UnidentifiedError = {
    message: defaultMessage,
    _type: _Types.CODED_ERROR,
    _code: _Codes.UNIDENTIFIED_ERROR,
  };

  if (error instanceof Error) {
    unexpectedError.cause = error;
    unexpectedError.message = error.message;
    return unexpectedError;
  }

  unexpectedError.unknownCause = error;
  return unexpectedError;
};

/**
 * @param fallback A message to use if the error was not a string, Error, or object with a message key
 * @returns
 */
export const messageFromError = (
  error: unknown,
  stringify = false,
  fallback = 'There was an unexpected error'
): string => {
  if (typeof error === 'string') {
    return error;
  }

  if (isObjectWithKey(error, 'message', 'string')) {
    return error.message;
  }

  if (!stringify) {
    return fallback;
  }

  try {
    return `${fallback}: ${JSON.stringify(error)}`;
  } catch {
    return `${fallback}: ${String(error)}`;
  }
};

const isUnidentifiedError = (result: unknown): result is UnidentifiedError =>
  isNonNullObject(result) &&
  '_type' in result &&
  result._type === _Types.CODED_ERROR &&
  '_code' in result &&
  result._code === _Codes.UNIDENTIFIED_ERROR;

export const trySync = <Fn extends () => any>(fn: Fn): ReturnType<Fn> | UnidentifiedError => {
  try {
    return fn();
  } catch (error) {
    return createUnexpectedError(error);
  }
};

/**
 * Takes an async function that could throw and instead returns the error or fulfilled data.
 */
export const tryAsync = async <Fn extends () => Promise<any>>(
  fn: Fn
): Promise<UnidentifiedError | AsyncReturnType<Fn>> => {
  try {
    return await fn();
  } catch (error) {
    return createUnexpectedError(error);
  }
};
