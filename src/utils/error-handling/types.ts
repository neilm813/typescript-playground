export enum _Codes {
  UNIDENTIFIED_ERROR = 'UNIDENTIFIED_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  INVALID_ID = 'INVALID_ID',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
}

export enum _Types {
  CODED_ERROR = 'CODED_ERROR',
}

export interface BaseCodedError {
  message: string;
  _code: _Codes;
  _type: _Types.CODED_ERROR;
}

/**
 * Used to convert unknown errors into this as a default type first that can be returned if there isn't a more
 * expected coded error to convert to.
 */
export interface UnidentifiedError extends BaseCodedError {
  /** The original error message or a generic unexpected error message if the original was not an `Error` instance. */
  message: string;
  /** This is the original error if it was an `Error` instance. This could be an axios `Error`. */
  cause?: Error;
  /** This is the original error if it was not an error instance. */
  unknownCause?: unknown;
  _code: _Codes.UNIDENTIFIED_ERROR;
}

export interface ValidationError extends BaseCodedError {
  _code: _Codes.VALIDATION_ERROR;
}

export type AsyncReturnType<Fn extends (...args: any) => Promise<any>> = Fn extends (...args: any) => Promise<infer R>
  ? R
  : unknown;
