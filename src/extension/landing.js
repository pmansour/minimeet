import { LoginFlow } from './login.js';

const loginFlow = new LoginFlow(emailAddress, password, () => info('Login flow is complete!'));
loginFlow.startLoginFlow();
