export interface Observer<T> {
  isUnsubscribed: boolean;
  next(value: T): void;
  error(error: any): void;
  complete(): void;
}

export const empty: Observer<any> = {
  isUnsubscribed: true,
  next(value: any): void { /* noop */},
  error(err: any): void { throw err; },
  complete(): void { /*noop*/ }
};
