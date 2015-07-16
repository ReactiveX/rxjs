import Observable from '../Observable';
const EMPTY = new Observable((subscriber) => {
    subscriber.complete();
});
export default function empty() {
    return EMPTY;
}
;
