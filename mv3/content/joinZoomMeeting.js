/**
 * Runs on the specific Zoom meeting joining page, enters a room name and enables AV, and hits the 'Join' button if it exists.
 */

import { getElement, byButtonText, bySelector } from '/util/dom.js';

function unmuteAudio() {
    const btn = getElement(byButtonText('Unmute'));
    if (btn) {
        btn.click();
    }
}

function startVideo() {
    const btn = getElement(byButtonText('Start Video'));
    if (btn) {
        btn.click();
    }
}

function enterRoomName() {
    const nameInput = getElement(bySelector('input[name=inputname]'));
    if (nameInput) {
        nameInput.value = 'Meeting room';
        // Zoom only enables the join button if an input event was detected.
        nameInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
}

function joinMeeting() {
    const btn = getElement(byButtonText('Join'));
    if (btn) {
        btn.click();
    }
}

setInterval(() => {
    unmuteAudio();
    startVideo();
    enterRoomName();
    joinMeeting();
}, 2000);
