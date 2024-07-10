module.exports = {
    name: 'bowl-server',
    script: 'npx',
    args: 'ts-node src/index.ts',
    watch: false,
    exec_mode: 'fork',
    instances: 1,
  };