/** Prints the the last error (if present). */
export function checkError() {
    if (chrome.runtime.lastError) {
        warn(`Last error: ${chrome.runtime.lastError.message}`);
    }
}

export function getTab(tabId) {
    return new Promise((resolve) => {
        chrome.tabs.get(tabId, (tab) => resolve(tab));
    });
}

export const SHARED_INJECTION_SCRIPTS = [
    'shared/config.js',
    'shared/dom.js',
    'shared/logging.js',
    'shared/state.js'
];

export function injectWithDependencies(tabId, scriptFile, onSuccess = null) {
    injectScripts(tabId, SHARED_INJECTION_SCRIPTS.concat([scriptFile]), onSuccess);
}

/** Injects the given script files into a given tab then calls the given callback. */
export function injectScripts(tabId, scriptFiles, onSuccess = null) {
    if (scriptFiles.length < 1) {
        return;
    }
    chrome.tabs.executeScript(tabId, {
        file: scriptFiles[0],
    }, () => {
        if (!chrome.runtime.lastError) {
            info(`Injected '${scriptFiles[0]}' into tab '${tabId}'.`);
            if (scriptFiles.length > 1) {
                injectScripts(tabId, scriptFiles.slice(1), onSuccess);
                return;
            }
            if (onSuccess) { onSuccess(); }
            return;
        }

        error(`Error while injecting script into tab '${tabId}'.`);
        checkError();
        if (chrome.runtime.lastError.message.includes('The tab was closed')) {
            debug('Will not retry since the tab was closed.');
            return;
        }

        setTimeout(
            injectScripts,
            retryTimeoutMilliseconds,
            tabId, scriptFiles, onSuccess);
    });
}

export function sendMessage(tabId, data, callback = null) {
    chrome.tabs.sendMessage(tabId, data, (response) => {
        debug(`Sent '${JSON.stringify(data)}' to tab '${tabId}', got back '${JSON.stringify(response)}'.`);
        if (callback) {
            callback(response);
        }
    });
}

/** Checks whether the device is online and the given URL is reachable. */
export async function isOnlineAndReachable(url) {
    if (!navigator.onLine) {
        warn('Device is offline.');
        return false;
    }
    try {
        await fetch(url, { mode: 'no-cors' });
        return true;
    } catch(e) {
        warn(`Failed to make test request to '${url}'`);
        warn(e);
        return false;
    }
}

/** Executes the given callback when the device is online and the given URL is reachable. */
export async function waitForOnlineAndReachable(url) {
    return new Promise((resolve) => {
        const checkReachability = async () => {
            if (await isOnlineAndReachable(url)) {
                info(`Device is online and '${url}' is reachable.`);
                resolve();
                return;
            }
            debug(`'${url}' is unreachable; waiting ${+((retryTimeoutMilliseconds / 1000).toFixed(2))} seconds before retrying..`);
            setTimeout(checkReachability, retryTimeoutMilliseconds);
        };
        checkReachability();
    });
}
