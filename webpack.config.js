var webpack = require('webpack');
var uglifyJsPlugin = webpack.optimize.UglifyJsPlugin;
module.exports = {
    entry: "./Engine/Build/Test/main.js",
    output: {
        path: __dirname,
        filename: "bundle.js"
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
