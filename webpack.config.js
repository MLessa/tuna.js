import webpack from 'webpack';
import path from 'path';

export default (env) => {
    const __dirname = path.join(path.dirname(decodeURI(new URL(import.meta.url).pathname))).replace(/^\\([A-Z]:\\)/, "$1");

    let bundleName = "tuna";
    let webpackEntry = './src/tuna.js';

    if (env.essentials) {
        webpackEntry = './src/tuna-api.js';
        bundleName = "tuna-api";
    }

    return {
        entry: [webpackEntry],
        output: {
            path: __dirname,
            filename: `bundles/${bundleName}.js`,
            library: 'Tuna',
            libraryTarget: 'umd',
            umdNamedDefine: true,
            libraryExport: 'default'
        },
        module: {
            rules: [
                {
                    test: /\.riot$/,
                    exclude: /node_modules/,
                    use: [{
                        loader: '@riotjs/webpack-loader',
                        options: {
                            hot: true
                        }
                    }]
                },
                {
                    test: /\.m?js$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: ['@babel/preset-env']
                        }
                    }
                }
            ]
        },
        plugins: [
            new webpack.DefinePlugin({
                "process.env": JSON.stringify(process.env)
            })
        ]
    };
}