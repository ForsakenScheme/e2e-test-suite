// global-setup.js
const { bsLocal, BS_LOCAL_ARGS, url } = require('./browserstack.config');
const { promisify } = require('util');
const sleep = promisify(setTimeout);
const redColour = '\x1b[31m';
const whiteColour = '\x1b[0m';
require('dotenv').config();

module.exports = async () => {
  console.log('Starting test run...');
  
  // Only start BrowserStack Local if USE_BROWSERSTACK is true
  if (process.env.USE_BROWSERSTACK === 'true') {
    // Starts the Local instance with the required arguments
    let localResponseReceived = false;
    bsLocal.start(BS_LOCAL_ARGS, (err) => {
      if (err) {
        console.error(
          `${redColour}Error starting BrowserStackLocal${whiteColour}`
        );
      } else {
        console.log('BrowserStackLocal Started');
      }
      localResponseReceived = true;
    });
    while (!localResponseReceived) {
      await sleep(1800);
    }
  } else {
    console.log('Skipping BrowserStack Local setup as USE_BROWSERSTACK is not set to true');
  }
};
