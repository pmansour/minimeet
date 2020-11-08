/**
 * Runs on extension startup.
 */

const retryTimeoutMilliseconds = 2000;

function startMeeting(meetingId) {
    chrome.tabs.create({url: `https://meet.google.com/${meetingId}`}, (tab) => {
        chrome.tabs.executeScript(tab.id, {
            file: 'joinMeeting.js',
        });
    });
}

// Interval ID for the "find meeting" retry loop.
let findMeetingRetryLoopId;

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
        chrome.tabs.remove(tabId);

        clearInterval(findMeetingRetryLoopId);
    });
}

function startMeetTab() {
    chrome.tabs.create({ url: 'https://meet.google.com' }, (tab) => {
        chrome.tabs.executeScript(tab.id, {
            file: 'findMeeting.js',
        }, () => {
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
