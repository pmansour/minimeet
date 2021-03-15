import { LoginFlow } from './login.js';
import { startMeetTab } from './meetings.js';

async function main() {
    const loginFlow = new LoginFlow(emailAddress, password);
    await loginFlow.start();
    
    info('Control-flow returned to landing.js');

    // TODO: convert this to flow class as well.
    await startMeetTab();
}

main();