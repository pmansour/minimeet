import { debug, info } from './logging.js';

// /**
//  * Execute a given set of files into the tab with the given ID.
//  * @param {*} tabId The tab in which to inject the scripts.
//  * @param {*} files The file names of the scripts to inject.
//  * @returns Promise that resolves when all scripts have executed.
//  */
// export function executeScripts(tabId, files) {
//     return Promise.all(files.map((file) => {
//         debug(`Injecting '${file}' into tab '${tabId}'.`);
//         return chrome.scripting.executeScript({
//             target: { tabId },
//             files: [file],
//         });
//     }));
// }

/**
 * Inject the given filename as a module in the tab with the given ID.
 * @param {*} tabId The tab in which to inject the module.
 * @param {*} filename The filename, relative to the script root, to inject.
 * @returns A promise that resolves once the injection was successful.
 */
export function executeModule(tabId, filename) {
    const moduleLoader = (filename) => {
        const script = document.createElement('script');
        script.setAttribute('type', 'module');
        script.setAttribute('src', filename);
        document.head.insertBefore(script, document.head.lastChild);
    }
    return chrome.scripting.executeScript({
        target: { tabId },
        func: moduleLoader,
        args: [chrome.runtime.getURL(filename)],
    });
}