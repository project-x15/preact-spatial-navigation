import babel from '@rollup/plugin-babel'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'

const extensions = ['.ts', '.js']

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/spatial.js',
      format: 'esm',
      sourcemap: true,
    },
    {
      file: 'dist/spatial.umd.js',
      format: 'umd',
      name: 'X15Spatial',
      sourcemap: true,
    },
  ],
  plugins: [
    resolve({ extensions }),
    commonjs(),
    babel({
      extensions,
      babelHelpers: 'bundled',
      configFile: './babel.config.json',
    }),
  ],
  // External peer dep — preact is not bundled
  external: ['preact', 'preact/hooks'],
}
