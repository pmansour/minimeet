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
            // await executeScripts(tabId, ['scripts/login.js']);
            await executeModule(tabId, 'scripts/login.js');
            break;
        case 'meet.google.com':
            // TODO: do something different based on if this is a specific meeting.
            await executeModule(tabId, 'scripts/meet.js');
            break;
        default:
            console.log('Dont care about this site, ignoring..');
            break;
    }
});
