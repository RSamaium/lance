import pjson from 'rollup-plugin-json';
import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';

const serverPlugins = [resolve(), pjson(), commonjs({ include: 'node_modules/**' })];
const clientPlugins = [resolve({ browser: true, preferBuiltins: false }), pjson(), commonjs({ include: 'node_modules/**' })];

export default [
    {
        // server build transpiled
        input: 'src/package/serverExports.js',
        external: ['fs', 'bufferutil', 'utf-8-validate', 'path', 'http', 'crypto'],
        output: { file: 'dist/server/lance-gg.js', format: 'cjs', name: 'Server', sourcemap: true },
        plugins: [... serverPlugins, babel({ exclude: '**/node_modules/**' })]
    },
    
    {
        // client build transpiled
        input: 'src/package/clientExports.js',
        external: ['fs', 'bufferutil', 'utf-8-validate', 'path', 'http', 'crypto'],
        output: { file: 'dist/client/lance-gg.js', format: 'umd', name: 'Client', sourcemap: true },
        plugins: [... clientPlugins, babel({ exclude: '**/node_modules/**' })]
    },
   
];
