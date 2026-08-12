import '@rxjs/observable-polyfill';

export enum NotificationKind {
  NEXT = 'N',
  ERROR = 'E',
  COMPLETE = 'C',
}

export interface NextNotification<T> {
  readonly kind: 'N';
  readonly value: T;
}

export interface ErrorNotification {
  readonly kind: 'E';
  readonly error: any;
}

export interface CompleteNotification {
  readonly kind: 'C';
}

export type ObservableNotification<T> = NextNotification<T> | ErrorNotification | CompleteNotification;
export type ValueFromNotification<N> = N extends NextNotification<infer T> ? T : never;

export class Notification<T> {
  readonly hasValue: boolean;

  constructor(kind: 'N', value?: T);
  constructor(kind: 'E', value: undefined, error: any);
  constructor(kind: 'C');
  constructor(public readonly kind: 'N' | 'E' | 'C', public readonly value?: T, public readonly error?: any) {
    this.hasValue = kind === 'N';
  }

  observe(observer: Partial<Observer<T>>): void {
    observeNotification(this as ObservableNotification<T>, observer);
  }

  do(next: (value: T) => void, error?: (error: any) => void, complete?: () => void): void {
    if (this.kind === 'N') {
      next?.(this.value as T);
    } else if (this.kind === 'E') {
      error?.(this.error);
    } else {
      complete?.();
    }
  }

  accept(observer: Partial<Observer<T>>): void;
  accept(next: (value: T) => void, error?: (error: any) => void, complete?: () => void): void;
  accept(nextOrObserver: Partial<Observer<T>> | ((value: T) => void), error?: (error: any) => void, complete?: () => void): void {
    if (typeof nextOrObserver === 'object' && nextOrObserver !== null) {
      this.observe(nextOrObserver);
    } else {
      this.do(nextOrObserver, error, complete);
    }
  }

  toObservable(): Observable<T> {
    const { kind, value, error } = this;
    if (kind !== 'N' && kind !== 'E' && kind !== 'C') {
      throw new TypeError(`Unexpected notification kind ${kind}`);
    }

    return new Observable<T>((subscriber) => {
      if (kind === 'N') {
        subscriber.next(value as T);
        subscriber.complete();
      } else if (kind === 'E') {
        subscriber.error(error);
      } else {
        subscriber.complete();
      }
    });
  }

  private static readonly completeNotification = new Notification('C') as Notification<never> & CompleteNotification;

  static createNext<T>(value: T): Notification<T> & NextNotification<T> {
    return new Notification('N', value) as Notification<T> & NextNotification<T>;
  }

  static createError<T = never>(error?: any): Notification<T> & ErrorNotification {
    return new Notification('E', undefined, error) as Notification<T> & ErrorNotification;
  }

  static createComplete<T = never>(): Notification<T> & CompleteNotification {
    return Notification.completeNotification as unknown as Notification<T> & CompleteNotification;
  }
}

export const COMPLETE_NOTIFICATION: CompleteNotification = Object.freeze({ kind: 'C' });

export function nextNotification<T>(value: T): NextNotification<T> {
  return { kind: 'N', value };
}

export function errorNotification(error: any): ErrorNotification {
  return { kind: 'E', error };
}

export function observeNotification<T>(notification: ObservableNotification<T>, observer: Partial<Observer<T>>): void {
  if (typeof (notification as { kind?: unknown }).kind !== 'string') {
    throw new TypeError('Invalid notification, missing "kind"');
  }

  if (notification.kind === 'N') {
    observer.next?.(notification.value);
  } else if (notification.kind === 'E') {
    observer.error?.(notification.error);
  } else {
    observer.complete?.();
  }
}
