// Generated using webpack-cli https://github.com/webpack/webpack-cli

const path = require('path');

const isProduction = process.env.NODE_ENV == 'production';

const stylesHandler = 'style-loader';

const config = {
    entry: {
     app: "./src/scripts/app.js",
     docs: "./src/scripts/docs.js",
     home: "./src/scripts/home.js", 
     auth: "./src/scripts/auth.js",
     new: "./src/scripts/new.js",
     friends: "./src/scripts/friends.js",
     recent: "./src/scripts/recent.js", 
    },
    output: {
        path: path.resolve(__dirname, 'dist/scripts'),
        clean: true
    },
    devServer: {
        open: true,
        host: 'localhost',
    },
    plugins: [
        // Add your plugins here
        // Learn more about plugins from https://webpack.js.org/configuration/plugins/
    ],
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/i,
                loader: 'babel-loader',
            },
            {
                test: /\.css$/i,
                use: [{loader: "file-loader", options: {outputPath: "../styles", name: "[name].[ext]"}}, 'postcss-loader'],
            },
            {
                test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
                type: 'asset/inline',
            },

            // Add your rules for custom modules here
            // Learn more about loaders from https://webpack.js.org/loaders/
        ],
    },
};

module.exports = () => {
    if (isProduction) {
        config.mode = 'production';
        
        
    } else {
        config.mode = 'development';
    }
    return config;
};
