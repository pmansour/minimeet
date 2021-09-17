import { initialUrl } from '/constants.js';
import { executeModule } from '/util/injection.js';

// Extension click navigates to meet URL.
chrome.action.onClicked.addListener((tab) => {
    chrome.tabs.update(tab.id, { url: initialUrl });
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.status !== 'complete' || !tab.url || !tab.url.startsWith('http')) {
        return;
    }

    const url = new URL(tab.url);
    switch (url.hostname) {
        case 'accounts.google.com':
            await executeModule(tabId, 'content/login.js');
            break;
        case 'myaccount.google.com':
            // This is where you get redirected after a successful login without a Meet redirect URL.
            // Go back to the initial URL to either complete the login or go to Meet.
            await chrome.tabs.update(tabId, { url: initialUrl });
            break;
        case 'meet.google.com':
            // TODO: do something different based on if this is a specific meeting.
            await executeModule(tabId, 'content/meet.js');
            break;
        default:
            console.log('Dont care about this site, ignoring..');
            break;
    }
});
