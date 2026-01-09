import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import svelte from 'rollup-plugin-svelte';
import sveltePreprocess from 'svelte-preprocess';

const isProd = (process.env.BUILD === 'production');

export default {
  input: 'main.ts',
  output: {
    dir: '.',
    sourcemap: 'inline',
    sourcemapExcludeSources: isProd,
    format: 'cjs',
    exports: 'default',
  },
  external: ['obsidian'],
  plugins: [
    svelte({
      preprocess: sveltePreprocess({ sourceMap: !isProd }),
      compilerOptions: {
        dev: !isProd,
        css: 'injected'  // 将 CSS 注入到 JS 中
      },
      emitCss: false,  // 不单独输出 CSS 文件
    }),
    typescript({
      sourceMap: !isProd,
      inlineSources: !isProd
    }),
    nodeResolve({ browser: true }),
    commonjs(),
  ]
};
