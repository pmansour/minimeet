import { info } from '/src/util/logging.js';

/** URL for signing in to Google. */
const baseGoogleLoginUrl = 'https://accounts.google.com/signin/v2';

/** Base URL for Google Meet, with no path. */
export const meetBaseUrl = 'https://meet.google.com';

/** Get a URL that will ensure the user is logged-in then navigate to the given redirect URL. */
export function getLoginRedirectUrl(redirectUrl) {
    return `${baseGoogleLoginUrl}?continue=${encodeURIComponent(redirectUrl)}`;
}

/** Navigates the current tab to the given URL. Must be called from a content script. */
export function navigateToUrl(url) {
    info(`Navigating to URL '${url}'.`);
    window.location.href = url;
}
