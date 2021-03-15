/**
 * Runs on the Google Accounts login page and services requests from the background
 * script to automate user login.
 */

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    debug(`Listener received message: ${JSON.stringify(request)}`);
    if (sender.tab) {
        warn('Ignoring message received from other tab.');
        return;
    }

    switch (request.action) {
        case LOGIN_ACTION.GET_STATE:
            sendResponse({state: getState(request.email)});
            break;
        case LOGIN_ACTION.CHOOSE_EXISTING_PROFILE:
            clickProfileIdentifier(request.email);
            break;
        case LOGIN_ACTION.CHOOSE_ANOTHER_ACCOUNT:
            clickUseAnotherAccount();
            break;
        case LOGIN_ACTION.ENTER_EMAIL:
            enterEmail(request.email);
            break;
        case LOGIN_ACTION.ENTER_PASSWORD:
            enterPassword(request.password);
            break;
        case LOGIN_ACTION.SWITCH_ACCOUNT:
            clickSwitchAccount();
            break;
        default:
            error(`Received unknown request action: '${request.action}'.`);
    }
});

debug('Added login listener.');

function getState(desired_email) {
    if (getElement(byVisibleSelfText('Use another account'))) {
        if (getElement(bySelector(`div#profileIdentifier[data-email='${desired_email}']`))) {
            return LOGIN_STATE.LOGGED_OUT_SAME_ACCOUNT;
        } else {
            return LOGIN_STATE.LOGGED_OUT_NO_ACCOUNT;
        }
    }
    if (getElement(bySelector('input#identifierId[type=email]'))) {
        return LOGIN_STATE.ENTER_EMAIL;
    }
    if (getElement(bySelector('input[type=password]'))) {
        if (getElement(bySelector(`input#identifierId[type=hidden][value='${desired_email}']`))) {
            return LOGIN_STATE.ENTER_PASSWORD_SAME_ACCOUNT;
        } else {
            return LOGIN_STATE.ENTER_PASSWORD_WRONG_ACCOUNT;
        }
    }
    return LOGIN_STATE.UNKNOWN;
}

function clickProfileIdentifier(email) {
    getElement(bySelector(`div#profileIdentifier[data-email='${email}']`)).click();
}

function clickUseAnotherAccount() {
    getElement(byVisibleSelfText('Use another account')).click();
}

function enterEmail(email) {
    fillInput(getElement(bySelector('input#identifierId[type=email]')), email);
    getElement(byButtonText('Next')).click();
}

function enterPassword(password) {
    fillInput(getElement(bySelector('input[type=password]')), password);
    getElement(byButtonText('Next')).click();
}

function clickSwitchAccount() {
    getElement(byAriaLabelSubstring('Switch account')).click();
}
