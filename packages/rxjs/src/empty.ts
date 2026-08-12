import '@rxjs/observable-polyfill';

export const EMPTY = new Observable((subscriber) => {
    subscriber.complete();
});