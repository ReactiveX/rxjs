import {Operator} from '../Operator';
import {Subscriber} from '../Subscriber';
import {Observable} from '../Observable';
import {Subject} from '../Subject';

export function window<T>(closingNotifier: Observable<any>): Observable<Observable<T>> {
  return this.lift(new WindowOperator(closingNotifier));
}

class WindowOperator<T> implements Operator<T, Observable<T>> {

  constructor(private closingNotifier: Observable<any>) {
  }

  call(subscriber: Subscriber<Observable<T>>): Subscriber<T> {
    return new WindowSubscriber(subscriber, this.closingNotifier);
  }
}

class WindowSubscriber<T> extends Subscriber<T> {
  private window: Subject<T>;

  constructor(protected destination: Subscriber<Observable<T>>,
              private closingNotifier: Observable<any>) {
    super(destination);
    this.add(closingNotifier.subscribe(new WindowClosingNotifierSubscriber(this)));
    this.openWindow();
  }

  protected _next(value: T) {
    this.window.next(value);
  }

  protected _error(err: any) {
    this.window.error(err);
    this.destination.error(err);
  }

  protected _complete() {
    this.window.complete();
    this.destination.complete();
  }

  openWindow() {
    const prevWindow = this.window;
    if (prevWindow) {
      prevWindow.complete();
    }
    const destination = this.destination;
    const newWindow = this.window = new Subject<T>();
    destination.add(newWindow);
    destination.next(newWindow);
  }

  errorWindow(err: any) {
    this._error(err);
  }

  completeWindow() {
    this._complete();
  }
}

class WindowClosingNotifierSubscriber extends Subscriber<any> {
  constructor(private parent: WindowSubscriber<any>) {
    super();
  }

  protected _next() {
    this.parent.openWindow();
  }

  protected _error(err: any) {
    this.parent.errorWindow(err);
  }

  protected _complete() {
    this.parent.completeWindow();
  }
}
