module.exports = {
  apps: [
    {
      name: "AV-Master-Proxy",
      script: "./index.js",
      env_pro: {
        ENV: "pro",
        PORT: 7771,
      },
    },
  ],
};
