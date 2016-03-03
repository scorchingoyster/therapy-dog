import babel from 'rollup-plugin-babel';
import multiEntry from 'rollup-plugin-multi-entry';
import commonjs from 'rollup-plugin-commonjs';

export default {
  entry: 'lib/arrow.js',
  plugins: [
    commonjs({ namedExports: { 'lib/parser.js': ['parse'] } }),
    babel()
  ],
  format: 'cjs',
  dest: 'index.js',
  sourceMap: true
};
