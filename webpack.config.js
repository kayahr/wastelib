const path = require("path");
const webpack = require("webpack");
const pkg = require('./package.json');

module.exports = {
    entry: `./lib/main/${pkg.name}.js`,
    output: {
        libraryTarget: "umd",
        library: pkg.name,
        filename: `${pkg.name}.js`,
        path: path.join(__dirname, "lib")
    },
    devtool: "source-map",
    plugins: [
        new webpack.LoaderOptionsPlugin({
            minimize: true,
            debug: false
        }),
        new webpack.optimize.UglifyJsPlugin({
            sourceMap: false,
            output: {
                comments: false
            }
        }),
        new webpack.BannerPlugin(
            `${pkg.name} ${pkg.version}\n` +
            `Copyright (C) 2016 ${pkg.author.name} <${pkg.author.email}>\n` +
            `${pkg.homepage}`
        )
    ]
}
