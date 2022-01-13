const puppeteer = require('puppeteer');

(async () => {
    const extensionPath = require('path').join(__dirname, '../mv3');
    const browser = puppeteer.launch({
        headless: false,
        args: [
            `--disable-extensions-except=${extensionPath}`,
            `--load-extension=${extensionPath}`,
        ]
    });

    
    const page = await browser.newPage();
    await page.goto('https://www.google.com');
    
    await browser.close();
})();
