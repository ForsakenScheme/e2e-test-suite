const { test, expect } = require('@playwright/test');
const { chromium } = require('@playwright/test');


// const url = 'http://localhost:3000'
const url = 'https://cryptpad.fr'


// // ANONYMOUS USER


let browser;
let page;

// test.beforeEach(async () => {
//   browser = await chromium.launch();
//   page = await browser.newPage();
//   await page.goto(`${url}`);
// });

// test('form - anon', async ({ }) => {
//   try {
//     test.setTimeout(240000)
//     await page.goto(`${url}`);
//     await page.getByRole('link', { name: 'Form' }).click();
//     await page.waitForLoadState('networkidle');
//      await expect(page).toHaveURL(new RegExp(`^${url}/form/#/`), { timeout: 100000 })
//     await page.waitForTimeout(20000)
//     const iframe = page.locator('#sbox-iframe')

//     await expect(iframe).toBeVisible({ timeout: 24000 })

//     // await iframe.click()
//     // await iframe.type('Test text')
   
//     await page.evaluate(_ => {}, `browserstack_executor: ${JSON.stringify({action: 'setSessionStatus',arguments: {name: 'form', status: 'passed',reason: 'Can anonymously create Form'}})}`);
//   } catch (e) {
//     console.log(e);
//     await page.evaluate(_ => {}, `browserstack_executor: ${JSON.stringify({action: 'setSessionStatus',arguments: {name: 'form', status: 'failed',reason: 'Can\'t anonymously create Form'}})}`);

//   }  

// });

// test.afterEach(async () => {
//   await browser.close()
// });