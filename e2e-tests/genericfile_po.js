/**
 * Page objects to support generic file test cases.
 */

const { url } = require('../fixture');
const { FileActions } = require('./fileactions.js');

exports.docTypes = ['pad', 'sheet', 'code', 'slide', 'kanban', 'whiteboard', 'form', 'diagram'];

/**
 * A page object for a CryptPad file.
 */
class FilePage {
  constructor (page, testName, mobile) {
    this.page = page;
    this.testName = testName;
    this.mobile = mobile;
    this.fileActions = new FileActions(page);

    // locators
    this.mainFrame = page.frameLocator('#sbox-iframe');
    this.newFile = this.mainFrame.getByRole('menuitem', { name: 'New' }).locator('a');
    this.storeFile = this.mainFrame.getByRole('menuitem', { name: 'Store' }).locator('a');
    this.trashFile = this.mainFrame.getByRole('menuitem', { name: 'Move to trash' }).locator('a');
    this.alertMessage = this.mainFrame.locator('.alertify').locator('.msg');
    this.okButton = this.mainFrame
      .locator('.dialog')
      .getByRole('button', { name: 'OK (enter)' })
      .first();
    this.cancelButton = this.mainFrame.getByRole('button', { name: 'Cancel (esc)' });
    this.storageSuccess = this.mainFrame.locator('alertify-logs');

    this.shareButton = this.mainFrame.getByRole('button', { name: 'Share' });

    this.fileName = this.mainFrame.locator('.cp-toolbar-title');
    this.titleEditBox = this.mainFrame.locator('.cp-toolbar-title-edit > .fa');
    this.titleInput = this.mainFrame.locator('.cp-toolbar-title').locator('input');
    this.saveTitle = this.mainFrame.locator('.cp-toolbar-title-save');
  }

  filemenu () {
    return this.mobile ? this.fileActions.filemenuMobile : this.fileActions.filemenu;
  }

  // The last part of the URL gives the ID of a CryptPad file.
  fileId () {
    return this.page.url();
  }

  async loadFileType (fileType) {
    await this.page.goto(`${url}/${fileType}/`);
    // loading a new file takes longer than the default timeout for expect calls,
    // so we explicitly wait for it.
    await this.filemenu().waitFor();
  }

  async newFileClick () {
    await this.newFile.click();
    return new NewFileModal(this);
  }

  async shareButtonClick () {
    const mobLocator =
      this.mainFrame.locator('.cp-toolar-share-button');
    const shareLocator = this.mobile ? mobLocator : this.shareButton;
    await shareLocator.click();
    return new ShareFileModal(this);
  }

  async dismissHelpRequest () {
    const notNow = this.mainFrame.getByRole('button', { name: 'Not now', exact: true });
    await notNow.click();
  }

  async chatButtonClick () {
    const mobLocator = this.mainFrame.locator('#cp-toolbar-chat-drawer-open');
    const chatButton = this.mainFrame.getByRole('button', { name: 'Chat' });
    const chatLocator = this.mobile ? mobLocator : chatButton;

    await chatLocator.click();
    return new ChatModal(this);
  }

  async setStatus (status, reason) {
    await this.page.evaluate(
      _ => {
      },
      `browserstack_executor: ${JSON.stringify({
        action: 'setSessionStatus',
        arguments: {
          name: this.testName,
          status,
          reason
        }
      })}`
    );
  }

  /**
   * Marks the test as successful.
   * @param reason
   * @returns {Promise<void>}
   */
  async toSuccess (reason) {
    await this.setStatus('passed', reason);
  }

  /**
   * Marks the test as failed.
   * @param exception
   * @param reason
   * @returns {Promise<void>}
   */
  async toFailure (exception, reason) {
    console.log(exception);
    await this.setStatus('failed', reason);
    throw exception;
  }
}

/**
 * A page object for the modal that appears when creating a new file.
 */
class NewFileModal {
  constructor (filePage) {
    this.filePage = filePage;
    this.modalRoot = filePage.mainFrame.locator('#cp-app-toolbar-creation-dialog');
    this.close = this.modalRoot.locator('.cp-modal-close');
  }

  async createFileOfType (context, fileType) {
    // For new tabs, see https://playwright.dev/docs/pages#handling-new-pages
    const pagePromise = context.waitForEvent('page');
    await this.iconLocator(fileType).click();
    const nextPage = await pagePromise;
    return new FilePage(nextPage, this.filePage.testName, this.filePage.mobile);
  }

  iconLocator (fileType) {
    return this
      .filePage
      .mainFrame
      .getByText(
        this.iconName(fileType),
        { exact: true }
      );
  }

  iconName (fileType) {
    switch (fileType) {
      case 'pad':
        return 'Rich text';
      case 'slide':
        return 'Markdown slides';
      default:
        return `${fileType.charAt(0).toUpperCase() + fileType.slice(1)}`;
    }
  }
}

/**
 * A page object for the modal that appears when sharing a file.
 *
 * Modals for presentation and code have a 'present' toggle.
 * Modals for forms have an auditor toggle, and don't have the standard view/edit toggles.
 * Modals for pad, sheet, diagram and kanban have the same modal without extra toggles.
 * Flipping the toggles changes the URL to be copied.
 * View only share links when opened should have the edit toggle disabled.
 */
class ShareFileModal {
  constructor (filePage) {
    this.filePage = filePage;
    this.shareFrame = filePage.page.frameLocator('#sbox-secure-iframe');
    this.openButton = this.shareFrame.getByRole('button', { name: 'Open Link' });
    this.copyButton = this.shareFrame.getByRole('button', { name: 'Copy Link' });
  }

  toggle (text) {
    return this.shareFrame.getByText(text, { exact: true });
  }

  viewToggle (fileType) {
    if (fileType === 'form') {
      return this.toggle('Participant');
    } else {
      return this.toggle('View');
    }
  }

  async getLinkAfterCopy () {
    return await this.filePage.page.evaluate('navigator.clipboard.readText()');
  }

  async openLinkClick (context) {
    const pagePromise = context.waitForEvent('page');
    await this.openButton.click();
    const nextPage = await pagePromise;
    return new FilePage(nextPage, this.filePage.testName, this.filePage.mobile);
  }
}

class ChatModal {
  constructor (filePage) {
    this.filePage = filePage;
    this.chatPane = this.filePage.mainFrame.locator('.cp-app-contacts-chat');
    this.chatInput = this.chatPane.getByPlaceholder('Type a message here...');
  }

  async enterText (text) {
    await this.chatInput.click();
    await this.chatInput.fill(text);
    await this.chatInput.press('Enter');
  }
}

class StoreModal {
  constructor (filePage) {
    this.filePage = filePage;
    this.storePane = this.filePage.mainFrame.locator('.cp-corner-container');
    this.dismissButton = this.storePane.getByRole('button', { name: 'Don\'t store', exact: true });
    this.storeButton = this.storePane.getByRole('button', { name: 'Store', exact: true });
  }
}

exports.FilePage = FilePage;
exports.StoreModal = StoreModal;
