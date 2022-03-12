const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const assert = require('assert');

function getZoomConfig() {
    const zoomConfigFilePath = path.join(__dirname, 'zoom-config.json');;
    return JSON.parse(fs.readFileSync(zoomConfigFilePath));
}

function delay(timeoutMs) {
    return new Promise((resolve) => {
        setTimeout(resolve, timeoutMs);
    });
}

describe('minimeet extension', function() {
    this.timeout(0);
    const extensionPath = path.join(__dirname, '../mv3');

    before('load zoom config', function() {
        this.zoomConfig = getZoomConfig();
    });

    before('start browser', async function() {
        this.timeout(20 * 1000);
        this.browser = await puppeteer.launch({
            headless: false,
            args: [
                `--disable-extensions-except=${extensionPath}`,
                `--load-extension=${extensionPath}`,
            ]
        });
    });

    before('start page', async function() {
        this.page = await this.browser.newPage();
        await this.page.goto(this.zoomConfig.testMeetingUrl);
    });

    it('joins the meeting', async function() {
        await this.page.waitForSelector('.meeting-app', { timeout: 10 * 1000 });
        assert.equal(await this.page.title(), this.zoomConfig.testMeetingTitle);
    });
    it('uses "Meeting room" as username', async function() {
        await this.page.waitForFunction(() => !!MeetingConfig, { timeout: 10 * 1000 });
        assert.equal(await this.page.evaluate('MeetingConfig.userName'), 'Meeting room');
    });
    it('unmutes the microphone', async function() {
        await this.page.waitForSelector('*[arialabel="mute my microphone"]', { timeout: 30 * 1000 });
    });
    it('starts video', async function() {
        await this.page.waitForSelector('*[arialabel="stop sending my video"]', { timeout: 30 * 1000 });
    });

    // This is useful for debugging UI test issues. Remove the 'x' to run this locally.
    // Avoid committing the enabled version of this test so we don't waste GH action time.
    xit('gives you time to interactively debug', async function() {
        await delay(60 * 1000);
        assert.equal(await this.page.title(), this.zoomConfig.testMeetingTitle);
    });

    after('close browser', async function() {
        this.timeout(20 * 1000);
        await this.browser.close();
    });
});
