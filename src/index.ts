const idError = 'ERROR_NOT_RUNNING';

type TTask<T> = () => Promise<T>;
type TCustomError<T> = Error & { basePromise: TTask<T>; id: string };

const createErrorNotRunning = <T>(basePromise: TTask<T>): TCustomError<T> => {
  const error = new Error('Promise was not running') as unknown as TCustomError<T>;

  error.basePromise = basePromise;
  error.id = idError;
  error.name = 'Not running';

  return error;
};

export const isNotRunningError = (error?: unknown) => {
  return (
    error !== null &&
    error !== undefined &&
    typeof error === 'object' &&
    'id' in error &&
    error.id === idError
  );
};

/**
 * sequentPromises resolves Promises sequentially.
 *
 * @func
 * @category Function
 *
 * @param {array}    promises   - Functions returns promises
 * @param {function} canRunTask - Function returns true, if need run current task
 *
 * @returns {Promise} resolved object with arrays of success, errors and results.
 *                    isSuccessful, isError - for last result
 *
 * @example
 * const urls = ['/url1', '/url2', '/url3']
 * const fetchUrls = urls.map(url => () => fetch(url))
 *
 * sequentPromises(fetchUrls)
 *   .then(({success, errors, results, isSuccessful, isError}) => {
 *     console.log(success);
 *     console.error(errors);
 *     console.log(results);
 *     console.log(isSuccessful);
 *     console.log(isError);
 *    })
 */
const sequentPromises = async <T>(
  promises: TTask<T>[],
  canRunTask?: (task: TTask<T>) => boolean,
) => {
  type TResponse = {
    success: T[];
    errors: (Error | TCustomError<T>)[];
    results: T[];
    isSuccessful: boolean;
    isError: boolean;
  };

  // eslint-disable-next-line unicorn/no-array-reduce
  return promises.reduce(
    async (promiseChain, currentTask) => {
      return promiseChain.then(async ({ success, errors, results }) => {
        const taskPromise =
          !canRunTask || canRunTask(currentTask)
            ? currentTask()
            : Promise.reject(createErrorNotRunning<T>(currentTask));

        return taskPromise
          .then((currentResult) => {
            return {
              errors,
              success: [...success, currentResult],
              results: [...results, currentResult],
              isSuccessful: true,
              isError: false,
            };
          })
          .catch((currentError: unknown) => {
            return {
              success,
              errors: [...errors, currentError as Error],
              results: [...results, currentError as T],
              isSuccessful: false,
              isError: true,
            };
          });
      });
    },
    Promise.resolve<TResponse>({
      success: [],
      errors: [],
      results: [],
      isSuccessful: false,
      isError: false,
    }),
  );
};

export { sequentPromises };
