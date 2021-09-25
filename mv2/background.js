/* Entry point for the extension. */

async function executeModule(tabId, filename) {
    await chrome.tabs.executeScript(tabId,
        { code: `var filename = ${JSON.stringify(chrome.extension.getURL(filename))};`});
    return chrome.tabs.executeScript(tabId, { file: 'util/moduleLoader.js' });
}

const meetBaseUrl = 'https://meet.google.com';
const baseGoogleLoginUrl = 'https://accounts.google.com/signin/v2';
const initialUrl = `${baseGoogleLoginUrl}?continue=${encodeURIComponent(meetBaseUrl)}`;

chrome.webNavigation.onCompleted.addListener(function({tabId}) {
    console.log("On accounts.google.com");
    executeModule(tabId, 'content/login.js');
}, {url: [{urlMatches: 'https://accounts.google.com'}]});

chrome.webNavigation.onCompleted.addListener(function({tabId}) {
    console.log("On myaccount.google.com");
    // This is where you get redirected after a successful login without a Meet redirect URL.
    // Go back to the initial URL to either complete the login or go to Meet.
    chrome.tabs.update(tabId, { url: initialUrl });
}, {url: [{urlMatches: 'https://myaccount.google.com/*'}]});

chrome.webNavigation.onCompleted.addListener(async function({tabId, url}) {
    const parsedUrl = new URL(url);
    if (parsedUrl.pathname === '/') {
        // This is the base Meet page. Pick a meeting.
        await executeModule(tabId, 'content/selectMeeting.js');
    } else {
        await executeModule(tabId, 'content/joinMeeting.js');
    }
}, {url: [{urlMatches: 'https://meet.google.com/*'}]});
