const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const assert = require('assert');

function getTestCreds() {
    const testCredsFilePath = path.join(__dirname, 'test-creds.json');;
    return JSON.parse(fs.readFileSync(testCredsFilePath));
}

function WaitForLoggedIn(page, timeout = 30 * 1000) {
    return page.waitForSelector(
        '*[aria-label*="Google Account:"]',
        {
            hidden: false,
            timeout,
        });
}

async function WaitForInMeeting(page, title, timeout = 30 * 1000) {
    await page.waitForSelector(
        '*[data-meeting-title="' + title + '"]',
        {
            timeout,
        });
    await page.waitForSelector(
        '*[data-in-call="true"]',
        {
            timeout,
        });
}

async function IsLoggedInAs(page, email) {
    return (await page.content()).match(email);
}

// TODO: implement this, possibly using the google calendar node API:
// https://developers.google.com/calendar/api/quickstart/nodejs
async function createMeeting(username, password, time) {
}

describe('minimeet extension', function() {
    const extensionPath = path.join(__dirname, '../mv3');
    const credsFilePath = `${extensionPath}/config/creds.js`;

    before('Initialize creds file', function() {
        creds = getTestCreds();
        fs.mkdirSync(path.dirname(credsFilePath), { recursive: true });
        fs.writeFileSync(credsFilePath, `
export const EMAIL_ADDRESS = '${creds.username}';
export const PASSWORD = '${creds.password}';
`);
    });

    after('Delete creds file', function() {
        fs.rmSync(credsFilePath);
    });

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

    it('Logs in successfully', async function() {
        this.timeout(30 * 1000);

        const page = await this.browser.newPage();
        await page.goto('https://meet.google.com');

        await WaitForLoggedIn(page);
        const expectedUsername = getTestCreds().username;
        assert.ok(
            await IsLoggedInAs(page, expectedUsername),
            `Page is not logged in as account '${expectedUsername}'.`);
    });

    describe('with meetings', function() {
        // TODO: implement these.
        xit('should join an existing meeting starting in the near future', function() {});
        xit('should join an existing meeting that started in the recent past', function() {});
        xit('should join a meeting created after it loads', function() {});

        it('should join a static daily meeting on the test user\'s calendar', async function() {
            this.timeout(30 * 1000);

            const page = await this.browser.newPage();
            await page.goto('https://meet.google.com');

            // Meeting title of the recurring meeting that should exist on the test user's calendar.
            const DAILY_TEST_MEETING_TITLE = "Daily test meeting";
            await WaitForInMeeting(page, /*title=*/DAILY_TEST_MEETING_TITLE, /*timeout=*/30*1000);
        });
    });
});
