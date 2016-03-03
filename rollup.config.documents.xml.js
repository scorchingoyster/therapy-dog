import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';

export default {
  entry: 'lib/documents/xml.js',
  plugins: [
    commonjs({ namedExports: { 'lib/parser.js': ['parse'] } }),
    babel()
  ],
  format: 'cjs',
  dest: 'documents/xml.js',
  sourceMap: true
};
