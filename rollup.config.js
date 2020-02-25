import babel from 'rollup-plugin-babel';
import { terser } from 'rollup-plugin-terser';
import pkg from './package.json';

const plugins = [babel(), terser()];
const getOutputModule = moduleName => {
  return [
    {
      file: pkg.exports[moduleName].require,
      format: 'cjs',
      exports: 'named'
    },
    {
      file: pkg.exports[moduleName].import,
      format: 'es'
    }
  ];
};

export default [
  { plugins, input: './src/index.js', output: getOutputModule('.') }
];
