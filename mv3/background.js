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
        case 'apps.google.com':
            // If we somehow end up redirected here, let's go back to the login flow.
            await chrome.tabs.update(tabId, { url: initialUrl });
            break;
        case 'meet.google.com':
            if (url.pathname === '/') {
                // This is the base Meet page. Pick a meeting.
                await executeModule(tabId, 'content/selectMeeting.js');
            } else {
                await executeModule(tabId, 'content/joinMeeting.js');
            }
            break;
        default:
            console.log('Dont care about this site, ignoring..');
            break;
    }
});
