// global-setup.js
const { bsLocal, BS_LOCAL_ARGS, url, isBrowserstackAvailable } = require('./browserstack.config');
const { promisify } = require('util');
const sleep = promisify(setTimeout);
const redColour = '\x1b[31m';
const whiteColour = '\x1b[0m';

module.exports = async () => {
  console.log('Starting test run...');
  
  // Skip Browserstack setup if credentials are not available
  if (!isBrowserstackAvailable) {
    console.log(`${redColour}Browserstack credentials not found or empty in .env file. Skipping Browserstack setup.${whiteColour}`);
    return;
  }
  
  // Starts the Local instance with the required arguments
  let localResponseReceived = false;
  bsLocal.start(BS_LOCAL_ARGS, (err) => {
    localResponseReceived = true;
  });
  while (!localResponseReceived) {
    await sleep(1800);
  }
};
