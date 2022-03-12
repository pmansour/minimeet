const puppeteer = require('puppeteer');
const path = require('path');
const assert = require('assert');

async function WaitForInMeeting(page, timeout = 60 * 1000) {
    await page.waitForFunction(
        function() {
            const endCallBtn = Array.from(document.querySelectorAll('button')).filter((btn) => btn.innerText.match('End'));
            return !endCallBtn;
        },
        {
            timeout,
        });
}

describe('minimeet extension', function() {
    const extensionPath = path.join(__dirname, '../mv3');

    beforeEach('Start browser', async function() {
        this.timeout(20 * 1000);
        this.browser = await puppeteer.launch({
            headless: false,
            args: [
                `--disable-extensions-except=${extensionPath}`,
                `--load-extension=${extensionPath}`,
            ]
        });
    });

    afterEach('Close browser', async function() {
        this.timeout(20 * 1000);
        await this.browser.close();
    });

    xit('Inserts room name successfully', function() {});
    xit('Unmutes successfully', function() {});
    xit('Starts video successfully', function() {});

    it('Joins meeting successfully', async function() {
        this.timeout(90 * 1000);

        const page = await this.browser.newPage();
        await page.goto('https://zoom.us/wc/join/71765738610?pwd=bR0Q7ST2McMycLVVBFYKqw9Lc3ZkuP.1');

        await WaitForInMeeting(page);
        const DAILY_TEST_MEETING_TITLE = "Daily test meeting";
        assert.equal(await page.title(), DAILY_TEST_MEETING_TITLE);
    });
});
