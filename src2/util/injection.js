/**
 * Inject the given filename as a module in the tab with the given ID.
 * @param {*} tabId The tab in which to inject the module.
 * @param {*} filename The filename, relative to the script root, to inject.
 * @returns A promise that resolves once the injection was successful.
 */
export function executeModule(tabId, filename) {
    const moduleLoader = (filename) => {
        const elementId = `minimeet_${filename.replace(/\W/g, '_')}`;
        if (!!document.getElementById(elementId)) {
            // Already injected, stop here.
            console.debug(`Module '${elementId}' already injected; exiting module loader..`);
            return;
        }
        const script = document.createElement('script');
        script.setAttribute('type', 'module');
        script.setAttribute('src', filename);
        script.id = elementId;
        document.head.insertBefore(script, document.head.lastChild);
        console.info(`Successfully injected module '${elementId}'.`);
    }
    return chrome.scripting.executeScript({
        target: { tabId },
        func: moduleLoader,
        args: [chrome.runtime.getURL(filename)],
    });
}
