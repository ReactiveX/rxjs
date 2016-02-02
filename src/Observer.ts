export interface NextObserver<T> {
  isUnsubscribed?: boolean;
  next: (value: T) => void;
  error?: (err: any) => void;
  complete?: () => void;
}

export interface ErrorObserver<T> {
  isUnsubscribed?: boolean;
  next?: (value: T) => void;
  error: (err: any) => void;
  complete?: () => void;
}

export interface CompletionObserver<T> {
  isUnsubscribed?: boolean;
  next?: (value: T) => void;
  error?: (err: any) => void;
  complete: () => void;
}

export type PartialObserver<T> = NextObserver<T> | ErrorObserver<T> | CompletionObserver<T>;

export interface Observer<T> {
  isUnsubscribed?: boolean;
  next: (value: T) => void;
  error: (err: any) => void;
  complete: () => void;
}

export const empty: Observer<any> = {
  isUnsubscribed: true,
  next(value: any): void { /* noop */},
  error(err: any): void { throw err; },
  complete(): void { /*noop*/ }
};
