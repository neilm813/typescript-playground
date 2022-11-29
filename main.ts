import { _Codes, _Types, trySync, tryAsync } from './src/utils';
import type { ValidationError, UnidentifiedError } from './src/utils';

console.log('test');

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

const createUserService = async (username: string): Promise<User | ValidationError | UnidentifiedError> => {
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
