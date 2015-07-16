import Observable from '../Observable';
import Subscriber from '../Subscriber';

const EMPTY = new Observable((subscriber: Subscriber) => {
  subscriber.complete();
});

export default function empty():Observable {
  return EMPTY;
};
