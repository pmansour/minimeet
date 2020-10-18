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
        console.debug('Received response');
        if (response.nextMeetingId) {
            startMeeting(response.nextMeetingId);
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

chrome.runtime.onInstalled.addListener(() => {
    chrome.identity.getAuthToken({interactive: true});
});
chrome.runtime.onStartup.addListener(() => {
    startMeetTab();
});
chrome.browserAction.onClicked.addListener(() => {
    startMeetTab();
});
