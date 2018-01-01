import baseConfig from './base';

const config = {
  appEnv: 'dist',
  apiUrl: 'https://adsb.nickscherman.com',
  apiPort: '8006'
};

export default Object.freeze(Object.assign({}, baseConfig, config));
