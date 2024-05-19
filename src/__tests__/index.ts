/// <reference types="jest" />

import { isNotRunningError, sequentPromises } from '../index';

const noop = () => {};
const deferred = <T = void>() => {
  let resolveDeferred: (data: T) => void = noop;
  let rejectDeferred: (error: Error) => void = noop;

  const promise = new Promise<T>((resolve, reject) => {
    resolveDeferred = resolve;
    rejectDeferred = reject;
  });

  return { promise, resolve: resolveDeferred, reject: rejectDeferred };
};

const delayPromise = async (timeout: number): Promise<void> => {
  const { promise, resolve } = deferred();

  setTimeout(resolve, timeout);

  return promise;
};

const result = 777;
const error = new Error('error');

/**
 * promiseResolve
 * @returns {Promise} promiseResolve
 */
const promiseResolve = async () => {
  return result;
};

/**
 * promiseReject
 * @returns {Promise} promiseReject
 */
const promiseReject = async () => {
  throw error;
};

/**
 * Resolve promiseDelayed function
 * @param {number} timeout - Timeout
 * @returns {Promise} promiseDelayed
 */
const resolvePromiseDelayed = (timeout: number) => {
  return async () => {
    return delayPromise(timeout).then(() => {
      return timeout;
    });
  };
};

const promises = [promiseResolve, promiseReject, promiseResolve];
const emptyPromises = [promiseReject, promiseReject];
const delayedPromises = [
  promiseResolve,
  resolvePromiseDelayed(10),
  resolvePromiseDelayed(100),
  resolvePromiseDelayed(100),
];

describe('sequentPromises', () => {
  it('resolved Promises', async () => {
    return sequentPromises<number>(promises).then(
      ({ success, errors, results, isSuccessful, isError }) => {
        expect(success).toEqual([result, result]);
        expect(errors).toEqual([error]);
        expect(results).toEqual([result, error, result]);
        expect(isSuccessful).toBe(true);
        expect(isError).toBe(false);
      },
    );
  });

  it('rejected Promises', async () => {
    return sequentPromises(emptyPromises).then(
      ({ success, errors, results, isSuccessful, isError }) => {
        expect(success).toEqual([]);
        expect(errors).toEqual([error, error]);
        expect(results).toEqual([error, error]);
        expect(isSuccessful).toBe(false);
        expect(isError).toBe(true);
      },
    );
  });

  it('stop Promises sync', async () => {
    let active = true;
    const request = sequentPromises(delayedPromises, () => {
      return active;
    });

    active = false;

    return request.then(({ success, errors, results, isSuccessful, isError }) => {
      expect(success).toEqual([]);
      expect(errors.length).toBe(4);
      expect(results.length).toBe(4);
      expect(isSuccessful).toBe(false);
      expect(isError).toBe(true);
    });
  });

  it('stop Promises async', async () => {
    let active = true;
    const request = sequentPromises(delayedPromises, () => {
      return active;
    });

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
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

  it('canRunTask', async () => {
    // eslint-disable-next-line unicorn/consistent-function-scoping
    const canRunTask = (task: () => Promise<number>) => {
      return task !== promiseReject;
    };

    return sequentPromises(promises, canRunTask).then(
      ({ success, errors, results, isSuccessful, isError }) => {
        expect(success).toEqual([result, result]);
        expect(errors.length).toBe(1);
        expect(results.length).toBe(3);
        expect(isNotRunningError(errors[0])).toEqual(true);
        expect(isSuccessful).toBe(true);
        expect(isError).toBe(false);
      },
    );
  });
});
