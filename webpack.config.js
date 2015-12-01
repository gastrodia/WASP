var webpack = require('webpack');
var uglifyJsPlugin = webpack.optimize.UglifyJsPlugin;
module.exports = {
    entry: "./Engine/Build/Wasp.js",
    output: {
        path: __dirname,
        filename: "./Engine/Build/Wasp.all.js"
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
