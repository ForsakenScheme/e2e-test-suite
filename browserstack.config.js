require('dotenv').config();
const cp = require('child_process');
const clientPlaywrightVersion = cp
  .execSync('npx playwright --version')
  .toString()
  .trim()
  .split(' ')[1];
const BrowserStackLocal = require('browserstack-local');

// Check if Browserstack credentials are set and not empty
const isBrowserstackAvailable = !!(
  process.env.BROWSERSTACK_USERNAME && 
  process.env.BROWSERSTACK_ACCESS_KEY &&
  process.env.BROWSERSTACK_USERNAME.trim() !== '' &&
  process.env.BROWSERSTACK_ACCESS_KEY.trim() !== ''
);

exports.isBrowserstackAvailable = isBrowserstackAvailable;

// BrowserStack Specific Capabilities
const caps = {
  name: 'my playwright test',
  build: 'localhost-5',
  'browserstack.username': process.env.BROWSERSTACK_USERNAME,
  'browserstack.accessKey': process.env.BROWSERSTACK_ACCESS_KEY,
  'browserstack.local': !!process.env.PW_URL?.includes('localhost'),
  // "browserstack.idleTimeout" : "300",
  'browserstack.playwrightVersion': clientPlaywrightVersion,
  'bstack:options': {
    timezone: 'London'
  }
};

exports.patchMobileCaps = (name, title) => {
  const combination = name.split(/@browserstack/)[0];
  const [browerCaps, osCaps] = combination.split(/:/);
  const [browser, deviceName] = browerCaps.split(/@/);
  const osCapsSplit = osCaps.split(/ /);
  const osVersion = osCapsSplit.join(' ');
  caps.browser = browser || 'chrome';
  caps.deviceName = deviceName || 'Samsung Galaxy S22 Ultra';
  caps.osVersion = osVersion || '12.0';
  caps.name = title;
  caps.realMobile = 'true';
  // 'bstack:options' = {
  //   "timezone" : "London",
  // }
};

exports.caps = caps;
exports.bsLocal = isBrowserstackAvailable ? new BrowserStackLocal.Local() : null;

exports.BS_LOCAL_ARGS = {
  key: process.env.BROWSERSTACK_ACCESS_KEY
};

// Patching the capabilities dynamically according to the project name.
exports.patchCaps = (name, title) => {
  const combination = name.split(/@browserstack/)[0];
  const [browerCaps, osCaps] = combination.split(/:/);
  const [browser, browser_version] = browerCaps.split(/@/);
  const osCapsSplit = osCaps.split(/ /);
  const os = osCapsSplit.shift();
  const os_version = osCapsSplit.join(' ');
  caps.browser = browser || 'chrome';
  caps.browser_version = browser_version || 'latest';
  caps.os = os || 'osx';
  caps.os_version = os_version || 'catalina';
  caps.name = name;
  caps.title = title;
  caps.firefox_user_prefs = { 'dom.events.asyncClipboard.readText': true, 'dom.events.testing.asyncClipboard': true };
};

exports.getCdpEndpoint = (name, title) => {
  patchCaps(name, title);
  const cdpUrl = `wss://cdp.browserstack.com/playwright?caps=${encodeURIComponent(JSON.stringify(caps))}`;
  return cdpUrl;
};
