import { getElement, byButtonText, bySelector, byVisibleSelfText } from '/util/dom.js';
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
    return !!getElement(byVisibleSelfText('Mute')) || !!getElement(byVisibleSelfText('Unmute'));
}

function unmuteAudio() {
    const btn = getElement(byVisibleSelfText('Unmute'));
    if (btn) {
        btn.click();
    }
}

function videoIsReady() {
    return !!getElement(byVisibleSelfText('Start Video')) || !!getElement(byVisibleSelfText('Stop Video'));
}

function startVideo() {
    const btn = getElement(byVisibleSelfText('Start Video'));
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
    // Delay enabling video until after audio is initialized, since doing it too early sometimes
    // doesn't work.
    if (!videoWasInitialized && videoIsReady() && audioWasInitialized) {
        startVideo();
        videoWasInitialized = true;
        info('Minimeet: Started video');
    }
}, 1000);
