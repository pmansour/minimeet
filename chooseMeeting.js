/**
 * Runs on the Google Meets homepage, which should show all the available meetings.
 * Periodically checks for available meetings and joins the first one.
 */

const retryTimeoutMilliseconds = 5000;

function tryChooseFirstMeeting() {
    const meetings = document.querySelectorAll('[data-call-id]');
    if (!meetings || !meetings.length) {
        console.log(`Could not find any meetings. Will try again in ${retryTimeoutMilliseconds / 1000} seconds.`);
        return;
    }

    meetings[0].click();
}

tryChooseFirstMeeting();
window.setInterval(tryChooseFirstMeeting, retryTimeoutMilliseconds);
