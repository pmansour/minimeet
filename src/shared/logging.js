/** Contains helper functinos for logging to either the DOM or the console. */

const shouldLogToDom = !!document.getElementById('logs');

const LogLevel = Object.freeze({
    debug: {
        prefix: 'DEBUG',
        class: 'text-muted',
    },
    info: {
        prefix: 'INFO',
        class: 'text-body',
    },
    warn: {
        prefix: 'WARNING',
        class: 'text-warning',
    },
    error: {
        prefix: 'ERROR',
        class: 'text-danger',
    },
});

function logToDom(level, data) {
    if (typeof data === "object") data = JSON.stringify(data);
    
    const codeContainer = document.getElementById('logs').appendChild(document.createElement('code'));
    codeContainer.classList.add(level.class);
    codeContainer.innerText = `[${level.prefix}] ${data}\n`;
}

function debug(data) { shouldLogToDom ? logToDom(LogLevel.debug, data) : console.debug(data); }
function info(data) { shouldLogToDom ? logToDom(LogLevel.info, data) : console.info(data); }
function warn(data) { shouldLogToDom ? logToDom(LogLevel.warn, data) : console.warn(data); }
function error(data) { shouldLogToDom ? logToDom(LogLevel.error, data) : console.error(data); }
