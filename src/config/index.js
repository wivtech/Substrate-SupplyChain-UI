import configCommon from './common.json';
import BN from 'bn.js';

// Using `require` as `import` does not support dynamic loading (yet).
const configEnv = require(`./${process.env.NODE_ENV}.json`);

// Accepting React env vars and aggregating them into `config` object.
const envVarNames = [
  'REACT_APP_PROVIDER_SOCKET',
  'REACT_APP_DEVELOPMENT_KEYRING'
];
const envVars = envVarNames.reduce((mem, n) => {
  // Remove the `REACT_APP_` prefix
  if (process.env[n] !== undefined) mem[n.slice(10)] = process.env[n];
  return mem;
}, {});

// Contract call endowments;
const endowment = new BN('1000000000000000');
const weight = new BN('1000000000000');

const config = { ...configCommon, ...configEnv, ...envVars, callParams: { endowment, weight } };
export default config;
