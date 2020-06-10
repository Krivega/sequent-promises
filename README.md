# sequent-promises

[![npm](https://img.shields.io/npm/v/sequent-promises?style=flat-square)](https://www.npmjs.com/package/sequent-promises)
![npm bundle size](https://img.shields.io/bundlephobia/minzip/sequent-promises?style=flat-square)

Call promises one by one, ignoring the state (fulfilled or rejected). and returning the collected data in the tuple `{ results, errors }`.

## Install

npm

```sh
npm install sequent-promises
```

yarn

```sh
yarn add sequent-promises
```

## Usage

```js
import sequentPromises, { isNotRunningError } from 'sequent-promises';

const result = 'result';
const error = new Error('error');
const promiseResolve = () => Promise.resolve(result);
const promiseReject = () => Promise.reject(error);

sequentPromises([promiseResolve, promiseReject, promiseResolve, isSuccessful, isError]).then(
  ({ success, errors, results }) => {
    console.log(success); // [result, result]
    console.log(errors); // ['Not running: Promise was not running']
    console.log(results); // [result, 'Not running: Promise was not running', result]
    console.log(isSuccessful); // true - last promise
    console.log(isError); // false - last promise
    console.log(isNotRunningError(errors[0])); //true;
  }
);
```

## Run tests

```sh
npm test
```

## Maintainer

**Krivega Dmitriy**

- Website: https://krivega.com
- Github: [@Krivega](https://github.com/Krivega)

## Contributing

Contributions, issues and feature requests are welcome!<br />Feel free to check [issues page](https://github.com/Krivega/sequent-promises/issues). You can also take a look at the [contributing guide](https://github.com/Krivega/sequent-promises/blob/master/CONTRIBUTING.md).

## 📝 License

Copyright © 2020 [Krivega Dmitriy](https://github.com/Krivega).<br />
This project is [MIT](https://github.com/Krivega/sequent-promises/blob/master/LICENSE) licensed.
