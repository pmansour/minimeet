/**
 * Runs on the Google Meets homepage and tries to join the next meeting, if one exists.
 */

import { getElement, bySelector, byVisibleSelfText } from '/src/util/dom.js';
import { info } from '/src/util/logging.js';
import { getLoginRedirectUrl, meetBaseUrl, navigateToUrl } from '/src/util/url.js';

function isLoggedOut() {
    return !!getElement(byVisibleSelfText('Sign up for free'));
}

function goToLoginPage() {
    window.location.href = getLoginRedirectUrl(meetBaseUrl);
}

function selectMeeting() {
    const meeting = getElement(bySelector('[data-call-id]'));
    if (!meeting) {
        return;
    }
    const meetingId = meeting.dataset['callId'];
    info(`Attempting to join meeting '${meetingId}'.`);
    const meetingUrl = `${meetBaseUrl}/${meetingId}`;
    navigateToUrl(getLoginRedirectUrl(meetingUrl));
}

setInterval(() => {
    if (isLoggedOut()) {
        goToLoginPage();
        return;
    }

    selectMeeting();
}, 2000);
// Refresh periodically, in case we get stuck.
setInterval(goToLoginPage, 30000);
