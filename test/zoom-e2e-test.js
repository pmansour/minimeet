const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const assert = require('assert');

function getZoomConfig() {
    const zoomConfigFilePath = path.join(__dirname, 'zoom-config.json');;
    return JSON.parse(fs.readFileSync(zoomConfigFilePath));
}

async function WaitForInMeeting(page, timeout = 30 * 1000) {
    await page.waitForSelector(
        '.meeting-app',
        {
            timeout,
        });
}

function delay(timeoutMs) {
    return new Promise((resolve) => {
        setTimeout(resolve, timeoutMs);
    });
}

describe('minimeet extension', function() {
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

    it('joins successfully', async function() {
        this.timeout(90 * 1000);

        await WaitForInMeeting(this.page);
        assert.equal(await this.page.title(), this.zoomConfig.testMeetingTitle);
    });

    it('sticks around', async function() {
        this.timeout(90 * 1000);

        await delay(5 * 1000);
        assert.equal(await this.page.title(), this.zoomConfig.testMeetingTitle);
    });

    xit('inserts room name successfully', function() {});
    xit('unmutes successfully', function() {});
    xit('starts video successfully', function() {});

    after('close browser', async function() {
        this.timeout(20 * 1000);
        await this.browser.close();
    });
});
