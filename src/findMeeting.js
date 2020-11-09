/**
 * Runs on the Google Meets homepage and services requests from the background
 * script to find the next meeting.
 */

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.debug(`Listener received message: ${JSON.stringify(request)}`);
    if (sender.tab) {
        console.warn('Ignoring message received from other tab.');
        return;
    }

    switch (request.action) {
        case 'getNextMeetingId':
            const meetings = document.querySelectorAll('[data-call-id]');
            if (!meetings || !meetings.length) {
                console.debug('Could not find any meetings.');
                sendResponse({nextMeetingId: null});
                return;
            }

            sendResponse({nextMeetingId: meetings[0].dataset['callId']});
            break;
        default:
            console.error('Received unknown request action.');
    }
});

console.debug('Added listener.');
