const { test, url } = require('../fixture.js');
const { expect } = require('@playwright/test');
const { FileActions } = require('./fileactions.js');

const fs = require('fs');
require('dotenv').config();

const local = !!process.env.PW_URL.includes('localhost');

let mobile;
let browserName;
let browserstackMobile;
let fileActions;

test.beforeEach(async ({ page }, testInfo) => {
  test.setTimeout(210000);

  mobile = testInfo.project.use.mobile;
  browserName = testInfo.project.name.split(/@/)[0];
  browserstackMobile = testInfo.project.name.match(/browserstack-mobile/);
  await page.goto(`${url}/pad`);
  fileActions = new FileActions(page);

  // await page.waitForTimeout(10000);
});

test('pad - comment', async ({ page, context }) => {
  try {
    await fileActions.padeditor.locator('body').waitFor();
    await expect(fileActions.padeditor.locator('body')).toBeVisible();
    await fileActions.padeditor.locator('body').click();

    await fileActions.padeditor.locator('body').fill('TEST TEXT');
    await fileActions.padeditor.getByText('TEST TEXT').click({
      clickCount: 3
    });
    await page.frameLocator('#sbox-iframe').locator('.cp-comment-bubble').locator('button').click();
    await page.frameLocator('#sbox-iframe').getByRole('textbox', { name: 'Comment' }).fill('Test comment');
    await page.frameLocator('#sbox-iframe').getByRole('button', { name: 'Submit' }).click();
    await expect(page.frameLocator('#sbox-iframe').getByText('Test comment', { exact: true })).toBeVisible();

    await page.evaluate(_ => {}, `browserstack_executor: ${JSON.stringify({ action: 'setSessionStatus', arguments: { name: 'pad > comment', status: 'passed', reason: 'Can create comment in Rich Text document' } })}`);
  } catch (e) {
    console.log(e);
    await page.evaluate(_ => {}, `browserstack_executor: ${JSON.stringify({ action: 'setSessionStatus', arguments: { name: 'pad > comment', status: 'failed', reason: 'Can\'t create comment in Rich Text document' } })}`);
  }
});

test('pad - create and open snapshot', async ({ page, context }) => {
  try {
    await fileActions.padeditor.locator('body').waitFor();
    await expect(fileActions.padeditor.locator('body')).toBeVisible();
    await fileActions.padeditor.locator('body').click();
    await fileActions.padeditor.locator('body').fill('TEST TEXT');
    // await page.waitForTimeout(5000);

    await fileActions.filemenuClick(mobile);
    // await page.waitForTimeout(1000);
    await page.frameLocator('#sbox-iframe').getByText('Snapshots').waitFor();
    await page.frameLocator('#sbox-iframe').getByText('Snapshots').click();
    // await page.waitForTimeout(1000);
    await page.frameLocator('#sbox-iframe').getByPlaceholder('Snapshot title').waitFor();
    await page.frameLocator('#sbox-iframe').getByPlaceholder('Snapshot title').fill('snap1');
    // await page.waitForTimeout(1000);
    await page.frameLocator('#sbox-iframe').getByRole('button', { name: 'New snapshot' }).waitFor();
    await page.frameLocator('#sbox-iframe').getByRole('button', { name: 'New snapshot' }).click();
    // await page.waitForTimeout(1000);
    await fileActions.closeButton.waitFor();
    await fileActions.closeButton.click();
    await fileActions.padeditor.locator('body').fill('');

    await fileActions.filemenuClick(mobile);
    await page.frameLocator('#sbox-iframe').getByText('Snapshots').waitFor();
    await page.frameLocator('#sbox-iframe').getByText('Snapshots').click();
    await page.frameLocator('#sbox-iframe').getByText('snap1').waitFor();
    await page.frameLocator('#sbox-iframe').getByText('snap1').click();
    // await page.waitForTimeout(10000);
    await page.frameLocator('#sbox-iframe').getByRole('button', { name: 'Open' }).waitFor();
    await page.frameLocator('#sbox-iframe').getByRole('button', { name: 'Open' }).click();
    await fileActions.padeditor.getByText('TEST TEXT').waitFor();
    await expect(fileActions.padeditor.getByText('TEST TEXT')).toBeVisible();

    await page.evaluate(_ => {}, `browserstack_executor: ${JSON.stringify({ action: 'setSessionStatus', arguments: { name: 'pad - create and open snapshot', status: 'passed', reason: 'Can create and open snapshot in Rich Text document' } })}`);
  } catch (e) {
    console.log(e);
    await page.evaluate(_ => {}, `browserstack_executor: ${JSON.stringify({ action: 'setSessionStatus', arguments: { name: 'pad - create and open snapshot', status: 'failed', reason: 'Can\'t create and open snapshot in Rich Text document' } })}`);
  }
});

