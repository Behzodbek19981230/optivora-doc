module.exports = {
  apps: [
    {
      name: 'optivora-doc',
      cwd: __dirname,

      // This project is configured with `output: "export"` in `next.config.js`,
      // so production is served from the static `out/` directory.
      script: 'npx',

      // Use an explicit listen URI to avoid "random port" fallback behavior.
      args: ['-y', 'serve@14.2.5', '-s', 'out', '-l', 'tcp://0.0.0.0:3007'],
      env: {
        NODE_ENV: 'production'
      },
      autorestart: true,
      max_memory_restart: '500M',
      time: true
    }
  ]
}
