/** @prettier */

import { asyncScheduler, config, Observable, observable, ObservableInput, Observer, of, scheduled } from 'rxjs';
import { iterator } from 'rxjs/internal/symbol/iterator';
import { SinonSpy, spy } from 'sinon';

if (process && process.on) {
  /**
   * With async/await functions in Node, mocha seems to allow
   * tests to pass, even they shouldn't there's something about how
   * it handles the rejected promise where it does not notice
   * that the test failed.
   */
  process.on('unhandledRejection', (err) => {
    console.error(err);
    process.exit(1);
  });
}

export interface ConfigHandlerSpies {
  onUnhandledError: SinonSpy;
  onStoppedNotification: SinonSpy;
  uninstallHandlers: () => void;
  done: Mocha.Done;
}

export function withConfigHandlerSpies(fn: (this: Mocha.Context, spies: ConfigHandlerSpies) => void): Mocha.Func {
  return function (mochaDone) {
    const prevOnUnhandledError = config.onUnhandledError;
    const prevOnStoppedNotification = config.onStoppedNotification;

    const onUnhandledError = spy();
    const onStoppedNotification = spy();

    let handlersUninstalled = false;
    const uninstallHandlers = () => {
      if (handlersUninstalled) {
        return;
      }
      handlersUninstalled = true;
      config.onUnhandledError = prevOnUnhandledError;
      config.onStoppedNotification = prevOnStoppedNotification;
    };

    const done = () => {
      uninstallHandlers();
      mochaDone();
    };

    config.onUnhandledError = onUnhandledError;
    config.onStoppedNotification = onStoppedNotification;

    fn.call(this, { onUnhandledError, onStoppedNotification, uninstallHandlers, done });
  };
}

export interface SpiedObserver<T extends 'next' | 'error' | 'complete'> extends Observer<any> {
  next: 'next' extends T ? SinonSpy : never;
  error: 'error' extends T ? SinonSpy : never;
  complete: 'complete' extends T ? SinonSpy : never;
}

export function createSpiedObserver<T extends 'next' | 'error' | 'complete'>(...kinds: T[]): SpiedObserver<T> {
  return (Object.fromEntries(
    (kinds.length > 0 ? kinds : ['next', 'error', 'complete']).map((key) => [key, spy()])
  ) as unknown) as SpiedObserver<T>;
}

export function lowerCaseO<T>(...args: Array<any>): Observable<T> {
  const o: any = {
    subscribe(observer: any) {
      args.forEach((v) => observer.next(v));
      observer.complete();
      return {
        unsubscribe() {
          /* do nothing */
        },
      };
    },
  };

  o[observable] = function (this: any) {
    return this;
  };

  return <any>o;
}

export const createObservableInputs = <T>(value: T) =>
  of(
    of(value),
    scheduled([value], asyncScheduler),
    [value],
    Promise.resolve(value),
    ({
      [iterator]: () => {
        const iteratorResults = [{ value, done: false }, { done: true }];
        return {
          next: () => {
            return iteratorResults.shift();
          },
        };
      },
    } as any) as Iterable<T>,
    {
      [observable]: () => of(value),
    } as any
  ) as Observable<ObservableInput<T>>;

/**
 * Used to signify no subscriptions took place to `expectSubscriptions` assertions.
 */
export const NO_SUBS: string[] = [];
