/**
 * Runs on the specific meeting page, and hits the 'Join now' button if it exists.
 */

import { getElement, byVisibleSelfText, byButtonText } from '/util/dom.js';

function joinMeeting() {
    const btn = getElement(byVisibleSelfText('Join now')) || getElement(byVisibleSelfText('Ask to join'));
    if (btn) {
        btn.click();
    }
}

function dismissAnnoyingNotification() {
    // Meet is trying to be helpful, but this is not useful for a touchless UI.
    if (getElement(byVisibleSelfText('You have extensions installed that may affect the quality of your call'))) {
        const dismissBtn = getElement(byButtonText('Dismiss'));
        if (dismissBtn) {
            btn.click();
        }
    }
}

setInterval(joinMeeting, 2000);
setInterval(dismissAnnoyingNotification, 2000);
