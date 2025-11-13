// backend/switch-api.js
const fs = require('fs');
const path = require('path');
const config = require('./config');

function switchApi(apiName) {
  if (!config.endpoints[apiName]) {
    console.error(`Invalid API name. Available options: ${Object.keys(config.endpoints).join(', ')}`);
    process.exit(1);
  }

  config.activeApi = apiName;
  const configPath = path.join(__dirname, 'config.js');
  fs.writeFileSync(configPath, `module.exports = ${JSON.stringify(config, null, 2)}`);
  console.log(`Switched to ${apiName} API: ${config.endpoints[apiName]}`);
}

const newApi = process.argv[2];
if (!newApi) {
  console.log(`Current API: ${config.activeApi}`);
  console.log('Usage: node switch-api.js [org|local]');
} else {
  switchApi(newApi);
}