var pkg = require('./package.json');
var webpack = require("webpack");

module.exports = {
    entry: `./lib/main/${pkg.name}.js`,
    output: {
        libraryTarget: "umd",
        library: pkg.name,
        filename: `./lib/${pkg.name}.js`
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            minimize: true,
            mangle: true
        }),
        new webpack.BannerPlugin(
            `${pkg.name} ${pkg.version}\n` +
            `Copyright (C) 2016 ${pkg.author.name} <${pkg.author.email}>\n` +
            `${pkg.homepage}`
        )
    ],
    devtool: "source-map",
    module: {
        preLoaders: [
            {
                test: /\.js$/,
                loader: "source-map-loader"
            }
        ]
    }
}