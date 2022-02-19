import { fillInput, getElement, byVisibleSelfText, bySelector, byButtonText, byAriaLabel } from '/util/dom.js';

/* The states of the login process. */
export const LOGIN_STATE = Object.freeze({
    UNKNOWN: 0,
    LOGGED_OUT_SAME_ACCOUNT: 1,
    LOGGED_OUT_NO_ACCOUNT: 2,
    ENTER_EMAIL: 3,
    ENTER_PASSWORD_SAME_ACCOUNT: 4,
    ENTER_PASSWORD_WRONG_ACCOUNT: 5,
    INFO_MESSAGE_NO_INPUT: 6,
});

/**
 * Find the phase of the login flow that we're at.
 * @param {*} email_address The email address that we intend to login as.
 * @returns A LOGIN_STATE.
 */
 export function getLoginState(email_address) {
    if (getElement(byVisibleSelfText('Use another account'))) {
        if (getElement(bySelector(`div#profileIdentifier[data-email='${email_address}']`))) {
            return LOGIN_STATE.LOGGED_OUT_SAME_ACCOUNT;
        } else {
            return LOGIN_STATE.LOGGED_OUT_NO_ACCOUNT;
        }
    }
    if (getElement(bySelector('input#identifierId[type=email]'))) {
        return LOGIN_STATE.ENTER_EMAIL;
    }
    if (getElement(bySelector('input[type=password]'))) {
        if (getElement(bySelector(`input#identifierId[type=hidden][value='${email_address}']`))) {
            return LOGIN_STATE.ENTER_PASSWORD_SAME_ACCOUNT;
        } else {
            return LOGIN_STATE.ENTER_PASSWORD_WRONG_ACCOUNT;
        }
    }
    // Happens periodically when you're logged in but from a new IP or something.
    if (getElement(byVisibleSelfText("Verify it's you"))) {
        return LOGIN_STATE.INFO_MESSAGE_NO_INPUT;
    }
    return LOGIN_STATE.UNKNOWN;
}

export function clickProfileIdentifier(email) {
    getElement(bySelector(`div#profileIdentifier[data-email='${email}']`)).click();
}

export function clickUseAnotherAccount() {
    getElement(byVisibleSelfText('Use another account')).click();
}

export function enterEmail(email) {
    fillInput(getElement(bySelector('input#identifierId[type=email]')), email);
    getElement(byButtonText('Next')).click();
}

export function enterPassword(password) {
    fillInput(getElement(bySelector('input[type=password]')), password);
    getElement(byButtonText('Next')).click();
}

export function clickSwitchAccount() {
    getElement(byAriaLabel('Switch account')).click();
}

export function clickNext() {
    getElement(byButtonText('Next')).click();
}
