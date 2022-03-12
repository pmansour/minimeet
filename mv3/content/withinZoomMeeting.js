import { getElement, byButtonText, bySelector } from '/util/dom.js';

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

setInterval(() => {
    dismissModal();
    joinAudioByComputer();
}, 2000);
