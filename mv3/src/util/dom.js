/* Contains helper functions for dealing with DOM elements. */

/* Returns whether the given DOM element is visible. */
function isVisible(el) {
    return !!el && el.computedStyleMap().get('display').value != 'none';
}
/* Returns the text content of the given element, not including its descendants. */
function getSelfTextContent(el) {
    // Only get this element's text, not its descendants.
    return (el.childNodes[0] && el.childNodes[0].nodeValue) || '';
}

// Selector functions.

/* Look for a visible button that (recursively) includes the given substring. */
export function byButtonText(substr) {
    return {
        selector: 'button',
        // Note: also includes descendant text.
        filter_fn: (el) => isVisible(el) && el.textContent.includes(substr),
    }
}
/* Look for a visible div or span whose aria-label includes the given substring. */
export function byAriaLabel(substr) {
    return {
        selector: 'div[aria-label],span[aria-label]',
        filter_fn: (el) => isVisible(el) && el.getAttribute('aria-label').includes(substr),
    }
}
/* Look for a visible div or span whose own text includes the given substring. */
export function byVisibleSelfText(substr) {
    return {
        selector: 'div,span',
        filter_fn: (el) => isVisible(el) && getSelfTextContent(el).includes(substr),
    }
}
export function bySelector(selector) {
    return { selector }
}

/* Tries to find a DOM element with the given selector and optional filter functions, or null
   if it can't find one. */
export function getElement({ selector = 'div,span', filter_fn = null }) {
    filter_fn = filter_fn || (() => true);

    return Array
        .from(document.querySelectorAll(selector))
        .filter(filter_fn)
        [0] || null;
}

/* Focuses on and sets the value of the given input. */
export function fillInput(element, value) {
    element.focus();
    element.value = value;
}
