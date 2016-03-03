import babel from 'rollup-plugin-babel';
import multiEntry from 'rollup-plugin-multi-entry';
import commonjs from 'rollup-plugin-commonjs';
import packageResolver from './package-resolver';

export default {
  entry: '{api,arrow}/test/**/*-test.js',
  plugins: [
    babel(),
    packageResolver(['api', 'arrow']),
    multiEntry()
  ],
  format: 'cjs',
  dest: 'build/test-bundle.js',
  sourceMap: true
};
