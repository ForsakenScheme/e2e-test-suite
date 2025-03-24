// global-teardown.js
const { bsLocal } = require('./browserstack.config');
const { promisify } = require('util');
const sleep = promisify(setTimeout);
require('dotenv').config();

module.exports = async () => {
  // Only stop the Local instance if USE_BROWSERSTACK is true and it's running
  if (process.env.USE_BROWSERSTACK === 'true' && bsLocal && bsLocal.isRunning()) {
    // Stop the Local instance after your test run is completed, i.e after driver.quit
    let localStopped = false;

    bsLocal.stop(() => {
      localStopped = true;
      console.log('Stopped BrowserStack Local');
    });
    while (!localStopped) {
      await sleep(1800);
    }
  } else {
    console.log('No BrowserStack Local instance to stop');
  }
  console.log('Test run completed');
};
