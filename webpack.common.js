const path = require("path");
const fs = require("fs");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

const appDirectory = fs.realpathSync(process.cwd());

module.exports = {
    entry: path.resolve(appDirectory, "src/index.ts"),
    output: {
        filename: "js/babylonBundle.js",
        path: path.resolve("./dist/"),
    },
    resolve: {
        extensions: [".ts", ".js"],
        alias: {
            '@babylonjs/havok': path.resolve(__dirname, 'node_modules/@babylonjs/havok')
        }
    },
    module: {
        rules: [
            {
                test: /\.(js|mjs|jsx|ts|tsx)$/,
                loader: "source-map-loader",
                enforce: "pre",
            },
            {
                test: /\.tsx?$/,
                loader: "ts-loader",               
                exclude: /node_modules/,
            },
            {
                test: /\.(glsl|vs|fs)$/,
                loader: "ts-shader-loader",
                exclude: /node_modules/,
            },
            {
                test: /\.(mp3|wav|ogg|mp4|glb|hdr)$/i,
                use: [
                    {
                        loader: "file-loader",
                    },
                ],
            },
            {
                test: /\.(png|jpg|gif|env|gltf|stl|dds|json)$/i,
                use: [
                    {
                        loader: "url-loader",
                        options: {
                            limit: 4096,
                        },
                    },
                ],
                type: 'javascript/auto'
            },
        ],
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            inject: true,
            favicon: "public/favicon.ico",
            template: path.resolve(appDirectory, "public/index.html"),
        }),
    ],
};
