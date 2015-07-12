import Observable from '../Observable';
import Observer from '../Observer';

const EMPTY = new Observable((observer: Observer) => {
  observer.complete();
});

export default function empty():Observable {
  return EMPTY;
};