test('pad - history (previous version)', async ({ page, context }) => {
  try {
    await fileActions.padeditor.locator('html').click();
    await fileActions.padeditor.locator('body').fill('Test text');

    await fileActions.history(mobile);

    await fileActions.historyPrev.click();
    await expect(page.frameLocator('#sbox-iframe').getByText('Test text')).toHaveCount(0);

    await page.evaluate(_ => {}, `browserstack_executor: ${JSON.stringify({ action: 'setSessionStatus', arguments: { name: 'pad - file menu - history (previous version)', status: 'passed', reason: 'Can create Rich Text document and view history (previous version)' } })}`);
  } catch (e) {
    console.log(e);
    await page.evaluate(_ => {}, `browserstack_executor: ${JSON.stringify({ action: 'setSessionStatus', arguments: { name: 'pad - file menu - history (previous version)', status: 'failed', reason: 'Can\'t create Rich Text document and view history (previous version)' } })}`);
  }
});

test('pad - toggle tools', async ({ page, context }) => {
  try {

    // await fileActions.toggleTools(mobile)
    if (mobile) {
      await expect(page.frameLocator('#sbox-iframe').locator('.cke_toolbox_main.cke_reset_all')).toBeHidden();
      await fileActions.toggleTools(mobile)
      await expect(page.frameLocator('#sbox-iframe').locator('.cke_toolbox_main.cke_reset_all')).toBeVisible();
      await fileActions.toggleTools(mobile)
      await expect(page.frameLocator('#sbox-iframe').locator('.cke_toolbox_main.cke_reset_all')).toBeHidden();
    } else {
      await page.frameLocator('#sbox-iframe').locator('.cke_toolbox_main.cke_reset_all').waitFor();
      await expect(page.frameLocator('#sbox-iframe').locator('.cke_toolbox_main.cke_reset_all')).toBeVisible();
      await fileActions.toggleTools(mobile)
      await expect(page.frameLocator('#sbox-iframe').locator('.cke_toolbox_main.cke_reset_all')).toBeHidden();
    }

    await page.evaluate(_ => {}, `browserstack_executor: ${JSON.stringify({ action: 'setSessionStatus', arguments: { name: 'pad - toggle tools', status: 'passed', reason: 'Can toggle Tools in Rich Text document' } })}`);
  } catch (e) {
    console.log(e);
    await page.evaluate(_ => {}, `browserstack_executor: ${JSON.stringify({ action: 'setSessionStatus', arguments: { name: 'pad - toggle tools', status: 'failed', reason: 'Can\'t toggle Tools in Rich Text document' } })}`);
  }
});

test('pad - import file', async ({ page }) => {
  test.skip(browserstackMobile, 'browserstack mobile import incompatibility');

  try {
    await fileActions.padeditor.locator('html').waitFor();
    // await page.waitForTimeout(10000);
    await fileActions.filemenuClick(mobile);
    const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      await fileActions.importClick()
    ]);
    await fileChooser.setFiles('testdocuments/myfile.html');

    // await page.waitForTimeout(3000);

    await expect(fileActions.padeditor.getByText('Test text here')).toBeVisible();

    await page.evaluate(_ => {}, `browserstack_executor: ${JSON.stringify({ action: 'setSessionStatus', arguments: { name: 'pad - import file', status: 'passed', reason: 'Can import file into Rich Text document' } })}`);
  } catch (e) {
    console.log(e);
    await page.evaluate(_ => {}, `browserstack_executor: ${JSON.stringify({ action: 'setSessionStatus', arguments: { name: 'pad - import file', status: 'failed', reason: 'Can\'t import file into Rich Text document' } })}`);
  }
});

