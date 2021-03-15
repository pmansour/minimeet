import { checkError, injectScriptWithRetries, getTab, sendMessage, waitForOnlineAndReachable } from './utils.js';

async function getLoginState(tabId, email) {
    return new Promise(async (resolve, reject) => {
        const tab = await getTab(tabId);
        if (!tab) {
            warn('Login tab was closed.');
            checkError();
            resolve(LOGIN_STATE.TAB_CLOSED);
            return;
        }
        if (!tab.url) {
            info('Login tab is inaccessible.');
            checkError();
            resolve(LOGIN_STATE.TAB_INACCESSIBLE);
            return;
        }

        sendMessage(tabId, {action: LOGIN_ACTION.GET_STATE, email}, (response) => {
            if (!response || !response.state) {
                reject();
                return;
            }

            resolve(response.state);
        });
    });
}

/** Reacts to the current login state. */
function generateNextLoginMessage(state, email, password) {
    debug(`Login state is ${state}`);
    switch (state) {
        case LOGIN_STATE.LOGGED_OUT_SAME_ACCOUNT:
            debug('Choosing existing profile..');
            return {action: LOGIN_ACTION.CHOOSE_EXISTING_PROFILE, email: email};
        case LOGIN_STATE.LOGGED_OUT_NO_ACCOUNT:
            debug('Choosing another account..');
            return {action: LOGIN_ACTION.CHOOSE_ANOTHER_ACCOUNT};
        case LOGIN_STATE.ENTER_EMAIL:
            debug('Entering email address..');
            return {action: LOGIN_ACTION.ENTER_EMAIL, email: email};
        case LOGIN_STATE.ENTER_PASSWORD_SAME_ACCOUNT:
            debug('Entering password..');
            return {action: LOGIN_ACTION.ENTER_PASSWORD, password: password};
        case LOGIN_STATE.ENTER_PASSWORD_WRONG_ACCOUNT:
            debug('Switching accounts..');
            return {action: LOGIN_ACTION.SWITCH_ACCOUNT};
    }
    error('Unknown login state.');
    return null;
}

export class LoginFlow {
    _email = '';
    _password = '';
    _callback = null;
    _pollId = null;

    constructor(email, password, callback) {
        this._email = email;
        this._password = password;
        this._callback = callback;
    }

    /** Opens the Google Accounts login page and starts trying to complete the sign-in flow. */
    async start() {
        await waitForOnlineAndReachable(googleLoginUrl);
        chrome.tabs.create({ url: googleLoginUrl }, (tab) => {
            const onContentScriptLoaded = () => {
                this._pollId = setInterval(() => this.pollLogin(tab.id), loginPollTimeoutMillseconds);
            };
            setTimeout(
                () => injectScriptWithRetries(tab.id, 'content/login.js', onContentScriptLoaded),
                // Wait till the "shared" content scripts have loaded before injecting login.js.
                // TODO: figure out a better way to actually wait for scripts loading.
                2000);
        });
    }

    async pollLogin(tabId) {
        debug(`Polling login state..`);
        const state = await getLoginState(tabId, this._email);
        if (state === LOGIN_STATE.TAB_INACCESSIBLE || state === LOGIN_STATE.TAB_CLOSED) {
            // Tab navigates to another URL when login is complete.
            this.markComplete();
            return;
        }
        const response = generateNextLoginMessage(state, this._email, this._password);
        if (response) {
            sendMessage(tabId, response);
        }
    }

    markComplete() {
        clearInterval(this._pollId);
        info('Login flow is complete.');
        this._callback();
    }
}
