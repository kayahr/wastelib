/* eslint-disable */
const path = require("path");
const webpack = require("webpack");
const pkg = require("./package.json");

module.exports = {
    entry: `./lib/main/wastelib.js`,
    output: {
        libraryTarget: "umd",
        library: "wastelib",
        path: path.join(__dirname, "dist"),
        filename: `wastelib.js`,
        globalObject: "typeof self !== 'undefined' ? self : this"
    },
    mode: "production",
    externals: {
        canvas: "empty"
    },
    devtool: "source-map",
    optimization: {
        minimize: true
    },
    plugins: [
        new webpack.BannerPlugin(
            `wastelib ${pkg.version}\n` +
            `Copyright (C) 2016 ${pkg.author.name} <${pkg.author.email}>\n` +
            `${pkg.homepage}`
        )
    ]
}
