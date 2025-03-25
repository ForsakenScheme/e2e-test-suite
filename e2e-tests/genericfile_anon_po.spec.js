const { test, expect } = require('@playwright/test');
const { FilePage, StoreModal, docTypes } = require('./genericfile_po');

let filePage;

test.beforeEach(async ({ page, isMobile }, testInfo) => {
  test.setTimeout(60000);
  filePage = new FilePage(page, testInfo.title, isMobile);
});

test.describe('New file modal', () => {
  docTypes.forEach(function (name) {
    test(`Explore new file modal from ${name}.`, async ({ page, context }, testInfo) => {
      try {
        const fileType = name;
        // directly load a pad page and fetch its id from the url
        await filePage.loadFileType(fileType);
        const firstPad = filePage.fileId();

        // click File twice and the menu will appear and then disappear.
        await filePage.filemenu().click();
        await expect(filePage.newFile).toBeVisible();
        await filePage.filemenu().click();
        await expect(filePage.newFile).not.toBeVisible();

        // click File -> New to reach the new file modal dialog and close it immediately.
        await filePage.filemenu().click();
        const cancelledFileModal = await filePage.newFileClick();
        await expect(cancelledFileModal.close).toBeVisible();
        await cancelledFileModal.close.click();
        await expect(cancelledFileModal.close).not.toBeVisible();
        await expect(filePage.filemenu()).toBeVisible();

        // click File -> New to reach the new file modal dialog again.
        await filePage.filemenu().click();
        const newFileModal = await filePage.newFileClick();
        await expect(newFileModal.close).toBeVisible();

        // In the modal, click icon for file type to create a new one in a new browser tab.
        const nextPadPage = await newFileModal.createFileOfType(context, fileType);
        await expect(nextPadPage.filemenu()).toBeVisible();
        // Ensure this is indeed a new pad, and not just the same we previously had.
        const secondPad = nextPadPage.fileId();
        expect(secondPad).not.toBe(firstPad);

        await filePage.toSuccess('New file modal works');
      } catch (e) {
        await filePage.toFailure(e, "New file modal doesn't work");
      }
    });
  });
});

test.describe('Share modal', () => {
  docTypes.forEach(function (name) {
    test(`Explore share modal from ${name}.`, async ({ page, context }, testInfo) => {
      try {
        const fileType = name;
        await filePage.loadFileType(fileType);
        const originalId = filePage.fileId();

        const shareModal = await filePage.shareButtonClick();
        // check that the link to be copied points to the file currently open
        await shareModal.copyButton.click();
        const actual = await shareModal.getLinkAfterCopy();
        expect(actual).toBe(originalId);
        expect(actual).toContain('edit');

        // check that the link for viewing is different from the link for editing.
        await filePage.shareButtonClick();
        await shareModal.viewToggle(fileType).click();
        await shareModal.copyButton.click();
        const actualForViewing = await shareModal.getLinkAfterCopy();
        expect(actualForViewing).not.toBe(originalId);
        expect(actualForViewing).toContain('view');

        // check that opening a link correctly opens a new browser tab
        await filePage.shareButtonClick();
        await shareModal.viewToggle(fileType).click();
        const openedLinkPage = await shareModal.openLinkClick(context);
        const openedFileId = openedLinkPage.fileId();
        expect(openedFileId).not.toBe(originalId);
        if (fileType !== 'form') {
          await expect(openedLinkPage.filemenu()).toBeVisible();
          await expect(filePage.fileName).toContainText('(Read only)');
        }

        await filePage.toSuccess('Share modal works well');
      } catch (e) {
        await filePage.toFailure(e, 'Share modal failed');
      }
    });
  });
});

test.describe('Chat modal', () => {
  docTypes.forEach(function (docType) {
    test(`Explore chat modal for ${docType}`, async ({ page, context }, testInfo) => {
      try {
        await filePage.loadFileType(docType);

        // Warning about storage may overlap with chat modal. First dismiss it.
        await (new StoreModal(filePage)).dismissButton.click();

        // Click chat to display the chat modal
        const chatModal = await filePage.chatButtonClick();
        await expect(chatModal.chatInput).toBeVisible();

        // Enter a message.
        const chatMessage = 'This is a test message';
        await chatModal.enterText(chatMessage);

        // Now a request for help appears in the corner overlapping with chat.
        await filePage.dismissHelpRequest();

        // With the popup gone we can verify the visibility of the message.
        await expect(chatModal.chatPane).toHaveText(new RegExp('.*' + chatMessage));

        // Click chat again to dismiss the chat modal.
        await filePage.chatButtonClick();
        await expect(chatModal.chatInput).not.toBeVisible();

        await filePage.toSuccess('Chat modal works well');
      } catch (e) {
        await filePage.toFailure(e, 'Chat modal failed');
      }
    });
  });
});

test.describe('Change title', () => {
  docTypes.forEach(function (docType) {
    test(`Change title for ${docType}`, async ({ page, context }, testInfo) => {
      try {
        // Load a new document.
        await filePage.loadFileType(docType);
        await expect(filePage.fileName).toBeVisible();

        // Enter a new document name.
        const newName = docType + '-' + Math.random();
        await filePage.titleEditBox.click();
        await filePage.titleInput.fill(newName);

        // Save the changed document name.
        await filePage.saveTitle.click();
        await expect(filePage.fileName).toContainText(newName);

        await filePage.toSuccess('Changing title succeeded');
      } catch (e) {
        await filePage.toFailure(e, 'Changing title failed');
      }
    });
  });
});

test.describe('Save/Remove ', () => {
  docTypes.forEach(function (name) {
    test(`Save and remove for ${name}`, async ({ page, context }, testInfo) => {
      try {
        const fileType = name;
        await filePage.loadFileType(fileType);
        await expect(filePage.fileName).toBeVisible();

        // First try to trash without having saved, which should raise a warning.
        await filePage.filemenu().click();
        await filePage.trashFile.click();
        await expect(filePage.mainFrame.getByText(
          'You must store this document in your CryptDrive before being able to use this feature.'
        )).toBeVisible();
        await filePage.okButton.click();

        // First store the document.
        await filePage.filemenu().click();
        await expect(filePage.storeFile).toBeVisible();
        await filePage.storeFile.click();
        await expect(filePage.mainFrame.getByText(
          'The document was successfully stored in your CryptDrive!'
        )).toBeVisible();

        // Then trash the document, first canceling.
        await filePage.filemenu().click();
        await filePage.trashFile.click();
        await expect(filePage.alertMessage).toContainText('Are you sure');
        await filePage.cancelButton.click();
        await expect(filePage.cancelButton).not.toBeVisible();

        // Now try trashing again, but do it for real.
        await filePage.filemenu().click();
        await filePage.trashFile.click();
        await expect(filePage.alertMessage).toContainText('Are you sure');
        await filePage.okButton.click();
        await expect(filePage.mainFrame.getByText('Deleted')).toBeVisible();
        await filePage.okButton.click();
        await expect(filePage.alertMessage).not.toBeVisible();

        await filePage.toSuccess('Save/remove works well');
      } catch (e) {
        await filePage.toFailure(e, 'Save/remove failed');
      }
    });
  });
});
