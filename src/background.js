const API_KEY = 'AIzaSyBAOiSGCe1hy8uKjmS6V-yoClSvhn-thTA';

function joinQueryParams(queryParams) {
    return Object.keys(queryParams)
        .reduce((str, key) =>
            str + (queryParams.hasOwnProperty(key) ? (str.length ? '&' : '') + queryParams[key] : ''));
}

async function getNextMeeting(token) {
    let init = {
        method: 'GET',
        async: true,
        headers: {
            Authorization: 'Bearer ' + token,
            'Content-Type': 'application/json',
        },
        'contentType': 'json',
    };

    queryParams = {
        key: API_KEY,
        timeMin: (new Date()).toISOString(),
        showDeleted: false,
        maxResults: 1,
        orderBy: 'startTime',
    }
    queryStr = joinQueryParams(queryParams);

    let response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?${queryStr}`,
        init
    );
    let json = await response.json();
    console.log(json);
    return json.items[0];
}

function goToMeeting(meetingId) {
    chrome.tabs.create({url: `https://meet.google.com/${meetingId}`}, (tab) => {
        sendJoinMessage(tab.id);
    });
}

function joinFirstMeeting() {
    chrome.identity.getAuthToken({interactive: true}, async (token) => {
        let meeting = await getNextMeeting(token);
        goToMeeting(meeting.conferenceData.conferenceId);
    });
}

/* Stuff in extension. */
// const retryTimeoutMilliseconds = 2000;

// function tryJoinMeeting() {
//     console.log('hello');
//     const buttons = Array.from(document.querySelectorAll('span')).filter((element) => element.textContent.includes('Join now'));
//     if (!buttons || !buttons.length) {
//         console.log(`Could not find join button. Will try again in ${retryTimeoutMilliseconds / 1000} seconds.`);
//         return;
//     }

//     buttons[0].click();
// }

function sendJoinMessage(tabId) {
    chrome.tabs.executeScript(tabId, {
        file: 'joinMeeting.js',
        // code: `window.setInterval(() => { ${tryJoinMeeting} }, 2000);`
    })
    // chrome.tabs.sendMessage(tabId, {joinMeeting: true});
}

chrome.runtime.onInstalled.addListener(() => {
    // TODO: initialize OAuth login.
});
chrome.runtime.onStartup.addListener(() => {
    chrome.tabs.create({ url: "meeting.html" });
});
chrome.browserAction.onClicked.addListener(() => {
    joinFirstMeeting();
});