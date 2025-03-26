const base = require('@playwright/test');
const { firefox, chromium, test } = require('@playwright/test');
const { patchCaps, patchMobileCaps, caps, isBrowserstackAvailable } = require('./browserstack.config.js');
require('dotenv').config();
const { _android: android } = require('playwright');

// replace YOUR_ACCESS_KEY with your key. You can also set an environment variable - "BROWSERSTACK_ACCESS_KEY".
exports.BS_LOCAL_ARGS = {
  key: process.env.BROWSERSTACK_ACCESS_KEY || 'ACCESSKEY'
};

let browser;
let loggedin;
let browserName;
let device;
let mobile;
let context;

exports.test = base.test.extend({
  page: async ({ page, playwright }, use, testInfo) => {
    test.setTimeout(210000);
    browserName = testInfo.project.name.split(/@/)[0];
    loggedin = testInfo.titlePath[0].match(/loggedin/) || testInfo.titlePath[0].match(/signedin/);
    
    // Skip Browserstack tests if credentials are not available
    if (testInfo.project.name.match(/browserstack/) && !isBrowserstackAvailable) {
      test.skip(true, 'Browserstack credentials not found or empty in .env file');
      return;
    }
    
    if (testInfo.project.name.match(/browserstack/) && isBrowserstackAvailable) {
      const mobile = testInfo.project.use.mobile;
      if (mobile) {
        patchMobileCaps(
          testInfo.project.name,
          `${testInfo.file} - ${testInfo.title}`
        );
        device = await playwright._android.connect(
          `wss://cdp.browserstack.com/playwright?caps=${encodeURIComponent(
            JSON.stringify(caps)
          )}`
        );
        await device.shell('am force-stop com.android.chrome');
        browser = await device.launchBrowser({ storageState: 'auth/mainuser.json', permissions: ['clipboard-read', 'clipboard-write'], locale: 'en-GB' });
        context = browser;
      } else {
        patchCaps(testInfo.project.name, `${testInfo.title}`);
        delete caps.osVersion;
        delete caps.deviceName;
        delete caps.realMobile;
        browser = await playwright.chromium.connect({
          wsEndpoint:
            'wss://cdp.browserstack.com/playwright?caps=' +
            `${encodeURIComponent(JSON.stringify(caps))}`
        });
        if (browserName === 'chrome' || browserName === 'edge') {
          if (loggedin) {
            context = await browser.newContext({ storageState: 'auth/mainuser.json', permissions: ['clipboard-read', 'clipboard-write'], locale: 'en-GB' });
          } else {
            context = await browser.newContext({ permissions: ['clipboard-read', 'clipboard-write'], locale: 'en-GB' });
          }
        } else {
          if (loggedin) {
            context = await browser.newContext({ storageState: 'auth/mainuser.json', permissions: [], locale: 'en-GB' });
          } else {
            context = await browser.newContext({ permissions: [], locale: 'en-GB' });
          }
        }
      }
      page = await context.newPage();
      await use(page);
      if (mobile) {
        await device.close();
      } else {
        await browser.close();
      }
    } else {
      if (mobile) {
        const [device] = await android.devices();
        await device.shell('am force-stop com.android.chrome');
        if (loggedin) {
          context = await device.launchBrowser({ permissions: ['clipboard-read', 'clipboard-write', 'notifications'], storageState: 'auth/mainuser.json' });
        } else {
          context = await device.launchBrowser({ permissions: ['clipboard-read', 'clipboard-write', 'notifications'] });
        }
      } else {
        if (browserName === 'chrome' || browserName === 'edge') {
          browser = await chromium.launch();
          if (loggedin) {
            context = await browser.newContext({ permissions: ['clipboard-read', 'clipboard-write', 'notifications'], storageState: 'auth/mainuser.json', locale: 'en-GB' });
          } else {
            context = await browser.newContext({ permissions: ['clipboard-read', 'clipboard-write', 'notifications'], locale: 'en-GB' });
          }
        } else {
          browser = await firefox.launch({
            firefoxUserPrefs: {
              'dom.events.asyncClipboard.readText': true,
              'dom.events.testing.asyncClipboard': true
            }
          });
          if (loggedin) {
            context = await browser.newContext({ storageState: 'auth/mainuser.json', permissions: [] });
          } else {
            context = await browser.newContext({ permissions: [] });
          }
        }
      }
      page = await context.newPage();
      await use(page);
      await browser.close();
    }
  },

  beforeEach: [
    test.setTimeout(2400000)
  ],
  afterEach: [
    async ({ page }, use) => {
      await use();
      page.close();
    }
  ]
});

