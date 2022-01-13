const puppeteer = require('puppeteer');

(async () => {
    const extensionPath = require('path').join(__dirname, '../mv3');
    const browser = await puppeteer.launch({
        headless: false,
        args: [
            `--disable-extensions-except=${extensionPath}`,
            `--load-extension=${extensionPath}`,
        ]
    });
    
    const page = await browser.newPage();
    await page.goto('https://meet.google.com');
    
    await browser.close();
})();
