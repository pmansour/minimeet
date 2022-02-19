import * as creds from '/config/creds.js';
import { getLoginState, LOGIN_STATE, clickProfileIdentifier, clickSwitchAccount, clickUseAnotherAccount, enterEmail, enterPassword, clickNext } from '../services/login.js';
import { info, debug } from '/util/logging.js';

info('Hello from the login script!');

function doLogin() {
    info('Starting login flow..');
    const state = getLoginState(creds.EMAIL_ADDRESS);
    info(`Login state: ${state}`);
    
    switch (state) {
        case LOGIN_STATE.LOGGED_OUT_SAME_ACCOUNT:
            debug('Choosing existing profile..');
            clickProfileIdentifier(creds.EMAIL_ADDRESS);
            break;
        case LOGIN_STATE.LOGGED_OUT_NO_ACCOUNT:
            debug('Choosing another account..');
            clickUseAnotherAccount();
            break;
        case LOGIN_STATE.ENTER_EMAIL:
            debug('Entering email address..');
            enterEmail(creds.EMAIL_ADDRESS);
            break;
        case LOGIN_STATE.ENTER_PASSWORD_SAME_ACCOUNT:
            debug('Entering password..');
            enterPassword(creds.PASSWORD);
            break;
        case LOGIN_STATE.ENTER_PASSWORD_WRONG_ACCOUNT:
            debug('Switching accounts..');
            clickSwitchAccount();
            break;
        case LOGIN_STATE.INFO_MESSAGE_NO_INPUT:
            debug('Skipping info message..');
            clickNext();
            break;
        default:
            error('Unknown login state');
            break;
    }
}

setInterval(doLogin, 2000);
