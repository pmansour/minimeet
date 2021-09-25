// Expects a variable named 'filename' to exist.
(function () {
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
})();
