import { checkError, injectScriptWithRetries, waitForOnlineAndReachable, warn, debug, info, injectModuleScriptWithRetries } from './utils.js';
import { meetBaseUrl, retryTimeoutMilliseconds } from './config.js';

/** Opens the meeting with the given ID in a new tab and injects a script to hit 'Join'. */
function startMeeting(existingTabId, meetingId) {
    chrome.tabs.update(existingTabId, { url: `${meetBaseUrl}/${meetingId}`}, (tab) => {
        injectScriptWithRetries(tab.id, 'scripts/joinMeeting.js', () => info('Injected joining script.'));
    });
}

/** Tries to find the next meeting in the given tab. */
function tryFindNextMeeting(tabId) {
    chrome.tabs.get(tabId, (tab) => {
        if (!tab) {
            warn('Meet tab was closed before finding next meeting.');
            checkError();
            return;
        }

        chrome.tabs.sendMessage(tabId, {action: 'getNextMeetingId'}, (response) => {
            debug(`Sent getNextMeetingId message, got back: ${JSON.stringify(response)}`);
            if (!response || !response.nextMeetingId) {
                info('No meetings found.');
                setTimeout(
                    tryFindNextMeeting,
                    retryTimeoutMilliseconds,
                    tabId);
                return;
            }

            const nextMeetingId = response.nextMeetingId;
            debug(`Next meeting ID is ${nextMeetingId}`);
            startMeeting(tabId, nextMeetingId);
        });
    });
}

/** Opens the Google Meet homepage and starts looking for the next meeting. */
function startMeetTab() {
    waitForOnlineAndReachable(meetBaseUrl, () => {
        chrome.tabs.create({ url: meetBaseUrl }, (tab) => {
            debug('Started new tab:');
            debug(tab);
            injectModuleScriptWithRetries(tab.id, 'scripts/findMeeting.js', () => tryFindNextMeeting(tab.id));
        });
    });
}

startMeetTab();