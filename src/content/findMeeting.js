/**
 * Runs on the Google Meets homepage and services requests from the background
 * script to find the next meeting.
 */

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    debug(`Listener received message: ${JSON.stringify(request)}`);
    if (sender.tab) {
        warn('Ignoring message received from other tab.');
        return;
    }

    switch (request.action) {
        case MEET_ACTION.GET_NEXT_MEETING_ID:
            const meetings = document.querySelectorAll('[data-call-id]');
            if (!meetings || !meetings.length) {
                debug('Could not find any meetings.');
                sendResponse({nextMeetingId: null});
                return;
            }

            sendResponse({nextMeetingId: meetings[0].dataset['callId']});
            break;
        default:
            error('Received unknown request action.');
    }
});

debug('Added listener.');
