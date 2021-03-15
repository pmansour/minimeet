/**
 * Runs on extension startup.
 */

chrome.runtime.onStartup.addListener(() => {
    chrome.tabs.create({ url: 'extension/landing.html' });
});
chrome.browserAction.onClicked.addListener(() => {
    chrome.tabs.create({ url: 'extension/landing.html' });
});
