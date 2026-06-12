module.exports = {
  apps: [{
    name: "canil-api",
    script: "./dist/server.cjs",
    instances: "max",
    exec_mode: "cluster",
    env: {
      NODE_ENV: "development",
    },
    env_production: {
      NODE_ENV: "production",
    }
  }]
}
