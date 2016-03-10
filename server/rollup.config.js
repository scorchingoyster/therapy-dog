import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import packageResolver from './package-resolver';

export default {
  entry: 'api',
  plugins: [
    packageResolver(['api', 'arrow']),
    commonjs({ namedExports: { 'arrow/lib/parser.js': ['parse'] } }),
    babel()
  ],
  format: 'cjs',
  dest: 'build/bundle.js',
  sourceMap: true
};
