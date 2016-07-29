import {Subject} from '../Subject';
import {Observable, IObservable} from '../Observable';
import {Subscriber} from '../Subscriber';
import {Subscription} from '../Subscription';
import {ConnectableObservable} from '../observable/ConnectableObservable';

export interface IMulticastObservable<T> extends IObservable<T> { }
export interface MulticastObservable<T> extends IMulticastObservable<T> { }

export class MulticastObservable<T> extends Observable<T> {
  constructor(protected source: IObservable<T>,
              private subjectFactory: () => Subject<T>,
              private selector: (source: IObservable<T>) => IObservable<T>) {
    super();
  }

  protected _subscribe(subscriber: Subscriber<T>): Subscription {
    const { selector, source } = this;
    const connectable = new ConnectableObservable(source, this.subjectFactory);
    const subscription = selector(connectable).subscribe(subscriber);
    subscription.add(connectable.connect());
    return subscription;
  }
}
