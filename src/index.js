const idError = 'ERROR_NOT_RUNNING';

/**
 * Creates an error not running.
 *
 * @param {Promise} basePromise - The base promise
 *
 * @returns {object} error
 */
const createErrorNotRunning = basePromise => {
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
 * @returns {Propmise} resolved object with arrays of results and errors
 *
 * @example
 * const urls = ['/url1', '/url2', '/url3']
 * const fetchUrls = urls.map(url => () => fetch(url))
 *
 * sequentPromises(fetchUrls)
 *   .then(({results, errors}) => {
 *     console.log(results);
 *     console.error(errors);
 *    })
 */
const sequentPromises = (promises, canRunTask = canRunTaskTrue) =>
  promises.reduce(
    (promiseChain, currentTask) =>
      promiseChain.then(({ results, errors }) => {
        let taskPromise;

        if (canRunTask(currentTask)) {
          taskPromise = currentTask();
        } else {
          taskPromise = Promise.reject(createErrorNotRunning(currentTask));
        }

        return taskPromise
          .then(currentResult => ({
            errors,
            results: [...results, currentResult]
          }))
          .catch(currentError => ({
            results,
            errors: [...errors, currentError]
          }));
      }),
    Promise.resolve({ results: [], errors: [] })
  );

export default sequentPromises;
