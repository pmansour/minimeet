/**
 * Runs on extension startup.
 */

const retryTimeoutMilliseconds = 3000;

function newContext() {
    return {
        isActive: false,

        timeoutIds: [],
    };
}

function resetContext() {
    if (activeContext.isActive) {
        console.warn('Resetting current active context.');
        console.debug(activeContext);

        activeContext.timeoutIds.forEach((timeoutId) => clearTimeout(timeoutId));
    }

    activeContext = newContext();
}

activeContext = resetContext();

/** Prints the given failure message and the last error (if present). */
function fail(message) {
    console.error(message);
    if (chrome.runtime.lastError) {
        console.debug(`Last error: ${chrome.runtime.lastError.message}`);
    }            
}

/** Opens the meeting with the given ID in a new tab and injects a script to hit 'Join'. */
function startMeeting(meetingId) {
    chrome.tabs.create({url: `https://meet.google.com/${meetingId}`}, (tab) => {
        injectScriptWithRetries(tab.id, 'joinMeeting.js', resetContext);
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

        fail(`Error while injecting script in Meet tab '${tabId}'.`);
        activeContext.timeoutIds.push(setTimeout(
            injectScriptWithRetries,
            retryTimeoutMilliseconds,
            tabId, scriptFile, onSuccess));
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
    activeContext.timeoutIds.push(setTimeout(
        waitForOnlineAndReachable,
        retryTimeoutMilliseconds,
        url, callback));
}

/** Tries to find the next meeting in the given tab. */
function tryFindNextMeeting(tabId) {
    chrome.tabs.get(tabId, (tab) => {
        if (!tab) {
            fail('Meet tab was closed before finding next meeting.');
            resetContext();
            return;
        }

        chrome.tabs.sendMessage(tabId, {action: 'getNextMeetingId'}, (response) => {
            console.debug(`Sent getNextMeetingId message, got back: ${JSON.stringify(response)}`);
            if (!response || !response.nextMeetingId) {
                console.info('No meetings found.');
                activeContext.timeoutIds.push(setTimeout(
                    tryFindNextMeeting,
                    retryTimeoutMilliseconds,
                    tabId));
                return;
            }

            const nextMeetingId = response.nextMeetingId;
            console.debug(`Next meeting ID is ${nextMeetingId}`);
            startMeeting(nextMeetingId);

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
            injectScriptWithRetries(tab.id, 'findMeeting.js', () => tryFindNextMeeting(tab.id));
        });
    });
}

function startContext() {
    if (activeContext.isActive) {
        resetContext();
    }

    activeContext.isActive = true;
    startMeetTab();
}

chrome.runtime.onStartup.addListener(() => {
    startContext();
});
chrome.browserAction.onClicked.addListener(() => {
    startContext();
});
