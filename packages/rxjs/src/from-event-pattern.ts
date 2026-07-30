import { create } from './create.js';

type EventPatternHandler = (...args: any[]) => void;

export function fromEventPattern<T>(
  addHandler: (handler: EventPatternHandler) => any,
  removeHandler?: (handler: EventPatternHandler, signal?: any) => void
): Observable<T>;
export function fromEventPattern<T>(
  addHandler: (handler: EventPatternHandler) => any,
  removeHandler: ((handler: EventPatternHandler, signal?: any) => void) | undefined,
  resultSelector: (...args: any[]) => T
): Observable<T>;
export function fromEventPattern<T>(
  addHandler: (handler: EventPatternHandler) => any,
  removeHandler?: (handler: EventPatternHandler, signal?: any) => void,
  resultSelector?: (...args: any[]) => T
): Observable<T> {
  return Observable[create]<T>((subscriber) => {
    let registrationComplete = false;
    let registrationSucceeded = false;
    let removalPending = false;
    let removed = false;
    let token: unknown;

    const handler: EventPatternHandler = (...args) => {
      if (!subscriber.active) {
        return;
      }

      let value: T;
      if (resultSelector) {
        try {
          value = resultSelector(...args);
        } catch (error) {
          subscriber.error(error);
          return;
        }
      } else {
        value = (args.length === 1 ? args[0] : args) as T;
      }

      subscriber.next(value);
    };

    const remove = () => {
      if (!removeHandler || removed) {
        return;
      }
      if (!registrationComplete) {
        removalPending = true;
        return;
      }
      if (!registrationSucceeded) {
        return;
      }

      removed = true;
      removeHandler(handler, token);
    };

    if (removeHandler) {
      subscriber.addTeardown(remove);
    }

    try {
      token = addHandler(handler);
      registrationSucceeded = true;
    } catch (error) {
      registrationComplete = true;
      subscriber.error(error);
      return;
    }
    registrationComplete = true;

    if (removalPending) {
      try {
        remove();
      } catch (error) {
        subscriber.error(error);
      }
    }
  });
}
