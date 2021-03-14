/* Needs dom.js */
const EMAIL = '<REDACTED>';
const PASSWORD = '<REDACTED>';

const STATE_UNKNOWN = 0;
const STATE_LOGGED_OUT_SAME_ACCOUNT = 1;
const STATE_LOGGED_OUT_NO_ACCOUNT = 2;
const STATE_ENTER_EMAIL = 3;
const STATE_ENTER_PASSWORD_SAME_ACCOUNT = 4;
const STATE_ENTER_PASSWORD_WRONG_ACCOUNT = 5;

function getState(desired_email) {
    if (getElement(byVisibleSelfText('Use another account'))) {
        if (getElement(bySelector(`div#profileIdentifier[data-email='${desired_email}']`))) {
            return STATE_LOGGED_OUT_SAME_ACCOUNT;
        } else {
            return STATE_LOGGED_OUT_NO_ACCOUNT;
        }
    }
    if (getElement(bySelector('input#identifierId[type=email]'))) {
        return STATE_ENTER_EMAIL;
    }
    if (getElement(bySelector('input[type=password]'))) {
        if (getElement(bySelector(`input#identifierId[type=hidden][value='${desired_email}']`))) {
            return STATE_ENTER_PASSWORD_SAME_ACCOUNT;
        } else {
            return STATE_ENTER_PASSWORD_WRONG_ACCOUNT;
        }
    }
    return STATE_UNKNOWN;
}

function fillForm() {
    const state = getState(EMAIL);
    let timeout = 1000;
    switch (state) {
        case STATE_UNKNOWN:
            console.log('State: Unknown form state.');
            break;
        case STATE_LOGGED_OUT_SAME_ACCOUNT:
            console.log('State: Logged out but remembers account.');
            getElement(bySelector(`div#profileIdentifier[data-email='${EMAIL}']`))
                .click();
            break;
        case STATE_LOGGED_OUT_NO_ACCOUNT:
            console.log('State: Logged out and doesnt remember account.');
            getElement(byVisibleSelfText('Use another account'))
                .click();
            break;
        case STATE_ENTER_EMAIL:
            console.log('State: Enter email.');
            fillInput(getElement(bySelector('input#identifierId[type=email]')), EMAIL);
            getElement(byButtonText('Next'))
                .click();
            break;
        case STATE_ENTER_PASSWORD_SAME_ACCOUNT:
            console.log('State: Enter password (for correct account).');
            fillInput(getElement(bySelector('input[type=password]')), PASSWORD);
            getElement(byButtonText('Next'))
                .click();
            // Longer timeout after entering password to avoid wrong password loops.
            timeout = 5000;
            break;
        case STATE_ENTER_PASSWORD_WRONG_ACCOUNT:
            console.log('State: Enter password for wrong account.');
            getElement(byAriaLabelSubstring('Switch account'))
                .click();
            break;
    }
    setTimeout(fillForm, timeout);
}

fillForm();
