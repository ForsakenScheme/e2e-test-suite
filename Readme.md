## Introduction and setup

### Introduction 

This is an end-to-end suite using Playwright and BrowserStack to test the functionality of CryptPad in production, staging and development.

Playwright is an automated testing framework for writing end-to-end tests, which are run using locally installed browsers. BrowserStack is a testing platform which can be integrated with Playwright to run tests in the cloud. It allows for recording videos and logging the results of each run.

We maintain a [list of functionality currently covered by the test suite](https://cryptpad.fr/code/#/2/code/view/pYv4MxEBO9ukPhVze97dX3i1DHY8kIXczZbtfxybFnA/), as well as areas to work on in future. 

### Download and installation

To download this repository and install dependencies, run:

```bash
git clone https://github.com/cryptpad/e2e-test-suite.git
cd e2e-test-suite
npm install
npx playwright install
```

### Development vs. live testing

The tests can be run on a local development instance of CryptPad, or against the [flagship CryptPad instance](https://cryptpad.fr/). To change, set the `PW_URL` variable in your `.env` file to your desired url. To test against a development instance, make sure it is up and running locally when testing.

> :exclamation:
> The `PW_URL` url string should **not** contain a forward slash at the end. If testing a local development instance, make sure to include `http://` at the beginning of the string, e.g. `http://localhost:3000`. If running on a live website, the string should begin with `https://` instead.

### Required environment for authenticated tests

Some of the suite is focused on "anonymous" or guest user interaction with CryptPad and its apps. This requires no database setup or authentication. These tests have `_anon` in the file name, and can be run collectively using the `anon` command line variable (see [Running tests](## Running tests))

For tests that rely on being logged in to user accounts (drive, sharing, collaboration, etc), and/or on opening of specific test documents and drives, the instance database must be seeded with [the required initial data](https://cryptpad.fr/code/#/2/code/view/umjXf-hxeI6r1ymuOIbHWmsgJoc-UuxTR4Q-b-ZAXB4/) before testing can begin. These tests have `_loggedin` in the file name, and can be run collectively using the `loggedin` command line variable (see [Running tests](## Running tests))

This environment is kept constant and replicable between tests, i.e. if as part of a test a document is created and added to the user's drive, it must be deleted before the test is run again. To ensure this in case of code malfunction or test failure, there are several cleanup scripts in `cleanup.js` integrated into the test files, which run in order to return the test environment to its base state. However, there may be situations in which these do not work as expected, and one may be required to manually intervene in the test environment.

#### Seeding the database

> :exclamation:
> The setup, authentication and teardown scripts **must** be run on Chromium as we have found it to be the most stable browser for this process and least likely to result in failures or errors. It can also be run on either OSX or Windows, but **not** on a mobile device.

1. Set passwords for the following test accounts:

    * test-user
    * testuser
    * test-user2
    * test-user3

by assigning them to the following variables to an `.env` file at the root of the repo

```
MAINACCOUNTPASSWORD = ""
TESTUSERPASSWORD = ""
TESTUSER2PASSWORD = ""
TESTUSER3PASSWORD = ""
```

They will be used by the script that creates accounts in the next step.


1. Set up the test environment:

* run the `dbseeding.spec.js` file on its own, before any other file, using:

```bash
npx playwright test dbseeding --workers=1 --project='chrome'
```

You can specify another OS name or run the file using BrowserStack as desired (see [Running tests](## Running Tests)).


3. To save the authentication information for test accounts:

* change directory to auth folder and create files to store authentication information for each test account using:

```bash
cd auth
touch mainuser.json testuser.json testuser2.json testuser3.json
```

* then change back to project root directory and run the auth script using: 

```bash
cd ..
npx playwright test auth --workers=1 --project='chrome'
```

A database teardown script is not included because CryptPad does not allow the re-creation of accounts (i.e. deleting an account and creating a new one with the same username and password). If running on a local instance, stop and run: 

```bash
npm run clear
```
in the same tab to unseed the database. 


### Browsertack authentication and integration

To run the test suite using BrowserStack, add username and access key to the `.env` file.

```
BrowserStack_USERNAME=""
BrowserStack_ACCESS_KEY=""
```

## Running tests

### Choose browser and OS/device

The tests can be run on different browser and OS/device combinations, set under `projects` in `playwright.config.js`. 

The project uses Chrome, Edge, Firefox and Webkit on the latest available versions of OSX, as well as Chrome on Android. 

You can choose one of the above browsers (if using only Playwright) or a browser and OS/device combination (if using Browserstack) from those available in `playwright.config.js`, or you can add your own. Please see the [full list of supported browsers and OS/devices](https://playwright.dev/docs/browsers) and see how they compare to [what is supported by integration with BrowserStack](https://www.BrowserStack.com/docs/automate/playwright/browsers-and-os). 

### Choose Playwright only or Playwright + BrowserStack

The tests can be run locally using Playwright only. This is usually slightly quicker and does not require connection to BrowserStack. The tests results, including stack traces in case of error, are displayed in real time on the console. At the end of each test run, a report is generated and should open automatically in the default browser. To open the report page manually, use:

```bash
npx playwright show-report
```

To run the tests using BrowserStack, add the desired OS and `@BrowserStack` (for desktop) or `@BrowserStack-mobile` (for mobile) to the project name, for example `chrome@latest:OSX Ventura@BrowserStack`. Once connected, the test results can be viewed at the [BrowserStack Automate Dashboard](https://automate.BrowserStack.com/dashboard/).

### Running tests

> :exclamation:
> It is strongly recommended that the tests be run over a strong and stable internet connection, **especially** when using BrowserStack. Tests run over slow connections will often time out and fail or hang indefinitely. 

> :information_source:
> If running tests against a local instance, it is recommended that you run it from a repository specifically dedicated for tests to enable wiping test data using `npm run clear` in the CryptPad repo. 

0. If running tests for the first time on your chosen browser/OS combination, run:

```bash
npx playwright test -g "screenshot" --project='chrome'
```
This will return some errors beginning with `Error: A snapshot doesn't exist at...`. This is expected and allows for calibrating visual comparison tests (labelled with `screenshot` in the test name) by taking screenshots against which test results are later compared. 

1. If running tests for anonymous guest users (not logged in), run: 

```bash
npx playwright test anon --project='chrome'
```

These tests will run in parallel mode using two workers (default).
You can set another browser/OS combination of your choosing using the `projects` flag (see [Choose browser and OS/device](## Choose browser and OS/device)).

> :information_source:
> If the command to run tests is used without the `projects` flag, the chosen tests will run on all available `projects` listed in `playwright.config.js`. 


2. If running tests for logged-in users (see [Required environment for authenticated tests](## Required environment for authenticated tests)) run: 

```bash
npx playwright test loggedin --workers=1 --project='chrome'
```

3. Alternately, tests in individual files can be run using: 

```bash
npx playwright test [filename] --project='chrome'
```
**If running a test file with `loggedin` in the name, a `--workers=1` flag must be added**, for example:

```bash
npx playwright test code_loggedin --workers=1 --project='chrome'

```

> :information_source:
> The `--headed` flag can be added to run the tests in headed browsers and be able to see the progression of the test in real time.

#### Running accessibility tests

Accessibility tests must be run separately from all other tests.
Some security measures must be disabled in order to inject the accessibility test script into nested frames used by CryptPad. This means accessibility tests can be only performed locally.

1. To run accessibility tests, make sure they are being run against a local development instance (reauthenticate users if necessary)

2. In your local CryptPad repository, in `lib/defaults.js`, make the following change: 

```diff
Default.contentSecurity = function (Env) {
-   return (Default.commonCSP(Env).join('; ') + "script-src 'self' resource: " + Env.httpUnsafeOrigin).replace(/\s+/g, ' ');
+   return (Default.commonCSP(Env).join('; ') + "script-src 'self' 'unsafe-eval' 'unsafe-inline' resource: " + Env.httpUnsafeOrigin).replace(/\s+/g, ' ');
};

Default.padContentSecurity = function (Env) {
    return (Default.commonCSP(Env).join('; ') + "script-src 'self' 'unsafe-eval' 'unsafe-inline' resource: " + Env.httpUnsafeOrigin).replace(/\s+/g, ' ');
};
```
3. In your local CryptPad repository, in `www/common/sframe-boot.js`, make the following change: 

```diff

var caughtEval;
- console.log("Testing if CSP correctly blocks an 'eval' call");
- try {
-    eval('true');
- } catch (err) { caughtEval = true; }

- if (!/^\/(sheet|doc|presentation|unsafeiframe)/.test(window.location.pathname) && !caughtEval) {
-    console.error('eval panic location:', window.location.pathname, caughtEval);
-    return void _alert(function (UI, h, Msg) {
-        UI.alert(h('p', {
-            style: 'white-space: break-spaces',
-        }, Msg.error_evalPermitted));
-    });
- }

+ //console.log("Testing if CSP correctly blocks an 'eval' call");
+ //try {
+ //   eval('true');
+ //} catch (err) { caughtEval = true; }

+ //if (!/^\/(sheet|doc|presentation|unsafeiframe)/.test(window.location.pathname) && !caughtEval) {
+ //   console.error('eval panic location:', window.location.pathname, caughtEval);
+ //   return void _alert(function (UI, h, Msg) {
+ //      UI.alert(h('p', {
+ //           style: 'white-space: break-spaces',
+ //       }, Msg.error_evalPermitted));
+ //   });
+ //}

```
4. To run accessibility tests for anonymous users, run:

```bash
npx playwright test accessibility --workers=1 --project='chrome'

```

5. To run accessibility tests for logged in users, run:

```bash
npx playwright test accessibility_signedin --workers=1 --project='chrome'

```

6. At the end of each complete test run, the results will be exported to an .md file in the root directory (either `accessibilityresults_anon.md` or `accessibilityresults_anon.md`)


## Troubleshooting

Some tests are 'flaky', i.e. will occasionally fail due to timeouts, inconsistency with rendering DOM elements, connection errors, etc. Adding the retries flag `--retries=1` to the `npx playwright test` command will retry any test in case of failure once, and can be used to identify flaky tests.

### Updating Playwright 

Running tests using an outdated local version of Playwright and/or a mismatch between the local Playwright version and the one used by BrowserStack can result in bugs. Because the local version needs to be checked for BrowserStack compatibility, it is recommended to update manually.

1. Check the local Playwright version using:

```
 npx playwright --version

 ```
2. Check the latest Playwright version listed [here](https://www.BrowserStack.com/docs/automate/playwright/browsers-and-os). You can compare this to the version used by BrowserStack in the 'Input Capabilities' section of each test recording. 
   * Issues with connecting to BrowserStack can be caused by an outdated Playwright version as well as a conflict between individual browser versions used by Playwright and BrowserStack. 
    * It is recommended to install and use the latest Playwright version listed as compatible with BrowserStack under the link above.
3. To update locally, run:

```
npm install -D @playwright/test@[version number]
```

4. To download Playwright browsers run:

```
npx playwright install
```

### Known bugs (Playwright issues) 

Currently some mobile tests are marked as skipped when running with BrowserStack due to an incompatibility of Playwright v. 1.41.2 and BrowserStack's Chrome (Android), which results with a bug when downloading/importing files.

This and other issues are documented in the Issues section of the repository.


### Known bugs (CryptPad issues)

Reproducible bugs and problem behaviours which reliably cause tests to fail are [listed as issues in the CryptPad GitHub repository under the `discovered in testing` label](https://github.com/cryptpad/cryptpad/labels/Discovered%20in%20testing). There is also a [list and discussion of problem behaviours which are difficult to reproduce or intermittent](https://cryptpad.fr/code/#/2/code/view/p2kQvGJCmj1c6ghKyLlHERS0PsxkxutLFwvQCIm3hfw/). Most of the tests which consistently fail are labeled with the number of the related GitHub issue in the test name.

Currently all tests interacting with the Teams functionality are set to skip if running on Edge browser due to an unfixable incompatibility. 


## Contributing 

We welcome contributions to this test suite as an important part of making CryptPad more stable. Anything from reproducing the tests to find bugs in CryptPad to extending the [coverage checklist](https://cryptpad.fr/code/#/2/code/view/pYv4MxEBO9ukPhVze97dX3i1DHY8kIXczZbtfxybFnA/) is useful and appreciated.


### Interactive mode

When writing tests, the Playwright [code generator](https://playwright.dev/docs/codegen) can be used to identify actions and DOM locators. To use, run:

```bash
npx playwright codegen [url]
```

### Linting

To lint, run:

```bash
npm run lint 

```

To lint and fix, run:

```bash
npm run lint:fix 

```

## Funding

This project is funded through [NGI Assure](https://nlnet.nl/assure), a fund established by [NLnet](https://nlnet.nl) with financial support from the European Commission's [Next Generation Internet](https://ngi.eu) program. Learn more at the [NLnet project page](https://nlnet.nl/project/CryptPad-QA).

[<img src="https://nlnet.nl/logo/banner.png" alt="NLnet foundation logo" width="20%" />](https://nlnet.nl)
[<img src="https://nlnet.nl/image/logos/NGIAssure_tag.svg" alt="NGI Assure Logo" width="20%" />](https://nlnet.nl/assure)