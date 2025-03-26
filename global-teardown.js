// global-teardown.js
const { bsLocal, isBrowserstackAvailable } = require('./browserstack.config');
const { promisify } = require('util');
const sleep = promisify(setTimeout);
module.exports = async () => {
  // Skip Browserstack teardown if credentials are not available
  if (!isBrowserstackAvailable) {
    console.log('Browserstack credentials not found or empty in .env file. Skipping Browserstack teardown.');
    return;
  }
  
  // Stop the Local instance after your test run is completed, i.e after driver.quit
  let localStopped = false;

  if (bsLocal && bsLocal.isRunning()) {
    bsLocal.stop(() => {
      localStopped = true;
      console.log('Stopped test run');
    });
    while (!localStopped) {
      await sleep(180000);
    }
  }
};
