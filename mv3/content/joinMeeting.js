/**
 * Runs on the specific meeting joining page, and hits the 'Join now' button if it exists.
 */

import { getElement, byVisibleSelfText } from '/util/dom.js';

function joinMeeting() {
    const btn = getElement(byVisibleSelfText('Join now'));
    if (btn) {
        btn.click();
    }
}

setInterval(joinMeeting, 2000);
// In case we get stuck.
setInterval(() => window.location.reload(), 60000);
