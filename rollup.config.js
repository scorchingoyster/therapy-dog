import babel from 'rollup-plugin-babel';
import packageResolver from './package-resolver';

export default {
  entry: 'server.js',
  plugins: [
    babel(),
    packageResolver(['api', 'arrow'])
  ],
  format: 'cjs',
  dest: 'build/server-bundle.js',
  sourceMap: true
};