test('pad - make a copy', async ({ page, context }) => {
  try {
    await fileActions.padeditor.locator('html').click();
    await expect(fileActions.padeditor.locator('body')).toBeVisible();
    await fileActions.padeditor.locator('body').click();
    await fileActions.padeditor.locator('body').fill('TEST TEXT');
    // await page.waitForTimeout(5000);
    await expect(fileActions.padeditor.getByText('TEST TEXT')).toBeVisible();

    await fileActions.filemenuClick(mobile);
    const [page1] = await Promise.all([
      page.waitForEvent('popup'),
      await fileActions.filecopy.click()
    ]);

    await expect(page1).toHaveURL(new RegExp(`^${url}/pad`), { timeout: 100000 });
    await page1.waitForTimeout(5000);
    await page1.frameLocator('#sbox-iframe').frameLocator('iframe[title="Editor\\, editor1"]').getByText('TEST TEXT').waitFor();
    await expect(page1.frameLocator('#sbox-iframe').frameLocator('iframe[title="Editor\\, editor1"]').getByText('TEST TEXT')).toBeVisible();

    await page.evaluate(_ => {}, `browserstack_executor: ${JSON.stringify({ action: 'setSessionStatus', arguments: { name: 'pad - make a copy', status: 'passed', reason: 'Can\'t make copy of Rich Text document' } })}`);
  } catch (e) {
    console.log(e);
    await page.evaluate(_ => {}, `browserstack_executor: ${JSON.stringify({ action: 'setSessionStatus', arguments: { name: 'pad - make a copy', status: 'failed', reason: 'Can\'t make copy of Rich Text document' } })}`);
  }
});

test('pad - export (html)', async ({ page }) => {
  try {
    await fileActions.padeditor.locator('body').waitFor();
    await expect(fileActions.padeditor.locator('body')).toBeVisible();
    await fileActions.padeditor.locator('body').click();
    await fileActions.padeditor.locator('body').fill('TEST TEXT');

    await fileActions.export(mobile);
    await page.frameLocator('#sbox-iframe').getByRole('textbox').fill('test pad');

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      await fileActions.okButton.click()
    ]);

    await download.saveAs('/tmp/test pad');

    const readData = fs.readFileSync('/tmp/test pad', 'utf8');
    console.log(readData);

    let expectedString;
    if (browserName === 'playwright-firefox') {
      expectedString = '<!DOCTYPEhtml><html><head><metacharset="utf-8"></head><body>TESTTEXT</body></html>';
    } else {
      expectedString = '<!DOCTYPEhtml><html><head><metacharset="utf-8"></head><body>TESTTEXT<p></p></body></html>';
    }
    console.log(expectedString);

    if (expectedString === readData.normalize().replace(/[\s]/g, '')) {
      await page.evaluate(_ => {}, `browserstack_executor: ${JSON.stringify({ action: 'setSessionStatus', arguments: { name: 'pad - export (html)', status: 'passed', reason: 'Can export Rich Text document as .html' } })}`);
    } else {
      await page.evaluate(_ => {}, `browserstack_executor: ${JSON.stringify({ action: 'setSessionStatus', arguments: { name: 'pad - export (html)', status: 'failed', reason: 'Can\'t export Rich Text document as .html' } })}`);
    }
  } catch (e) {
    console.log(e);
    await page.evaluate(_ => {}, `browserstack_executor: ${JSON.stringify({ action: 'setSessionStatus', arguments: { name: 'pad - export (html)', status: 'failed', reason: 'Can\'t export Rich Text document as .html' } })}`);
  }
});

test('pad - export (.doc)', async ({ page }) => {
  try {
    await fileActions.padeditor.locator('body').waitFor();
    await expect(fileActions.padeditor.locator('body')).toBeVisible();
    await fileActions.padeditor.locator('body').click();
    await fileActions.padeditor.locator('body').fill('TEST TEXT');

    await fileActions.export(mobile);
    await page.frameLocator('#sbox-iframe').getByRole('textbox').fill('test pad');
    await page.frameLocator('#sbox-iframe').getByRole('button', { name: ' .html' }).click();
    await page.frameLocator('#sbox-iframe').getByText('.doc').click();

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      await fileActions.okButton.click()
    ]);

    await download.saveAs('/tmp/test pad');

    const readData = fs.readFileSync('/tmp/test pad', 'utf8');

    let expectedString;
    if (browserName === 'playwright-firefox') {
      expectedString = "<htmlxmlns:o='urn:schemas-microsoft-com:office:office'xmlns:w='urn:schemas-microsoft-com:office:word'xmlns='http://www.w3.org/TR/REC-html40'><head><metacharset='utf-8'><title>ExportHTMLToDoc</title></head><body>TESTTEXT</body></html>";
    } else {
      expectedString = "<htmlxmlns:o='urn:schemas-microsoft-com:office:office'xmlns:w='urn:schemas-microsoft-com:office:word'xmlns='http://www.w3.org/TR/REC-html40'><head><metacharset='utf-8'><title>ExportHTMLToDoc</title></head><body>TESTTEXT<p></p></body></html>";
    }

    if (readData.trim().replace(/[\s]/g, '') === expectedString) {
      await page.evaluate(_ => {}, `browserstack_executor: ${JSON.stringify({ action: 'setSessionStatus', arguments: { name: 'pad - export (.doc)', status: 'passed', reason: 'Can export Rich Text document as .doc' } })}`);
    } else {
      await page.evaluate(_ => {}, `browserstack_executor: ${JSON.stringify({ action: 'setSessionStatus', arguments: { name: 'pad - export (.doc)', status: 'failed', reason: 'Can\'t export Rich Text document as .doc' } })}`);
    }
  } catch (e) {
    console.log(e);
    await page.evaluate(_ => {}, `browserstack_executor: ${JSON.stringify({ action: 'setSessionStatus', arguments: { name: 'pad - export (.doc)', status: 'failed', reason: 'Can\'t export Rich Text document as .doc' } })}`);
  }
});

