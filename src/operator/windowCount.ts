import {Operator} from '../Operator';
import {Subscriber} from '../Subscriber';
import {Observable} from '../Observable';
import {Subject} from '../Subject';

/**
 * @param windowSize
 * @param startWindowEvery
 * @return {Observable<Observable<any>>|WebSocketSubject<T>|Observable<T>}
 * @method windowCount
 * @owner Observable
 */
export function windowCount<T>(windowSize: number,
                               startWindowEvery: number = 0): Observable<Observable<T>> {
  return this.lift(new WindowCountOperator<T>(windowSize, startWindowEvery));
}

export interface WindowCountSignature<T> {
  (windowSize: number, startWindowEvery?: number): Observable<Observable<T>>;
}

class WindowCountOperator<T> implements Operator<T, Observable<T>> {

  constructor(private windowSize: number,
              private startWindowEvery: number) {
  }

  call(subscriber: Subscriber<Observable<T>>): Subscriber<T> {
    return new WindowCountSubscriber(subscriber, this.windowSize, this.startWindowEvery);
  }
}

class WindowCountSubscriber<T> extends Subscriber<T> {
  private windows: Subject<T>[] = [ new Subject<T>() ];
  private count: number = 0;

  constructor(protected destination: Subscriber<Observable<T>>,
              private windowSize: number,
              private startWindowEvery: number) {
    super(destination);
    const firstWindow = this.windows[0];
    destination.add(firstWindow);
    destination.next(firstWindow);
  }

  protected _next(value: T) {
    const startWindowEvery = (this.startWindowEvery > 0) ? this.startWindowEvery : this.windowSize;
    const destination = this.destination;
    const windowSize = this.windowSize;
    const windows = this.windows;
    const len = windows.length;

    for (let i = 0; i < len; i++) {
      windows[i].next(value);
    }
    const c = this.count - windowSize + 1;
    if (c >= 0 && c % startWindowEvery === 0) {
      windows.shift().complete();
    }
    if (++this.count % startWindowEvery === 0) {
      const window = new Subject<T>();
      windows.push(window);
      destination.add(window);
      destination.next(window);
    }
  }

  protected _error(err: any) {
    const windows = this.windows;
    while (windows.length > 0) {
      windows.shift().error(err);
    }
    this.destination.error(err);
  }

  protected _complete() {
    const windows = this.windows;
    while (windows.length > 0) {
      windows.shift().complete();
    }
    this.destination.complete();
  }
}
