import Observable from '../Observable';
const EMPTY = new Observable(observer => {
    observer.return();
});
export default function empty() {
    return EMPTY;
}
;
