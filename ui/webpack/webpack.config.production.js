const webpack = require('webpack')
const path = require('path')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const autoprefixer = require('autoprefixer');

const extractSass = new ExtractTextPlugin('./css/nanolayout.min.css')

module.exports = {
    devtool: 'cheap-module-source-map',
    entry: {
        index: './ui/client/layout_client.js',
        vendors: [
            'react',
            'react-dom',
            'react-cookie',
            'react-router-redux',            
            'react-redux',
            'react-split-pane',
            'react-draggable',
            'react-custom-scrollbars',
            
            'bluebird',
            'react-router',
            'react-router-dom',
            'react-smooth-scrollbar',
            'smooth-scrollbar',
            'recharts',
            'history',

            'redux',
            'redux-api-middleware',
            'redux-thunk',
            'redux-logger',

            'dragscroll',
            'xlsx',

            'isomorphic-fetch',
            'react-fontawesome',            
            'lodash',
            'moment',
            'md5'
        ],
        antd: ['antd']
    },
    output: {
        path: path.join(__dirname, 'nanolayout_asset'),
        filename: 'nanolayout.min.js'
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        plugins: ['transform-runtime']
                    }
                }
            }, 
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader'
                ]
            }, 
            {
                test: /\.scss$/,
                use: extractSass.extract({
                    fallback: 'style-loader',
                    use: [
                        {
                            loader: 'css-loader',
                            options: {
                                module: true,
                                localIdentName: '[local]___[hash:base64:5]'
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
                })
            }, 
            {
                test: /\.(png|jpg|)$/,
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
    plugins: [
        extractSass,
        new webpack.optimize.CommonsChunkPlugin({
            names: ['vendors', 'antd'],
            filename: '[name].min.js',
            minChunks: Infinity
        }),
        new webpack.ProvidePlugin({
            "React": "react",
        }),
        new webpack.LoaderOptionsPlugin({
            minimize: true,
            debug: false
        }),
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify('production')
            }
        }),
        new webpack.LoaderOptionsPlugin({
            postcss: {
                sourceMap: true,
                plugins: () => [autoprefixer],
            }
        }),
        new webpack.optimize.UglifyJsPlugin({
            beautify: false,
            minimize: true,
            comments: false,
            mangle: {
                screw_ie8: true,
                keep_fnames: true
            },
            compress: {
                warnings: false,
                screw_ie8: true
            }
        })
    ]
}