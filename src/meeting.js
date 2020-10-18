/**
 * Runs on startup. Tries to start 
 * Periodically looks for the 'Join now' button and clicks it.
 */

const API_KEY = 'AIzaSyBAOiSGCe1hy8uKjmS6V-yoClSvhn-thTA';

function joinQueryParams(queryParams) {
    return Object.keys(queryParams)
        .reduce((str, key) => {
            if (!queryParams.hasOwnProperty(key)) {
                return str;
            }

            if (str) {
                str += '&';
            }

            return str + `${key}=${queryParams[key]}`;
        }, '');
}

async function listEvents(token, queryParams) {
    let init = {
        method: 'GET',
        async: true,
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        'contentType': 'json',
    };
    queryStr = joinQueryParams(queryParams);
    console.debug(queryStr);
    let response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?${queryStr}`,
        init
    );
    return response.json();
}

async function findOngoingMeeting(token) {
    queryParams = {
        key: API_KEY,
        timeMin: new Date(new Date().getDate() - 1).toISOString(),
        showDeleted: false,
        singleEvents: true,
        orderBy: 'startTime',
    }

    let meetings = await listEvents(token, queryParams);
    console.debug('Calendar API response:');
    console.debug(meetings);

    ongoingMeetings = meetings.items.filter(meeting => new Date(meeting.end.dateTime) > new Date());
    if (ongoingMeetings.length) {
        return ongoingMeetings[0];
    }
    return null;
}

async function findNextMeeting(token) {
    queryParams = {
        key: API_KEY,
        timeMin: (new Date()).toISOString(),
        showDeleted: false,
        singleEvents: true,
        maxResults: 1,
        orderBy: 'startTime',
    }

    let meetings = await listEvents(token, queryParams);
    console.debug('Calendar API response:');
    console.debug(meetings);
    return meetings.items[0];
}

function goToMeeting(meetingId) {
    chrome.tabs.create({url: `https://meet.google.com/${meetingId}`}, (tab) => {
        chrome.tabs.executeScript(tab.id, {
            file: 'joinMeeting.js',
        });
        // closeCurrentTab();
    });
}

function showNoMeetingMessage() {
    console.log('No meetings available');
}

function joinFirstMeeting() {
    chrome.identity.getAuthToken({interactive: true}, async (token) => {
        let meeting = await findOngoingMeeting(token);
        if (!meeting) {
            meeting = findNextMeeting(token);
            if (!meeting) {

            }
        }
        // let meeting = await findNextMeeting(token);
        goToMeeting(meeting.conferenceData.conferenceId);
    });
}

function closeCurrentTab() {
    chrome.tabs.getCurrent((tab) => {
        chrome.tabs.remove(tab.id);
    });
}
joinFirstMeeting();