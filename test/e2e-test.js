const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const assert = require('assert');

function getTestCreds() {
    // Use real creds here when running this test.
    return {
        username: 'test-job@example.com',
        password: '<real-password-goes-here>',
    };
}

function WaitForLoggedIn(page, timeout = 20 * 1000) {
    return page.waitForSelector(
        '*[aria-label="Account Information"]',
        {
            hidden: false,
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

describe('minimeet extension', async function() {
    const extensionPath = path.join(__dirname, '../mv3');
    const credsFilePath = `${extensionPath}/config/creds.js`;

    before('Initialize creds file', async function() {
        creds = getTestCreds();
        fs.writeFileSync(credsFilePath, `
export const EMAIL_ADDRESS = '${creds.username}';
export const PASSWORD = '${creds.password}';
`);
    });

    after('Delete creds file', async function() {
        fs.rmSync(credsFilePath);
    });

    beforeEach('Start browser', async function() {
        this.browser = await puppeteer.launch({
            headless: false,
            args: [
                `--disable-extensions-except=${extensionPath}`,
                `--load-extension=${extensionPath}`,
            ]
        });
    });

    afterEach('Close browser', async function() {
        await this.browser.close();
    })

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
    });
});
