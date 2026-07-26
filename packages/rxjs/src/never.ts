import '@rxjs/observable-polyfill';

export const NEVER = new Observable(() => {
    // Never emit a value.
    // Never complete.
    // Never error.
});