/// GLOBAL VARIABLES///

exports.url = process.env.PW_URL;

exports.mainAccountPassword = process.env.MAINACCOUNTPASSWORD;
exports.testUserPassword = process.env.TESTUSERPASSWORD;
exports.testUser2Password = process.env.TESTUSER2PASSWORD;
exports.testUser3Password = process.env.TESTUSER3PASSWORD;

const date = new Date();
const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const weekday = days[date.getDay()];
exports.weekday = weekDays[date.getDay()];
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const month = months[date.getMonth()];
exports.titleDateComma = `${weekday}, ${date.getDate()} ${month} ${date.getFullYear()}`;
exports.titleDate = `${weekday} ${date.getDate()} ${month} ${date.getFullYear()}` || `${weekday}, ${date.getDate()} ${month} ${date.getFullYear()}`

const setTimeZone = new Date().toLocaleString('en-US', { timeZone: 'Europe/London' });
const now = new Date(setTimeZone);

const monthNumeric = now.getMonth() + 1;
const monthFormatted = monthNumeric.toString().length > 1 ? monthNumeric : '0' + monthNumeric;

const today = now.getDate();
const todayFormatted = today.toString().length > 1 ? today : '0' + today;

exports.dateTodayDashFormat = now.getFullYear() + '-' + monthFormatted + '-' + todayFormatted;
exports.dateTodaySlashFormat = todayFormatted + '/' + monthFormatted + '/' + now.getFullYear();

const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
const nextWeekDate = nextWeek.getDate();
const nextWeekMonthNumeric = nextWeek.getMonth() + 1;
const nextWeekMonthFormatted = nextWeekMonthNumeric.toString().length > 1 ? nextWeekMonthNumeric : '0' + nextWeekMonthNumeric;

const nextWeekFormatted = nextWeekDate.toString().length > 1 ? nextWeekDate : '0' + nextWeekDate;
exports.nextWeekSlashFormat = nextWeekFormatted + '/' + nextWeekMonthFormatted + '/' + nextWeek.getFullYear();

const nextMonday = new Date();
nextMonday.getDay() !== 0 ? nextMonday.setDate(nextMonday.getDate() + (((1 + 7 - nextMonday.getDay()) % 7) || 7)) : nextMonday.setDate(nextMonday.getDate() + 8);
const nextMondayFormatted = nextMonday.getDate().toString().length > 1 ? nextMonday.getDate() : '0' + nextMonday.getDate();
const nextMondayMonth = nextMonday.getMonth() + 1;

const nextMondayMonthFormatted = nextMondayMonth.toString().length > 1 ? nextMondayMonth : '0' + nextMondayMonth;
exports.nextMondayDashFormat = nextMonday.getFullYear() + '-' + nextMondayMonthFormatted + '-' + nextMondayFormatted;
exports.nextMondaySlashFormat = nextMondayFormatted + '/' + nextMondayMonthFormatted + '/' + nextMonday.getFullYear();

const nextMondayMonthString = months[nextMonday.getMonth()];
exports.nextMondayStringFormat = `${nextMondayMonthString} ${nextMonday.getDate()}, ${nextMonday.getFullYear()}`;

exports.year = now.getFullYear();
exports.minutes = now.getMinutes().toString().length > 1 ? now.getMinutes() : '0' + now.getMinutes();
exports.hours = now.getHours();
const monthString = months[now.getMonth()];
exports.todayStringFormat = `${monthString} ${now.getDate()}, ${now.getFullYear()}`;
