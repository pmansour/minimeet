import { LoginFlow } from './login.js';
import { startMeetTab } from './meetings.js';

async function main() {
    const creds = await fetch('http://localhost:8090/credentials').then(response => response.json());
    const username = creds.googleAccount && creds.googleAccount.username;
    const password = creds.googleAccount && creds.googleAccount.password;
    if (!username || !password) {
        error(`Could not find credentials. API responded with: '${JSON.stringify(creds)}'`);
        return;
    }
    info(`Received credentials for account '${username}'.`);

    const loginFlow = new LoginFlow(username, password);
    await loginFlow.start();

    info('Control-flow returned to landing.js');

    // TODO: convert this to flow class as well.
    await startMeetTab();
}

main();