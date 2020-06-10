import delayPromise from 'promise-delay';
import sequentPromises, { isNotRunningError } from '../index';

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
const resolvePromiseDelayed = (timeout) => () => delayPromise(timeout).then(() => timeout);

const promises = [promiseResolve, promiseReject, promiseResolve];
const emptyPromises = [promiseReject, promiseReject];
const delayedPromises = [
  promiseResolve,
  resolvePromiseDelayed(10),
  resolvePromiseDelayed(100),
  resolvePromiseDelayed(100),
];

describe('sequentPromises', () => {
  it('resolved Promises', () =>
    sequentPromises(promises).then(({ success, errors, results, isSuccessful, isError }) => {
      expect(success).toEqual([result, result]);
      expect(errors).toEqual([error]);
      expect(results).toEqual([result, error, result]);
      expect(isSuccessful).toBe(true);
      expect(isError).toBe(false);
    }));

  it('rejected Promises', () =>
    sequentPromises(emptyPromises).then(({ success, errors, results, isSuccessful, isError }) => {
      expect(success).toEqual([]);
      expect(errors).toEqual([error, error]);
      expect(results).toEqual([error, error]);
      expect(isSuccessful).toBe(false);
      expect(isError).toBe(true);
    }));

  it('stop Promises sync', () => {
    let active = true;
    const request = sequentPromises(delayedPromises, () => active);

    active = false;

    return request.then(({ success, errors, results, isSuccessful, isError }) => {
      expect(success).toEqual([]);
      expect(errors.length).toBe(4);
      expect(results.length).toBe(4);
      expect(isSuccessful).toBe(false);
      expect(isError).toBe(true);
    });
  });

  it('stop Promises async', () => {
    let active = true;
    const request = sequentPromises(delayedPromises, () => active);

    delayPromise(0).then(() => {
      active = false;
    });

    return request.then(({ success, errors, results, isSuccessful, isError }) => {
      expect(success).toEqual([result, 10]);
      expect(errors.length).toBe(2);
      expect(results.length).toBe(4);
      expect(isSuccessful).toBe(false);
      expect(isError).toBe(true);
    });
  });

  it('canRunTask', () => {
    const canRunTask = (task) => task !== promiseReject;

    return sequentPromises(promises, canRunTask).then(
      ({ success, errors, results, isSuccessful, isError }) => {
        expect(success).toEqual([result, result]);
        expect(errors.length).toBe(1);
        expect(results.length).toBe(3);
        expect(isNotRunningError(errors[0])).toEqual(true);
        expect(isSuccessful).toBe(true);
        expect(isError).toBe(false);
      }
    );
  });
});
