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
        console.error(chrome.runtime.lastError);
        setTimeout(injectScriptWithRetries, retryTimeoutMilliseconds, tabId, scriptFile, onSuccess);
    });
}

/** Checks whether the device is online and the given URL is reachable. */
async function isOnlineAndReachable(url) {
    if (!navigator.onLine) {
        console.warn('Device is offline.');
        return false;
    }
    try {
        res = await fetch(url);
        console.debug(`Test request to '${url}' returned with HTTP ${res.status}.`);
        return res.ok;
    } catch(e) {
        console.warn(`Failed to make test request to '${url}'`);
        console.warn(e);
        return false;
    }
}

/** Executes the given callback when the device is online and the given URL is reachable. */
async function waitForOnlineAndReachable(url, callback) {
    if (await isOnlineAndReachable(url)) {
        console.debug(`Device is online and '${url}' is reachable.`);
        callback();
        return;
    }

    console.info(`Target URL is unreachable. Waiting ${+((retryTimeoutMilliseconds / 1000).toFixed(2))} seconds before retrying..`);
    setTimeout(() => waitForOnlineAndReachable(url, callback), retryTimeoutMilliseconds);
}

// Interval ID for the "find meeting" retry loop.
let findMeetingRetryLoopId;

/** Tries to find the next meeting in the given tab. */
function tryFindNextMeeting(tabId) {
    chrome.tabs.get(tabId, (tab) => {
        if (!tab) {
            console.error('Meet tab was closed before finding next meeting.');
            clearInterval(findMeetingRetryLoopId);
            return;
        }

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
    });
}

/** Opens the Google Meet homepage and starts looking for the next meeting. */
function startMeetTab() {
    const url = 'https://meet.google.com';
    waitForOnlineAndReachable(url, () => {
        chrome.tabs.create({ url }, (tab) => {
            console.debug('Started new tab:');
            console.debug(tab);
            injectScriptWithRetries(tab.id, 'findMeeting.js', () => {
                findMeetingRetryLoopId = setInterval(
                    tryFindNextMeeting,
                    retryTimeoutMilliseconds,
                    tab.id);
            });
        });
    });
}

chrome.runtime.onStartup.addListener(() => {
    startMeetTab();
});
chrome.browserAction.onClicked.addListener(() => {
    startMeetTab();
});
