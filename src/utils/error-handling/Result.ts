const ERR = Symbol('error');
const OK = Symbol('ok');

export interface OkResult<T> {
  [OK]: true;
  value: T;
}

export interface ErrResult<T = Error> {
  [ERR]: true;
  error: T;
}

export const ok = <T>(value: T): OkResult<T> => ({
  [OK]: true,
  value,
});

export const err = <T>(error: T): ErrResult<T> => ({
  [ERR]: true,
  error,
});

export type Result<OkT, ErrT> = {};
