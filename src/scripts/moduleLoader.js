function injectionListener(request, sender, sendResponse) {
    console.debug(`Listener received message: ${JSON.stringify(request)}`);
    // Only accept messages from the parent.
    if (sender.tab) {
        console.warn('Ignoring message received from other tab.');
        return;
    }

    if (!request.scriptRelativeUrl) {
        console.warn('Message did not include script URL.');
        return;
    }

    chrome.runtime.onMessage.removeListener(injectionListener);

    const url = chrome.runtime.getURL(request.scriptRelativeUrl);
    console.debug(`Normalized URL: '${url}'`);

    const script = document.createElement('script');
    script.setAttribute('type', 'module');
    script.setAttribute('src', url);
    document.body.appendChild(script);
    sendResponse({ done: true });
}

chrome.runtime.onMessage.addListener(injectionListener);