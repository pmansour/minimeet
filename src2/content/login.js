import { getLoginState, LOGIN_STATE, clickProfileIdentifier, clickSwitchAccount, clickUseAnotherAccount, enterEmail, enterPassword } from '../services/login.js';
import { info, debug } from '/util/logging.js';

info('Hello from the login script!');

const EMAIL = 'foo@bar.com';
const PASSWORD = 'pass123';

function doLogin() {
    info('Starting login flow..');
    const state = getLoginState(EMAIL);
    info(`Login state: ${state}`);
    
    switch (state) {
        case LOGIN_STATE.LOGGED_OUT_SAME_ACCOUNT:
            debug('Choosing existing profile..');
            clickProfileIdentifier(EMAIL);
            break;
        case LOGIN_STATE.LOGGED_OUT_NO_ACCOUNT:
            debug('Choosing another account..');
            clickUseAnotherAccount();
            break;
        case LOGIN_STATE.ENTER_EMAIL:
            debug('Entering email address..');
            enterEmail(EMAIL);
            break;
        case LOGIN_STATE.ENTER_PASSWORD_SAME_ACCOUNT:
            debug('Entering password..');
            enterPassword(PASSWORD);
            break;
        case LOGIN_STATE.ENTER_PASSWORD_WRONG_ACCOUNT:
            debug('Switching accounts..');
            clickSwitchAccount();
            break;
        default:
            error('Unknown login state');
            break;
    }
}

setInterval(doLogin, 3000);
