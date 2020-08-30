const webpack = require('webpack');
const { InjectManifest } = require("workbox-webpack-plugin");
const path = require("path");
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';

  // In dev mode we use ForkTsCheckerWebpackPlugin for type checking, which is faster when re-compiling
  const tsConfigOptions = isProduction ? {} : {
    transpileOnly: true,
    experimentalWatchApi: true,
  }

  return {
    entry: './src/index.tsx',
    devtool: 'source-map',
    module: {
      rules: [
        {
          test: /\.s[ac]ss$/i,
          use: [
            // Creates `style` nodes from JS strings
            'style-loader',
            // Translates CSS into CommonJS
            'css-loader',
            // Compiles Sass to CSS
            'sass-loader',
          ],
        },
        {
          test: /\.tsx?$/,
          enforce: 'pre',
          include: [path.resolve(__dirname, './src'), path.resolve(__dirname, './service-worker')],
          use: [
            { loader: 'eslint-loader', options: { emitErrors: true } },
          ],
        },
        // Loader for TypeScript files in ./src
        {
          test: /\.tsx?$/,
          include: path.resolve(__dirname, './src'),
          exclude: [/node_modules/],
          use: [
            {
              loader: 'babel-loader',
              options: { babelrc: true },
            },
            {
              loader: 'ts-loader',
              options: {
                ...tsConfigOptions,
                configFile: path.resolve(__dirname, './src/tsconfig.json'),
              }
            },
          ]
        },
        // Loader for service-worker TypeScript files
        {
          test: /\.tsx?$/,
          include: path.resolve(__dirname, './service-worker'),
          exclude: [/node_modules/],
          use: [
            {
              loader: 'babel-loader',
              options: { babelrc: true },
            },
            {
              loader: 'ts-loader',
              options: {
                ...tsConfigOptions,
                configFile: path.resolve(__dirname, './service-worker/tsconfig.json'),
              },
            },
          ]
        },
      ],
    },
    resolve: {
      extensions: [ '.tsx', '.ts', '.js' ],
    },
    output: {
      path: path.resolve(__dirname, './dist'),
      publicPath: '/',
    },
    plugins: [
      new HtmlWebpackPlugin({
        filename: 'index.html',
        template: './index.html',
      }),

      new CopyWebpackPlugin({
        patterns: [
          { from: path.resolve(__dirname, './public') },
        ],
      }),

      new webpack.HotModuleReplacementPlugin(),
      ...(isProduction ? [
        new InjectManifest({
          swSrc: path.resolve(__dirname, './service-worker/serviceWorkerWorkbox.ts'),
          swDest: 'service-worker.js',
        }),
      ] : [
        new ForkTsCheckerWebpackPlugin({
          tsconfig: path.resolve(__dirname, './src/tsconfig.json'),
        }),
      ]),
    ],
    devServer: {
      port: 5000,
      open: true,
      inline: true,
      compress: false,
      hot: true,
    },
  };
};
