const fs = require('fs');
const util = require('util');
const {google} = require('googleapis');

const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
const OAUTH_CREDS_PATH = 'oauth-creds.js';

const readFile = util.promisify(fs.readFile);

export async function getAccessToken(oAuth2Client) {
    const creds = JSON.parse(await readFile('credentials.json'));

    const {client_secret, client_id, redirect_uris} = creds;
    const oAuth2Client = new google.auth.OAuth2(
        client_id,
        client_secret,
        redirect_uris);

    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    
    // TODO: finish implementing this function.
}
