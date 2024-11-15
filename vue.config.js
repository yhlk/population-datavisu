const { defineConfig } = require("@vue/cli-service");

module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: process.env.VUE_APP_BRANCH || "/", // Dynamically set publicPath based on environment variable
});
