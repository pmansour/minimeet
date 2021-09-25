/**
 * Runs on the Google Meets homepage and tries to join the next meeting, if one exists.
 */

import { getElement, bySelector, byVisibleSelfText } from '/util/dom.js';
import { initialUrl } from '/constants.js';

function isLoggedOut() {
    return !!getElement(byVisibleSelfText('Sign up for free'));
}

function goToLoginPage() {
    window.location.href = initialUrl;
}

function selectMeeting() {
    const meeting = getElement(bySelector('[data-call-id]'));
    if (meeting) {
        meeting.click();
    }
}

setInterval(() => {
    if (isLoggedOut()) {
        goToLoginPage();
        return;
    }

    selectMeeting();
}, 2000);
// Refresh periodically, in case we get stuck.
setInterval(goToLoginPage, 60000);
