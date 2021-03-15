import { checkError, injectScriptWithRetries, isTabOpen, sendMessage, waitForOnlineAndReachable } from './utils.js';

/** Reacts to the current login state. */
function handleLoginState(tabId, state) {
    debug(`Login state is ${state}`);
    switch (state) {
        case LOGIN_STATE.LOGGED_OUT_SAME_ACCOUNT:
            debug('Choosing existing profile..');
            sendMessage(tabId, {action: LOGIN_ACTION.CHOOSE_EXISTING_PROFILE, email: emailAddress});
            return;
        case LOGIN_STATE.LOGGED_OUT_NO_ACCOUNT:
            debug('Choosing another account..');
            sendMessage(tabId, {action: LOGIN_ACTION.CHOOSE_ANOTHER_ACCOUNT});
            return;
        case LOGIN_STATE.ENTER_EMAIL:
            debug('Entering email address..');
            sendMessage(tabId, {action: LOGIN_ACTION.ENTER_EMAIL, email: emailAddress});
            return;
        case LOGIN_STATE.ENTER_PASSWORD_SAME_ACCOUNT:
            debug('Entering password..');
            sendMessage(tabId, {action: LOGIN_ACTION.ENTER_PASSWORD, password: '<redacted>'});
            return;
        case LOGIN_STATE.ENTER_PASSWORD_WRONG_ACCOUNT:
            debug('Switching accounts..');
            sendMessage(tabId, {action: LOGIN_ACTION.SWITCH_ACCOUNT});
            return;
    }
    error('Unknown login state.');
}

async function getLoginState(tabId) {
    return new Promise(async (resolve, reject) => {
        if (!await isTabOpen(tabId)) {
            warn('Login tab was closed.');
            checkError();
            reject();
            return;
        }

        sendMessage(tabId, {action: LOGIN_ACTION.GET_STATE, email: emailAddress}, (response) => {
            if (!response || !response.state) {
                reject();
                return;
            }

            resolve(response.state);
        });
    });
}

async function pollLogin(tabId) {
    debug(`Polling login state..`);
    // TODO: add stopping condition once login is complete.
    const state = await getLoginState(tabId);
    handleLoginState(tabId, state);
    setTimeout(pollLogin, loginPollTimeoutMillseconds, tabId);
}

/** Opens the Google Accounts login page and starts trying to complete the sign-in flow. */
export async function startLoginFlow() {
    await waitForOnlineAndReachable(googleLoginUrl);
    chrome.tabs.create({ url: googleLoginUrl }, (tab) => {
        // Wait till the other scripts have loaded.
        setTimeout(
            () => injectScriptWithRetries(tab.id, 'content/login.js', () => pollLogin(tab.id)),
            5000);
    });
}
