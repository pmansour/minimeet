/** Base URL for Google Meet, with no path. */
const meetBaseUrl = 'https://meet.google.com';

/** URL for signing in to Google. */
const baseGoogleLoginUrl = 'https://accounts.google.com/signin/v2';

/** URL to initially go to Google. */
export const initialUrl = `${baseGoogleLoginUrl}?continue=${encodeURIComponent(meetBaseUrl)}`;
