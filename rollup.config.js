import babel from 'rollup-plugin-babel'
import commonjs from 'rollup-plugin-commonjs'
import external from 'rollup-plugin-peer-deps-external'
import postcss from 'rollup-plugin-postcss'
import resolve from 'rollup-plugin-node-resolve'
import url from 'rollup-plugin-url'
import json from 'rollup-plugin-json'

import pkg from './package.json'

const extensions = [
  '.js', '.jsx'
]
export default {
  input: 'src/index.js',
  output: [
    {
      file: pkg.main,
      format: 'cjs',
      sourcemap: true,
      name: 'vendor'
    },
    {
      file: pkg.module,
      format: 'es',
      sourcemap: true,
      name: 'vendor'
    }
  ],
  plugins: [
    json(),
    external(),
    postcss({
      modules: true
    }),
    url(),
    babel({ extensions, include: ['src/**/*.js'], exclude: ['node_modules/**', '*.json'] }),
    resolve(),
    commonjs()
  ]
}