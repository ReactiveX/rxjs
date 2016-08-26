import { Subject } from '../Subject';
import { Observable } from '../Observable';
import { Subscriber } from '../Subscriber';
import { Subscription } from '../Subscription';
import { ConnectableObservable } from '../observable/ConnectableObservable';

export class MulticastObservable<T> extends Observable<T> {
  constructor(protected source: Observable<T>,
              private subjectFactory: () => Subject<T>,
              private selector: (source: Observable<T>) => Observable<T>) {
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
