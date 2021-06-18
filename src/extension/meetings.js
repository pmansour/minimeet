import { checkError, injectWithDependencies, getTab, sendMessage, waitForOnlineAndReachable } from './utils.js';

/** Opens the meeting with the given ID in the given tab, and injects a script to hit 'Join'. */
function startMeeting(meetingId, existingTabId = null) {
    const url = `${meetBaseUrl}/${meetingId}`;
    const onTabReady = (tab) => injectWithDependencies(tab.id, 'content/joinMeeting.js');

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
export async function startMeetTab(tabId) {
    const onTabNavigation = (tab) => {
        const onContentScriptLoaded = () => pollForNextMeeting(tab.id);
        injectWithDependencies(tab.id, 'content/findMeeting.js', onContentScriptLoaded);
    };
    // Re-use an existing tab, if there's one open.
    if (tabId) {
        chrome.tabs.update(tabId, { url: meetBaseUrl }, onTabNavigation);
    } else {
        chrome.tabs.create({ url: meetBaseUrl }, onTabNavigation);
    }
}
