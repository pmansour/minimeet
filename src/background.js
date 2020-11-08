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

function tryJoinNextMeeting(tabId) {
    chrome.tabs.sendMessage(tabId, {action: 'getNextMeetingId'}, (response) => {
        console.debug(`Sent message, got back: ${JSON.stringify(response)}`);
        if (response && response.nextMeetingId) {
            const nextMeetingId = response.nextMeetingId;
            console.debug(`Next meeting ID is ${nextMeetingId}`);
            startMeeting(nextMeetingId);
            chrome.tabs.remove(tabId);
            return;
        }
        setTimeout(() => tryJoinNextMeeting(tabId), retryTimeoutMilliseconds);
    });
}

function startMeetTab() {
    chrome.tabs.create({ url: 'https://meet.google.com' }, (tab) => {
        chrome.tabs.executeScript(tab.id, {
            file: 'findMeeting.js',
        }, () => {
            tryJoinNextMeeting(tab.id);
        });
    });
}

chrome.runtime.onStartup.addListener(() => {
    startMeetTab();
});
chrome.browserAction.onClicked.addListener(() => {
    startMeetTab();
});
