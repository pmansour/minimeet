import { checkError, injectScriptWithRetries, getTab, sendMessage, waitForOnlineAndReachable } from './utils.js';

async function getLoginState(tabId, email) {
    return new Promise(async (resolve, reject) => {
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

    _promise = null;
    _resolve = null;
    _reject = null;

    _tabId = null;
    _pollId = null;

    constructor(email, password) {
        this._email = email;
        this._password = password;
    }

    /** Opens the Google Accounts login page and starts trying to complete the sign-in flow. */
    async start() {
        this._promise = new Promise((resolve, reject) => {
            this._resolve = resolve;
            this._reject = reject;
        });

        await waitForOnlineAndReachable(baseGoogleLoginUrl);
        const urlWithRedirect = `${baseGoogleLoginUrl}?continue=${encodeURIComponent(meetBaseUrl)}`
        chrome.tabs.create({ url: urlWithRedirect }, (tab) => {
            this._tabId = tab.id;
            const onContentScriptLoaded = () => {
                this._pollId = setInterval(() => this.pollLogin(), loginPollTimeoutMillseconds);
            };
            setTimeout(
                () => injectScriptWithRetries(tab.id, 'content/login.js', onContentScriptLoaded),
                // Wait till the "shared" content scripts have loaded before injecting login.js.
                // TODO: figure out a better way to actually wait for scripts loading.
                2000);
        });

        return this._promise;
    }

    async pollLogin() {
        debug(`Polling login state..`);
        if (await this.isLoginTabDone()) {
            return;
        }
        const state = await getLoginState(this._tabId, this._email);
        const response = generateNextLoginMessage(state, this._email, this._password);
        if (response) {
            sendMessage(this._tabId, response);
        }
    }

    async isLoginTabDone() {
        const tab = await getTab(this._tabId);
        debug(`Tab: ${JSON.stringify(tab)}`);
        if (!tab) {
            checkError();
            warn('Login tab was closed prematurely.');
            this.markComplete(false);
            return true;
        }
        if (!tab.url) {
            checkError();
            warn('Login tab is inaccessible.');
            this.markComplete(false);
            return true;
        }
        if (new URL(tab.url).hostname === new URL(meetBaseUrl).hostname) {
            info('Login tab redirected to Meet successfully.');
            this.markComplete(true);
            return true;
        }
        return false;
    }

    markComplete(successful) {
        clearInterval(this._pollId);
        info('Login flow is complete!');
        if (successful) {
            this._resolve();
        } else {
            this._reject();
        }
    }
}
