/**
 * Runs on extension startup.
 */

const retryTimeoutMilliseconds = 3000;

/** Opens the meeting with the given ID in a new tab and injects a script to hit 'Join'. */
function startMeeting(meetingId) {
    chrome.tabs.create({url: `https://meet.google.com/${meetingId}`}, (tab) => {
        injectScriptWithRetries(tab.id, 'joinMeeting.js');
    });
}

function injectScriptWithRetries(tabId, scriptFile, onSuccess = null) {
    chrome.tabs.executeScript(tabId, {
        file: scriptFile,
    }, () => {
        if (!chrome.runtime.lastError) {
            if (onSuccess) { onSuccess(); }
            return;
        }

        err = chrome.runtime.lastError.message;
        console.error(`Error while injecting script in Meet tab '${tabId}': ${err}`);
        setTimeout(tryInjectMeetingFinderScript, retryTimeoutMilliseconds, tabId, scriptFile, onSuccess);
    });
}

// Interval ID for the "find meeting" retry loop.
let findMeetingRetryLoopId;

/** Tries to find the next meeting in the given tab. */
function tryFindNextMeeting(tabId) {
    chrome.tabs.sendMessage(tabId, {action: 'getNextMeetingId'}, (response) => {
        console.debug(`Sent getNextMeetingId message, got back: ${JSON.stringify(response)}`);
        if (!response || !response.nextMeetingId) {
            console.warn('Response is empty.');
            return;
        }

        const nextMeetingId = response.nextMeetingId;
        console.debug(`Next meeting ID is ${nextMeetingId}`);
        startMeeting(nextMeetingId);

        clearInterval(findMeetingRetryLoopId);
        chrome.tabs.remove(tabId);
    });
}

/** Opens the Google Meet homepage and starts looking for the next meeting. */
function startMeetTab() {
    chrome.tabs.create({ url: 'https://meet.google.com' }, (tab) => {
        injectScriptWithRetries(tab.id, 'findMeeting.js', () => {
            findMeetingRetryLoopId = setInterval(
                tryFindNextMeeting,
                retryTimeoutMilliseconds,
                tab.id);
        });
    });
}

chrome.runtime.onStartup.addListener(() => {
    startMeetTab();
});
chrome.browserAction.onClicked.addListener(() => {
    startMeetTab();
});
