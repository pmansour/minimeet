import { executeModule } from '/util/injection.js';
import { info } from '/util/logging.js';
import { getLoginRedirectUrl, meetBaseUrl } from '/util/url.js';

// Adds the necessary content settings for sites that do meetings (e.g. Google Meets, Zoom).
function addMeetingContentSettings(siteUrlPattern) {
    const allowedSettings = [chrome.contentSettings.notifications, chrome.contentSettings.camera, chrome.contentSettings.microphone];
    allowedSettings.forEach((setting) => {
        setting.set({
            primaryPattern: siteUrlPattern,
            setting: 'allow',
        });
    });
}

// Extension click navigates to meet URL.
chrome.action.onClicked.addListener((tab) => {
    chrome.tabs.update(tab.id, { url: getLoginRedirectUrl(meetBaseUrl) });
});

// Gets called when a new tab finished loading with a URL whose hostname ends in google.com.
async function onGooglePageLoad(parsedUrl, tabId) {
    switch (parsedUrl.hostname) {
        case 'accounts.google.com':
            await executeModule(tabId, 'content/login.js');
            break;
        case 'myaccount.google.com':
        case 'apps.google.com':
            // If we somehow end up redirected here, let's go back to the login flow.
            await chrome.tabs.update(tabId, { url: getLoginRedirectUrl(meetBaseUrl) });
            break;
        case 'meet.google.com':
            addMeetingContentSettings('https://*.google.com/*');
            if (parsedUrl.pathname === '/') {
                // This is the base Meet page. Pick a meeting.
                await executeModule(tabId, 'content/selectMeeting.js');
            } else {
                await executeModule(tabId, 'content/joinMeeting.js');
            }
            break;
        default:
            info(`Ignoring unknown Google hostname '${parsedUrl.hostname}'..`);
            break;
    }
}

// Gets called when a new tab finished loading with a URL whose hostname ends in zoom.us.
async function onZoomPageLoad(parsedUrl, tabId) {
    addMeetingContentSettings('https://*.zoom.us/*');
    // Non-web join URLs start with /j/* instead of /wc/*.
    // We need to redirect those to use the web client.
    const nonWebJoinUrlMatch = parsedUrl.pathname.match('^\/j\/([0-9]+)');
    if (nonWebJoinUrlMatch && nonWebJoinUrlMatch[1]) {
        const meetingId = nonWebJoinUrlMatch[1];
        const redirectUrl = `https://zoom.us/wc/join/${meetingId}?${parsedUrl.searchParams.toString()}`;
        await chrome.tabs.update(tabId, { url: redirectUrl });
    // Zoom has an interesting URL naming convention:
    // wc/join/{meetingId} is the pre-joining page
    // wc/{meetingId}/join is the post-joining page
    } else if (parsedUrl.pathname.match('\/wc\/join\/[0-9]+')) {
        await executeModule(tabId, 'content/zoomPreJoin.js');
    } else if (parsedUrl.pathname.match('\/wc\/[0-9]+\/join')) {
        await executeModule(tabId, 'content/zoomPostJoin.js');
    } else {
        info(`Ignoring unknown Zoom site '${parsedUrl.toString()}'..`);
    }
}

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.status !== 'complete' || !tab.url || !tab.url.startsWith('http')) {
        return;
    }

    const url = new URL(tab.url);
    if (url.hostname.match('google\.com$')) {
        onGooglePageLoad(url, tabId);
    } else if (url.hostname.match('zoom\.us$')) {
        onZoomPageLoad(url, tabId);
    } else {
        info(`Ignoring unknown hostname '${url.hostname}'..`);
    }
});
