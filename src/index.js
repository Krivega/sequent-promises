const idError = 'ERROR_CANCELED';

/**
 * Creates an error canceled.
 *
 * @param {Promise} basePromise - The base promise
 *
 * @returns {object} error
 */
const createErrorCanceled = basePromise => ({
  basePromise,
  id: idError,
  name: 'Canceled',
  message: 'Promise was not running'
});

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
 * @param {array}    promises - Functions returns promises
 * @param {function} canRunTask  - Function returns true, if need run current task
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
          taskPromise = Promise.reject(createErrorCanceled(currentTask));
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
