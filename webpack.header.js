const path = require('path')
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ESLintPlugin = require('eslint-webpack-plugin')
const deps = require("./package.json").dependencies

module.exports = {
  mode: 'development', // 開発モードビルド
  // ビルド対象のアプリケーションのエントリーファイル
  entry: [
    'core-js/modules/es.promise', // IEでPromiseを使えるようにする
    'core-js/modules/es.array.iterator', // IEでArrayのiteratorを使えるようにする
    './src/header/index.tsx',
  ],
  devServer: {
    port: 3002,
  },
  devtool: 'inline-cheap-module-source-map', // ソースマップを出力するための設定、ソースマップファイル（.map）が存在する場合、ビルド前のソースファイルでデバッグができる
  output: {
    path: path.resolve(__dirname, 'dist'), // 出力するフォルダ名(dist)
    filename: 'bundle-header.js', // 出力するメインファイル名
    publicPath: 'auto', // ホスティングするフォルダ
  },
  resolve: {
    modules: ['node_modules'],
    extensions: ['.js', '.ts', '.tsx'],
  },
  module: {
    rules: [
      {
        test: /\.ts(x?)$/, // .ts .tsxがbabelのビルド対象
        exclude: /node_modules/, // 関係のないnode_modulesはビルドに含めない
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                [
                  '@babel/preset-env',
                  {
                    useBuiltIns: 'usage',
                    corejs: 'core-js@3',
                  },
                ],
                '@babel/preset-typescript',
                '@babel/preset-react',
              ],
              plugins: [
                '@babel/plugin-proposal-optional-chaining',
              ],
            },
          }, // babel
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
      inject: 'body',
      excludeChunks: ['header_app'],
    }),
    new ModuleFederationPlugin({
      name: 'header_app',
      filename: 'header.js',
      exposes: {
        './Header': './src/header/Header.tsx',
      },
      shared: {
        react: {
          requiredVersion: deps.react,
          singleton: true
        },
        'react-dom': {
          requiredVersion: deps['react-dom'],
          singleton: true
        },
      },
    }),
    new ESLintPlugin({
      extensions: [ '.ts', '.tsx' ],
      exclude: 'node_modules',
    }),
  ],
}