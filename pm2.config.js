module.exports = {
    name: 'bowl-server',
    script: '/usr/lib/node_modules/ts-node/dist/bin.js',  // Path to ts-node executable
    args: 'src/index.ts',                      // Replace with the entry file of your TypeScript app
    watch: false,                              // Disable watching for production environments
    exec_mode: 'fork',                         // Use fork mode for a single instance
    instances: 1,                              // Limit to one instance
  };