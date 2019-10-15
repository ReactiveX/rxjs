/**
 * Naive factory to global XHR.
 */
const xhrBackend: () => any = () => new XMLHttpRequest(); //loosening return type to `any` to avoid reference to `dom` types

export { xhrBackend };
