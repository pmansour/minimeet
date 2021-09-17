import { debug } from '/util/logging.js';

// Global variable to ensure script only gets injected once.
var wasInjected;
if (!wasInjected) {
    wasInjected = true;
    doStuff();
}

function doStuff() {
    console.log('Hello from the login script!');
}
