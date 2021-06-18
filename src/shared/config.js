
/** How long to wait between retries. */
const retryTimeoutMilliseconds = 3000;

const meetingPollFrequencyMilliseconds = 5000;
const loginPollTimeoutMillseconds = 1500;

/** Base URL for Google Meet, with no path. */
const meetBaseUrl = 'https://meet.google.com';

/** URL for signing in to Google. */
const baseGoogleLoginUrl = 'https://accounts.google.com/signin/v2';

/** URL for signing out of Google. */
const googleLogoutUrl = 'https://www.google.com/accounts/Logout';
