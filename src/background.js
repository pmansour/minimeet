/**
 * Runs on a specific meeting's pre-join page.
 * Periodically looks for the 'Join now' button and clicks it.
 */

// const API_KEY = 'AIzaSyBAOiSGCe1hy8uKjmS6V-yoClSvhn-thTA';

// function joinQueryParams(queryParams) {
//     return Object.keys(queryParams)
//         .reduce((str, key) => {
//             if (!queryParams.hasOwnProperty(key)) {
//                 return str;
//             }

//             if (str) {
//                 str += '&';
//             }

//             return str + `${key}=${queryParams[key]}`;
//         }, '');
// }

// async function findNextMeeting(token) {
//     let init = {
//         method: 'GET',
//         async: true,
//         headers: {
//             Authorization: 'Bearer ' + token,
//             'Content-Type': 'application/json',
//         },
//         'contentType': 'json',
//     };

//     queryParams = {
//         key: API_KEY,
//         timeMin: (new Date()).toISOString(),
//         showDeleted: false,
//         singleEvents: true,
//         maxResults: 1,
//         orderBy: 'startTime',
//     }
//     queryStr = joinQueryParams(queryParams);

//     let response = await fetch(
//         `https://www.googleapis.com/calendar/v3/calendars/primary/events?${queryStr}`,
//         init
//     );
//     let json = await response.json();
//     console.debug('Calendar API response:');
//     console.debug(json);
//     return json.items[0];
// }

// function goToMeeting(meetingId) {
//     chrome.tabs.create({url: `https://meet.google.com/${meetingId}`}, (tab) => {
//         chrome.tabs.executeScript(tab.id, {
//             file: 'joinMeeting.js',
//         });
//     });
// }

// function joinFirstMeeting() {
//     chrome.identity.getAuthToken({interactive: true}, async (token) => {
//         let meeting = await findNextMeeting(token);
//         goToMeeting(meeting.conferenceData.conferenceId);
//     });
// }

chrome.runtime.onInstalled.addListener(() => {
    chrome.identity.getAuthToken({interactive: true});
});
chrome.runtime.onStartup.addListener(() => {
    chrome.tabs.create({ url: 'meeting.html' });
});
chrome.browserAction.onClicked.addListener(() => {
    chrome.tabs.create({ url: 'meeting.html' });
});
