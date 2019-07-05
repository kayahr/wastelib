const path = require("path");
const webpack = require("webpack");
const pkg = require('./package.json');

module.exports = {
    entry: `./lib/main/${pkg.name}.js`,
    output: {
        libraryTarget: "umd",
        library: pkg.name,
        path: path.join(__dirname, "dist"),
        filename: `${pkg.name}.js`,
        globalObject: "typeof self !== 'undefined' ? self : this"
    },
    mode: "production",
    externals: {
        canvas: "empty"
    },
    devtool: "source-map",
    plugins: [
        new webpack.LoaderOptionsPlugin({
            minimize: true,
            debug: false
        }),
        new webpack.BannerPlugin(
            `${pkg.name} ${pkg.version}\n` +
            `Copyright (C) 2016 ${pkg.author.name} <${pkg.author.email}>\n` +
            `${pkg.homepage}`
        )
    ]
}
