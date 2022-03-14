// vue.config.js
module.exports = {
    devServer: {
        proxy: {
            "/coordinates.json": {
                target: "https://kz.skif.me",
                changeOrigin: true,
                secure: false,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "GET, POST, PATCH, PUT, DELETE, OPTIONS",
                    "Access-Control-Allow-Headers": "Origin, Content-Type, X-Auth-Token"
                }
            }
        }
    }
};