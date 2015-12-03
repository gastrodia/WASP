var webpack = require('webpack');
var uglifyJsPlugin = webpack.optimize.UglifyJsPlugin;
module.exports = {
    entry: "./Build/WaspRuntime.js",
    output: {
        path: __dirname,
        filename: "./Build/wasp-runtime.js"
    },
    module: {
        loaders: [
            { test: /\.css$/, loader: "style-loader!css-loader" }
        ]
    }
    // ,
    // plugins: [
    //     new uglifyJsPlugin({
    //         compress: {
    //             warnings: false
    //         }
    //     })
    // ]
};
