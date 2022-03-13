/**
 * Runs on the specific Zoom meeting page after joining, and configures various in-meeting options.
 */

import { getElement, byButtonText, bySelector } from '/util/dom.js';
import { info } from '/util/logging.js';

function joinAudioByComputer() {
    const btn = getElement(byButtonText('Join Audio by Computer'));
    if (btn) {
        btn.click();
    }
}

function dismissModal() {
    const btn = getElement(bySelector('.zm-modal button'));
    if (btn && btn.textContent.includes('OK')) {
        btn.click();
    }
}

function audioIsReady() {
    return !!getElement(byButtonText('Mute')) || !!getElement(byButtonText('Unmute'));
}

function unmuteAudio() {
    const btn = getElement(byButtonText('Unmute'));
    if (btn) {
        btn.click();
    }
}

function videoIsReady() {
    return !!getElement(byButtonText('Start Video')) || !!getElement(byButtonText('Stop Video'));
}

function startVideo() {
    const btn = getElement(byButtonText('Start Video'));
    if (btn) {
        btn.click();
    }
}

var videoWasInitialized = false;
var audioWasInitialized = false;

setInterval(() => {
    // These other tasks can be done repeatedly without harm.
    dismissModal();
    joinAudioByComputer();

    // Only initialize these once at meeting startup, so that a human can later override them if needed.
    if (!audioWasInitialized && audioIsReady()) {
        unmuteAudio();
        audioWasInitialized = true;
        info('Minimeet: Unmuted microphone');
    }
    if (!videoWasInitialized && videoIsReady()) {
        startVideo();
        videoWasInitialized = true;
        info('Minimeet: Started video');
    }
}, 1000);