test('pad - export (md)', async ({ page, context }) => {
  try {
    await fileActions.padeditor.locator('body').waitFor();
    await expect(fileActions.padeditor.locator('body')).toBeVisible();
    await fileActions.padeditor.locator('body').click();
    await fileActions.padeditor.locator('body').fill('TEST TEXT');

    await fileActions.export(mobile);
    await page.frameLocator('#sbox-iframe').getByRole('textbox').fill('test pad');
    await page.frameLocator('#sbox-iframe').getByRole('button', { name: ' .html' }).click();
    await page.frameLocator('#sbox-iframe').getByText('.md').click();

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      await fileActions.okButton.click()
    ]);

    await download.saveAs('/tmp/test pad');

    const readData = fs.readFileSync('/tmp/test pad', 'utf8');
    const expectedString = 'TEST TEXT';

    if (expectedString === readData.trim()) {
      await page.evaluate(_ => {}, `browserstack_executor: ${JSON.stringify({ action: 'setSessionStatus', arguments: { name: 'pad - export (md)', status: 'passed', reason: 'Can export Rich Text document as .md' } })}`);
    } else {
      await page.evaluate(_ => {}, `browserstack_executor: ${JSON.stringify({ action: 'setSessionStatus', arguments: { name: 'pad - export (md)', status: 'failed', reason: 'Can\'t export Rich Text document as .md' } })}`);
    }
  } catch (e) {
    console.log(e);
    await page.evaluate(_ => {}, `browserstack_executor: ${JSON.stringify({ action: 'setSessionStatus', arguments: { name: 'pad - export (md)', status: 'failed', reason: 'Can\'t export Rich Text document as .md' } })}`);
  }
});

test('pad - share at a moment in history', async ({ page, context }) => {
  try {
    await fileActions.padeditor.locator('body').waitFor();
    await expect(fileActions.padeditor.locator('body')).toBeVisible();
    await fileActions.padeditor.locator('body').click();

    await fileActions.padeditor.locator('body').fill('One moment in history');
    await fileActions.padeditor.getByText('One moment in history').click({
      clickCount: 3
    });

    await page.waitForTimeout(1000);
    await fileActions.padeditor.getByText('One moment in history').fill('Another moment in history');
    await fileActions.padeditor.getByText('Another moment in history').click({
      clickCount: 3
    });
    await page.waitForTimeout(1000);
    await fileActions.padeditor.getByText('Another moment in history').fill('Yet another moment in history');
    await page.waitForTimeout(1000);
    await fileActions.history(mobile);
    await fileActions.historyPrev.click();
    await fileActions.historyPrev.click();

    await expect(fileActions.padeditor.getByText('One moment in history')).toBeVisible();

    await fileActions.share(mobile);
    await page.frameLocator('#sbox-secure-iframe').locator('#cp-share-link-preview').click();
    await fileActions.shareCopyLink.click();

    const clipboardText = await page.evaluate('navigator.clipboard.readText()');
    const page1 = await context.newPage();
    await page1.goto(`${clipboardText}`);
    fileActions = new FileActions(page1);

    await fileActions.padeditor.getByText('One moment in history').waitFor();
    await expect(fileActions.padeditor.getByText('One moment in history')).toBeVisible();

    await page.evaluate(_ => {}, `browserstack_executor: ${JSON.stringify({ action: 'setSessionStatus', arguments: { name: 'pad - share at a moment in history', status: 'passed', reason: 'Can share Rich Text at a specific moment in history' } })}`);
  } catch (e) {
    console.log(e);
    await page.evaluate(_ => {}, `browserstack_executor: ${JSON.stringify({ action: 'setSessionStatus', arguments: { name: 'pad - share at a moment in history', status: 'failed', reason: 'Can share Rich Text at a specific moment in history' } })}`);
  }
});
