const webpack = require('webpack')
const path = require('path')
const autoprefixer = require('autoprefixer')

module.exports = {
    devtool: 'eval',
    entry: [
        'react-hot-loader/patch',
        'webpack-dev-server/client?http://localhost:8080',
        'webpack/hot/only-dev-server',
        './ui/application/index.js'
    ],
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new webpack.LoaderOptionsPlugin({
            postcss: {
                sourceMap: true,
                plugins: () => [autoprefixer],
            }
        }),
        new webpack.DefinePlugin({
            'process.env': { 
                'NODE_ENV': JSON.stringify('dev')
            }
        })
    ],
    output: {
        publicPath: '/static/',
        path: path.join(__dirname, '../../static'),
        filename: 'bundle.js'
    },
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loaders: [
                    {
                        loader: 'babel-loader',
                        query: {
                            babelrc: true
                        }
                    }
                ]
            },
            {
                test: /\.css$/,
                loaders: [
                    'style-loader',
                    'css-loader'
                ]
            },
            {
                test: /\.scss$/,
                exclude: /node_modules/,
                loaders: [
                    'style-loader',
                    {
                        loader: 'css-loader',
                        query: {
                            sourceMap: true,
                            module: true,
                            localIdentName: 'market__[local]___[hash:base64:5]'
                        }
                    },
                    {
                        loader: 'sass-loader',
                        query: {
                            outputStyle: 'expanded',
                            sourceMap: true
                        }
                    }
                ]
            },
            {
                test: /\.(png|jpg|)$/,
                exclude: /node_modules/,
                use: [{
                    loader: 'url-loader',
                    options: {
                        limit: 200000
                    }
                }]
            },
            {
                test: /\.modernizrrc.js$/,
                loader: "modernizr"
            },
            {
                test: /\.modernizrrc(\.json)?$/,
                loader: "modernizr!json"
            }
        ]
    },
    devServer: {
        hot: true,
        inline: false,
        historyApiFallback: true,
        proxy: {
            '/api/*': {
                target: 'http://127.0.0.1:5000'
            }
        }
    }
}