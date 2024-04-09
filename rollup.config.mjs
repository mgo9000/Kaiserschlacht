// SPDX-FileCopyrightText: 2022 Johannes Loher
// SPDX-FileCopyrightText: 2022 David Archibald
//
// SPDX-License-Identifier: MIT
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
export default () => ({
  input: 'src/module/kaiserschlacht.mjs',
  output: {
    dir: 'dist/module',
    format: 'es'
  },
  plugins: [nodeResolve(), commonjs(), json()]
});
