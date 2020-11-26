import { retryTimeoutMilliseconds } from './config.js';

const shouldLogToDom = !!document.getElementById('logs');

const LogLevel = Object.freeze({
    debug: {
        prefix: 'DEBUG',
        class: 'text-muted',
    },
    info: {
        prefix: 'INFO',
        class: 'text-body',
    },
    warn: {
        prefix: 'WARNING',
        class: 'text-warning',
    },
    error: {
        prefix: 'ERROR',
        class: 'text-danger',
    },
});

function logToDom(level, data) {
    if (typeof data === "object") data = JSON.stringify(data);
    
    const codeContainer = document.getElementById('logs').appendChild(document.createElement('code'));
    codeContainer.classList.add(level.class);
    codeContainer.innerText = `[${level.prefix}] ${data}\n`;
}

export function debug(data) { shouldLogToDom ? logToDom(LogLevel.debug, data) : console.debug(data); }
export function info(data) { shouldLogToDom ? logToDom(LogLevel.info, data) : console.info(data); }
export function warn(data) { shouldLogToDom ? logToDom(LogLevel.warn, data) : console.warn(data); }
export function error(data) { shouldLogToDom ? logToDom(LogLevel.error, data) : console.error(data); }

/** Prints the the last error (if present). */
export function checkError() {
    if (chrome.runtime.lastError) {
        warn(`Last error: ${chrome.runtime.lastError.message}`);
    }
}

/** Try to inject a script file into a given tab, then call the given callback. */
export function injectScriptWithRetries(tabId, scriptFile, onSuccess = null) {
    chrome.tabs.executeScript(tabId, {
        file: scriptFile,
    }, () => {
        if (!chrome.runtime.lastError) {
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
            injectScriptWithRetries,
            retryTimeoutMilliseconds,
            tabId, scriptFile, onSuccess);
    });
}

export function injectModuleScriptWithRetries(tabId, scriptFile, onSuccess = null) {
    injectScriptWithRetries(tabId, 'scripts/moduleLoader.js', () => {
        debug(`Injected module loader into tab '${tabId}'.`);
        chrome.tabs.sendMessage(tabId, {scriptRelativeUrl: scriptFile}, (response) => {
            if (response.done) {
                debug(`Module loader loaded script '${scriptFile}'.`);
                if (onSuccess) onSuccess();
                return;
            }

            error(`Module loader returned unexpected response: ${response}`);
        });
    });
}

/** Checks whether the device is online and the given URL is reachable. */
export async function isOnlineAndReachable(url) {
    if (!navigator.onLine) {
        warn('Device is offline.');
        return false;
    }
    try {
        const res = await fetch(url);
        debug(`Test request to '${url}' returned with HTTP ${res.status}.`);
        return res.ok;
    } catch(e) {
        warn(`Failed to make test request to '${url}'`);
        warn(e);
        return false;
    }
}

/** Executes the given callback when the device is online and the given URL is reachable. */
export async function waitForOnlineAndReachable(url, callback) {
    if (await isOnlineAndReachable(url)) {
        debug(`Device is online and '${url}' is reachable.`);
        callback();
        return;
    }

    info(`Target URL is unreachable. Waiting ${+((retryTimeoutMilliseconds / 1000).toFixed(2))} seconds before retrying..`);
    setTimeout(
        waitForOnlineAndReachable,
        retryTimeoutMilliseconds,
        url, callback);
}
