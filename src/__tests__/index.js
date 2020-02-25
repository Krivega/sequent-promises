import delayPromise from 'promise-delay';
import sequentPromises from '../index';

const result = 'result';
const error = new Error('error');

/**
 * promiseResolve
 * @returns {Promise} promiseResolve
 */
const promiseResolve = () => Promise.resolve(result);

/**
 * promiseReject
 * @returns {Promise} promiseReject
 */
const promiseReject = () => Promise.reject(error);

/**
 * Resolve promiseDelayed function
 * @param {number} timeout - Timeout
 * @returns {Promise} promiseDelayed
 */
const resolvePromiseDelayed = timeout => () => delayPromise(timeout).then(() => timeout);

const promises = [promiseResolve, promiseReject, promiseResolve];
const emptyPromises = [promiseReject, promiseReject];
const delayedPromises = [
  promiseResolve,
  resolvePromiseDelayed(10),
  resolvePromiseDelayed(100),
  resolvePromiseDelayed(100)
];

describe('sequentPromises', () => {
  it('resolved Promises', () =>
    sequentPromises(promises).then(({ results, errors }) => {
      expect(results).toEqual([result, result]);
      expect(errors).toEqual([error]);
    }));

  it('rejected Promises', () =>
    sequentPromises(emptyPromises).then(({ results, errors }) => {
      expect(results).toEqual([]);
      expect(errors).toEqual([error, error]);
    }));

  it('stop Promises sync', () => {
    let active = true;
    const request = sequentPromises(delayedPromises, () => active);

    active = false;

    return request.then(({ results, errors }) => {
      expect(results).toEqual([]);
      expect(errors.length).toBe(4);
    });
  });

  it('stop Promises async', () => {
    let active = true;
    const request = sequentPromises(delayedPromises, () => active);

    delayPromise(0).then(() => {
      active = false;
    });

    return request.then(({ results, errors }) => {
      expect(results).toEqual([result, 10]);
      expect(errors.length).toBe(2);
    });
  });
});
