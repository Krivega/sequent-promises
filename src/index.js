const idError = 'ERROR_NOT_RUNNING';

/**
 * Creates an error not running.
 *
 * @param {Promise} basePromise - The base promise
 *
 * @returns {object} error
 */
const createErrorNotRunning = (basePromise) => {
  const error = new Error('Promise was not running');

  error.basePromise = basePromise;
  error.id = idError;
  error.name = 'Not running';

  return error;
};

/**
 * Determines if not running. error.
 *
 * @param {Object} param    - param
 * @param {string} param.id - The identifier
 *
 * @returns {boolean} True if not running. error, False otherwise.
 */
export const isNotRunningError = ({ id }) => id === idError;

/**
 * The default is can run task
 *
 * @returns {boolean} false
 */
const canRunTaskTrue = () => true;

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
const sequentPromises = (promises, canRunTask = canRunTaskTrue) =>
  promises.reduce(
    (promiseChain, currentTask) =>
      promiseChain.then(({ success, errors, results }) => {
        let taskPromise;

        if (canRunTask(currentTask)) {
          taskPromise = currentTask();
        } else {
          taskPromise = Promise.reject(createErrorNotRunning(currentTask));
        }

        return taskPromise
          .then((currentResult) => ({
            errors,
            success: [...success, currentResult],
            results: [...results, currentResult],
            isSuccessful: true,
            isError: false,
          }))
          .catch((currentError) => ({
            success,
            errors: [...errors, currentError],
            results: [...results, currentError],
            isSuccessful: false,
            isError: true,
          }));
      }),
    Promise.resolve({ success: [], errors: [], results: [] })
  );

export default sequentPromises;
