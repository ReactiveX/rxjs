import Observable from '../Observable';
const EMPTY = new Observable((observer) => {
    observer.complete();
});
export default function empty() {
    return EMPTY;
}
;
