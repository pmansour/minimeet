/** Base URL for Google Meet, with no path. */
const meetBaseUrl = 'https://meet.google.com';

/** URL for signing in to Google. */
const baseGoogleLoginUrl = 'https://accounts.google.com/signin/v2';

/** URL to initially go to Google. */
export const initialUrl = `${baseGoogleLoginUrl}?continue=${encodeURIComponent(meetBaseUrl)}`;
// export const initialUrl = `${baseGoogleLoginUrl}/identifier?continue=${encodeURIComponent(meetBaseUrl)}&flowName=GlifWebSignIn&flowEntry=ServiceLogin`;

/** URL for signing out of Google. */
const googleLogoutUrl = 'https://www.google.com/accounts/Logout';
