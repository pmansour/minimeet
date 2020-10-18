/**
 * Runs on a specific meeting's pre-join page.
 * Periodically looks for the 'Join now' button and clicks it.
 */

 const retryTimeoutMilliseconds = 2000;

function tryJoinMeeting() {
    const buttons = Array.from(document.querySelectorAll('span')).filter((element) => element.textContent.includes('Join now'));
    if (!buttons || !buttons.length) {
        console.log(`Could not find join button. Will try again in ${retryTimeoutMilliseconds / 1000} seconds.`);
        return;
    }

    buttons[0].click();
}

tryJoinMeeting();
window.setInterval(tryJoinMeeting, retryTimeoutMilliseconds);
