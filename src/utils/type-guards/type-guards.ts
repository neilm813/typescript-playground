export type TypeofMap = {
  boolean: boolean;
  number: number;
  string: string;
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
