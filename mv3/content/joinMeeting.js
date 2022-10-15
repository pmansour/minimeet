/**
 * Runs on the specific meeting joining page, and hits the 'Join now' button if it exists.
 */

import { getElement, byVisibleSelfText } from '/util/dom.js';

function joinMeeting() {
    const btn = getElement(byVisibleSelfText('Join now')) || getElement(byVisibleSelfText('Ask to join'));
    if (btn) {
        btn.click();
    }
}

setInterval(joinMeeting, 2000);

