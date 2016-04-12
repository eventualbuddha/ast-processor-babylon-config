import config from './rollup.config.js';

config.dest = 'dist/ast-processor-babylon-config.js';
config.format = 'umd';
config.moduleName = 'ASI';

export default config;
