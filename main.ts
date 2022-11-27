console.log('test');
console.log('test3');

export interface TypeofMap {
  bigint: bigint;
  string: string;
  boolean: boolean;
  number: number;
  symbol: symbol;
}

// enum GuardKeys {
//   _type = '_type',
//   _code = '_code',
// }

enum _Codes {
  UNEXPECTED_ERROR = 'UNEXPECTED_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  INVALID_ID = 'INVALID_ID',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
}

enum _Types {
  CODED_ERROR = 'CODED_ERROR',
}

interface BaseCodedError {
  message: string;
  _code: _Codes;
  _type: _Types.CODED_ERROR;
}

/**
 * Used to convert unknown errors into this as a default type first that can be returned if there isn't a more
 * expected coded error to convert to.
 */
interface UnexpectedError extends BaseCodedError {
  /** The original error message or a generic unexpected error message if the original was not an `Error` instance. */
  message: string;
  /** This is the original error if it was an `Error` instance. This could be an axios `Error`. */
  cause?: Error;
  /** This is the original error if it was not an error instance. */
  unknownCause?: unknown;
  _code: _Codes.UNEXPECTED_ERROR;
}

interface ValidationError extends BaseCodedError {
  _code: _Codes.VALIDATION_ERROR;
}

/**
 * Converts an unknown error into a default {@link UnexpectedError} that's easier to work with.
 */
export const createUnexpectedError = (error: unknown): UnexpectedError => {
  const defaultMessage = 'There was an unexpected error.';

  const unexpectedError: UnexpectedError = {
    message: defaultMessage,
    _type: _Types.CODED_ERROR,
    _code: _Codes.UNEXPECTED_ERROR,
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

/**
 * This is most useful as the first condition in a more specific type guard.
 * @example
 * ```
 * if (isNonNullObject(foo) && 'bar' in foo) {
 *   console.log(foo.bar);
 * }
 * ```
 */
export const isNonNullObject = (item: unknown): item is Record<string, unknown> =>
  typeof item === 'object' && item !== null;

/**
 * @example
 * ```
 *   if (isObjectWithKey(obj, 'message', 'string')) {
 *     console.log(obj.message);
 *   }
 * ```
 */
export const isObjectWithKey = <K extends string, TypeofResult extends keyof TypeofMap>(
  item: unknown,
  key: K,
  typeofResult: TypeofResult
): item is Record<K, TypeofMap[TypeofResult]> => {
  return isNonNullObject(item) && key in item && typeof item[key] === typeofResult;
};

const tryFailed = (result: unknown): result is UnexpectedError =>
  isNonNullObject(result) &&
  '_type' in result &&
  result._type === _Types.CODED_ERROR &&
  '_code' in result &&
  result._code === _Codes.UNEXPECTED_ERROR;

export const trySync = <Fn extends () => any>(fn: Fn): ReturnType<Fn> | UnexpectedError => {
  try {
    return fn();
  } catch (error) {
    return createUnexpectedError(error);
  }
};

type AsyncReturnType<Fn extends (...args: any) => Promise<any>> = Fn extends (...args: any) => Promise<infer R>
  ? R
  : unknown;

/**
 * Takes an async function that could throw and instead returns the error or fulfilled data.
 */
export const tryAsync = async <Fn extends () => Promise<any>>(
  fn: Fn
): Promise<UnexpectedError | AsyncReturnType<Fn>> => {
  try {
    return await fn();
  } catch (error) {
    return createUnexpectedError(error);
  }
};

interface User {
  username: string;
}

const dbCreateUser = async (username: string, shouldError: boolean): Promise<User> => {
  if (shouldError) {
    if (Math.random() < 0.5) {
      const e = new Error('Db: username must be unique');
      e.name = 'NonUniqueError';
      throw e;
    }

    throw new Error('Db: timed out.');
  }
  return {
    username,
  };
};

const createUserService = async (username: string): Promise<User | ValidationError | UnexpectedError> => {
  if (username.length < 3) {
    return {
      _code: _Codes.VALIDATION_ERROR,
      _type: _Types.CODED_ERROR,
      message: 'Username must be at least 3 characters long.',
    };
  }

  const newUserResult = await tryAsync(async () => {
    return dbCreateUser('test', true);
  });

  return newUserResult;
};

// export function fromThrowable<Fn extends (...args: readonly any[]) => any, E>(
//   fn: Fn,
//   errorFn?: (e: unknown) => E,
// ): (...args: Parameters<Fn>) => Result<ReturnType<Fn>, E> {
//   return (...args) => {
//     try {
//       const result = fn(...args)
//       return ok(result)
//     } catch (e) {
//       return err(errorFn ? errorFn(e) : e)
//     }
//   }
// }
