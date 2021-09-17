/**
 * Runs on the Google Meets homepage and tries to join the next meeting, if one exists.
 */

import { getElement, bySelector } from '/util/dom.js';

function selectMeeting() {
    const meeting = getElement(bySelector('[data-call-id]'));
    if (meeting) {
        meeting.click();
    }
}

setInterval(selectMeeting, 2000);
// In case we get stuck.
setInterval(() => window.location.reload(), 60000);
