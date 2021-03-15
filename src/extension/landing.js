import { LoginFlow } from './login.js';

const loginFlow = new LoginFlow(emailAddress, password, () => info('Control-flow returned to landing.js'));
loginFlow.start();
