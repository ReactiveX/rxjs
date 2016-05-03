import {PartialObserver} from '../Observer';
import {Subscriber} from '../Subscriber';
import {Subject} from '../Subject';

export function toSubscriber<T>(
  nextOrObserver?: PartialObserver<T> | ((value: T) => void),
  error?: (error: any) => void,
  complete?: () => void): Subscriber<T> {

  if (nextOrObserver instanceof Subscriber) {
    return (<Subscriber<T>> nextOrObserver);
  }

  if (nextOrObserver instanceof Subject) {
    return new SubjectSubscriber(<Subject<T>> nextOrObserver);
  }

  return new Subscriber(nextOrObserver, error, complete);
}


export class SubjectSubscriber<T> extends Subscriber<T> {
  constructor(protected destination: Subject<T>) {
    super(destination);
  }
}