/**
 * Runs on a specific meeting's pre-join page.
 * Periodically looks for the 'Join now' button and clicks it.
 */

setInterval(() => {
    const btn = getElement(byButtonText('Join now'));
    if (btn) {
        btn.click();
    }
}, retryTimeoutMilliseconds);
