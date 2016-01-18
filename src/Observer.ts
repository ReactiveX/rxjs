export interface Observer<T> {
  isUnsubscribed: boolean;
  next(value: T): void;
  error(error: any): void;
  complete(): void;
}

export function isObserver<T>(value: any): value is Observer<T> {
  return !!value && typeof value.next === 'function'
                 && typeof value.error === 'function'
                 && typeof value.complete === 'function';
}

export const empty: Observer<any> = {
  isUnsubscribed: true,
  next(value: any): void { /* noop */},
  error(err: any): void { throw err; },
  complete(): void { /*noop*/ }
};
