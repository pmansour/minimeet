import { checkError, injectScriptWithRetries, getTab, sendMessage, waitForOnlineAndReachable } from './utils.js';

/** Opens the meeting with the given ID in the given tab, and injects a script to hit 'Join'. */
function startMeeting(meetingId, existingTabId = null) {
    const url = `${meetBaseUrl}/${meetingId}`;
    const onTabReady = (tab) => injectScriptWithRetries(tab.id, 'content/joinMeeting.js');

    if (existingTabId) {
        chrome.tabs.update(existingTabId, {url}, onTabReady); 
    } else {
        chrome.tabs.create({url}, onTabReady);
    }
}

/** Tries to find the next meeting in the given tab. */
async function getNextMeeting(tabId) {
    return new Promise(async (resolve, reject) => {
        if (!await getTab(tabId)) {
            warn('Meet tab was closed before finding next meeting.');
            checkError();
            reject();
            return;
        }

        sendMessage(tabId, {action: MEET_ACTION.GET_NEXT_MEETING_ID}, (response) => {
            if (!response || !response.nextMeetingId) {
                resolve(null);
                return;
            }

            resolve(response.nextMeetingId);
        });
    });
}

/** Start polling the given tab to find the next meeting ID. */
async function pollForNextMeeting(tabId) {
    const nextMeetingId = await getNextMeeting(tabId);
    if (!nextMeetingId) {
        info(`No meetings found; will retry in ${meetingPollFrequencyMilliseconds / 1000} seconds.`);
        setTimeout(pollForNextMeeting, meetingPollFrequencyMilliseconds, tabId);
        return;
    }

    info(`Found meeting '${nextMeetingId}'; will start it in tab '${tabId}'.`);
    startMeeting(nextMeetingId, tabId);
}

/** Opens the Google Meet homepage and starts looking for the next meeting. */
export async function startMeetTab() {
    // TODO: figure out why this keeps getting blocked by CORS.
    // await waitForOnlineAndReachable(meetBaseUrl);
    chrome.tabs.create({ url: meetBaseUrl }, (tab) => {
        const onContentScriptLoaded = () => pollForNextMeeting(tab.id);
        setTimeout(
            () => injectScriptWithRetries(tab.id, 'content/findMeeting.js', onContentScriptLoaded),
            // Wait till the "shared" content scripts have loaded before injecting login.js.
            // TODO: figure out a better way to actually wait for scripts loading.
            2000);
    });
}
