import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel'
import serve from 'rollup-plugin-serve'
import alias from '@rollup/plugin-alias'
const path = require('path')

const customResolver = resolve({
    extensions: ['.mjs','.js','.jsx','.json','.sass','.scss']
})
export default{
    input: './src/index.js',    
    output:{
        file: 'dist/xvue.js',
        format: 'umd',
        name: 'XVue'
    },
    plugins:[
        alias({
            entries: [
                { find: '@', replacement: path.resolve(__dirname, './src') },
            ],
            customResolver
        }),
        babel({
            exclude: 'node_modules/**'
        }),  
        serve({
            open: true,
            port: 8082,
            contentBase:'',
            openPage: '/index.html'
        }),
    ]
}