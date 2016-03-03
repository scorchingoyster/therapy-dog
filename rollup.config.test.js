import babel from 'rollup-plugin-babel';
import multiEntry from 'rollup-plugin-multi-entry';
import commonjs from 'rollup-plugin-commonjs';

export default {
  entry: 'test/**/*-test.js',
  plugins: [
    commonjs({ namedExports: { 'lib/parser.js': ['parse'] } }),
    babel(),
    multiEntry()
  ],
  format: 'cjs',
  dest: 'build/test-bundle.js',
  sourceMap: true
};
