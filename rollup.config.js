import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import packageResolver from './package-resolver';

export default {
  entry: 'server.js',
  plugins: [
    packageResolver(['api', 'arrow']),
    commonjs({ namedExports: { 'arrow/lib/parser.js': ['parse'] } }),
    babel()
  ],
  format: 'cjs',
  dest: 'build/server-bundle.js',
  sourceMap: true
};
