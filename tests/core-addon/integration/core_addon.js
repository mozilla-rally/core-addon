/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const firefox = require("selenium-webdriver/firefox");
const { Builder, By, until } = require("selenium-webdriver");

// The number of milliseconds to wait for some
// property to change in tests. This should be
// a long time to account for slow CI.
const WAIT_FOR_PROPERTY = 5000;

const firefoxOptions = new firefox.Options();
firefoxOptions.setPreference("xpinstall.signatures.required", false);
firefoxOptions.setPreference("extensions.experiments.enabled", true);
// Unset this to run the UI (useful for local testing).
firefoxOptions.headless();

// This is the path to Firefox Nightly on Ubuntu with the Mozilla PPA.
if (process.platform === "linux") {
  firefoxOptions.setBinary("/usr/bin/firefox-trunk");
} else if (process.platform === "darwin") {
  firefoxOptions.setBinary(
    "/Applications/Firefox Nightly.app/Contents/MacOS/firefox"
  );
}

/**
 * Find the element and perform an action on it.
 *
 * @param driver
 *        The Selenium driver to use.
 * @param element
 *        The element to look for and execute actions on.
 * @param action
 *        A function in the form `e => {}` that will be called
 *        and receive the element once ready.
 */
async function findAndAct(driver, element, action) {
  await driver.wait(until.elementLocated(element), WAIT_FOR_PROPERTY);
  await driver.findElement(element).then(e => action(e));
}

describe("Core-Addon Onboarding", function () {
  // eslint-disable-next-line mocha/no-hooks-for-single-case
  beforeEach(async function () {
    this.driver = await new Builder()
      .forBrowser("firefox")
      .setFirefoxOptions(firefoxOptions)
      .build();
  });

  // eslint-disable-next-line mocha/no-hooks-for-single-case
  afterEach(async function () {
    await this.driver.quit();
  });

  it("should un/enroll in Rally", async function () {
    await this.driver.get(`file:///${__dirname}/index.html`);
    await this.driver.wait(until.titleIs("Installation Test"), WAIT_FOR_PROPERTY);
    await findAndAct(this.driver, By.id("install"), e => e.click());

    // switch to browser UI context, to interact with Firefox add-on install prompts.
    await this.driver.setContext(firefox.Context.CHROME);
    await findAndAct(this.driver, By.css(`[label="Add"]`), e => e.click());
    await findAndAct(this.driver, By.css(`[label="Okay, Got It"]`), e => e.click());

    // Switch back to web content context.
    await this.driver.setContext(firefox.Context.CONTENT);

    // We expect the extension to load its options page in a new tab.
    await this.driver.wait(async () => {
      return (await this.driver.getAllWindowHandles()).length === 2;
    }, WAIT_FOR_PROPERTY);

    // Selenium is still focused on the old tab, so switch to the new window handle.
    const newTab = (await this.driver.getAllWindowHandles())[1];
    await this.driver.switchTo().window(newTab);

    // New tab is focused.
    await this.driver.wait(
      until.titleIs("Rally: Put your data to work for a better internet"),
      WAIT_FOR_PROPERTY
    );

    await this.driver.wait(until.elementLocated(By.css("button")));

    // FIXME we need to use button IDs here so xpath is not needed...
    // See https://github.com/mozilla-rally/core-addon/issues/244
    await findAndAct(this.driver, By.xpath(`//button[text()="Get Started"]`), e => e.click());
    await findAndAct(this.driver, By.xpath(`//button[text()="Accept & Participate"]`), e => e.click());
    // TODO check that state is enrolled, see https://github.com/mozilla-rally/core-addon/issues/245

    await findAndAct(this.driver, By.xpath(`//button[text()="Save & Continue"]`), e => e.click());

    await this.driver.wait(until.elementLocated(By.css("button")));
    await findAndAct(this.driver, By.xpath(`//button[text()="Join Study"]`), e => e.click());
    await findAndAct(this.driver, By.xpath(`(//button[text()="Join Study"])[2]`), e => e.click());

    // Switch to browser UI context, to interact with Firefox add-on install prompts.

    await this.driver.setContext(firefox.Context.CHROME);
    await findAndAct(this.driver, By.css(`[label="Add"]`), e => e.click());
    await findAndAct(this.driver, By.css(`[label="Okay, Got It"]`), e => e.click());

    // FIXME close tab and click on icon, check that post-enrollment options page is shown.
    // This will currently fail because there is a bug in the core-addon UI, where
    // the options page will show no studies.
    // See https://github.com/mozilla-rally/core-addon/issues/235

    // Switch back to web content context.
    await this.driver.setContext(firefox.Context.CONTENT);

    // Begin study unenrollment cancel it.
    await findAndAct(this.driver, By.xpath(`//button[text()="Leave Mozilla Rally"]`), e => e.click());

    await findAndAct(this.driver, By.xpath(`//button[text()="Cancel"]`), e => e.click());

    // Begin unenrollment and confirm it this time.
    const unenrollSelector = By.xpath(`//button[text()="Leave Mozilla Rally"]`);
    const unenrollButton = await this.driver.findElement(unenrollSelector);
    await this.driver.wait(until.elementIsVisible(unenrollButton), WAIT_FOR_PROPERTY);
    unenrollButton.click();

    await this.driver.wait(
      until.titleIs("Rally: Put your data to work for a better internet"),
      WAIT_FOR_PROPERTY
    );

    const confirmButton = await this.driver.findElement(
      By.xpath(`//button[text()="Leave Rally"]`)
    );
    await this.driver.wait(until.elementIsVisible(confirmButton), WAIT_FOR_PROPERTY);
    confirmButton.click();
    // TODO check that core add-on is uninstalled, see https://github.com/mozilla-rally/core-addon/issues/245
  });
});
