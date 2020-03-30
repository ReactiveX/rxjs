declare const global: any;

import { of, asyncScheduler, Observable, scheduled, ObservableInput } from 'rxjs';
import { root } from 'rxjs/internal/util/root';
import { observable } from 'rxjs/internal/symbol/observable';
import { iterator } from 'rxjs/internal/symbol/iterator';
import * as sinon from 'sinon';
import { expect } from 'chai';

if (process && process.on) {
  /**
   * With async/await functions in Node, mocha seems to allow
   * tests to pass, even they shouldn't there's something about how
   * it handles the rejected promise where it does not notice
   * that the test failed.
   */
  process.on('unhandledRejection', err => {
    console.error(err);
    process.exit(1);
  });
}

export function lowerCaseO<T>(...args: Array<any>): Observable<T> {
  const o: any = {
    subscribe(observer: any) {
      args.forEach(v => observer.next(v));
      observer.complete();
      return {
        unsubscribe() { /* do nothing */ }
      };
    }
  };

  o[observable] = function (this: any) {
    return this;
  };

  return <any>o;
}

export const createObservableInputs = <T>(value: T) => of(
  of(value),
  scheduled([value], asyncScheduler),
  [value],
  Promise.resolve(value),
  {
    [iterator]: () => {
      const iteratorResults = [
        { value, done: false },
        { done: true }
      ];
      return {
        next: () => {
          return iteratorResults.shift();
        }
      };
    }
  } as any as Iterable<T>,
  {
    [observable]: () => of(value)
  } as any
) as Observable<ObservableInput<T>>;

/**
 * Used to signify no subscriptions took place to `expectSubscriptions` assertions.
 */
export const NO_SUBS: string[] = [];

/**
 * Does a deep equality assertion. Used to set up {@link TestScheduler}, so that
 * trees of marbles can be compared.
 * @param actual The value to run the expectation against.
 * @param expected The value expected.
 */
export function assertDeepEquals (actual: any, expected: any) {
  expect(actual).to.deep.equal(expected);
}

global.__root__ = root;

let _raf: any;
let _caf: any;
let _id = 0;

/**
 * A type used to test `requestAnimationFrame`
 */
export interface RAFTestTools {
  /**
   * Synchronously fire the next scheduled animation frame
   */
  tick(): void;

  /**
   * Synchronously fire all scheduled animation frames
   */
  flush(): void;

  /**
   * Un-monkey-patch `requestAnimationFrame` and `cancelAnimationFrame`
   */
  restore(): void;
}

/**
 * Monkey patches `requestAnimationFrame` and `cancelAnimationFrame`, returning a
 * toolset to allow animation frames to be synchronously controlled.
 *
 * ### Usage
 * ```ts
 * let raf: RAFTestTools;
 *
 * beforeEach(() => {
 *   // patch requestAnimationFrame
 *   raf = stubRAF();
 * });
 *
 * afterEach(() => {
 *   // unpatch
 *   raf.restore();
 * });
 *
 * it('should fire handlers', () => {
 *   let test = false;
 *   // use requestAnimationFrame as normal
 *   requestAnimationFrame(() => test = true);
 *   // no frame has fired yet (this would be generally true anyhow)
 *   expect(test).to.equal(false);
 *   // manually fire the next animation frame
 *   raf.tick();
 *   // frame as fired
 *   expect(test).to.equal(true);
 *   // raf is now a SinonStub that can be asserted against
 *   expect(requestAnimationFrame).to.have.been.calledOnce;
 * });
 * ```
 */
export function stubRAF(): RAFTestTools {
  _raf = requestAnimationFrame;
  _caf = cancelAnimationFrame;

  const handlers: any[] = [];

  (requestAnimationFrame as any) = sinon.stub().callsFake((handler: Function) => {
    const id = _id++;
    handlers.push({ id, handler });
    return id;
  });

  (cancelAnimationFrame as any) = sinon.stub().callsFake((id: number) => {
    const index = handlers.findIndex(x => x.id === id);
    if (index >= 0) {
      handlers.splice(index, 1);
    }
  });

  function tick() {
    if (handlers.length > 0) {
      handlers.shift().handler();
    }
  }

  function flush() {
    while (handlers.length > 0) {
      handlers.shift().handler();
    }
  }

  return {
    tick,
    flush,
    restore() {
      (requestAnimationFrame as any) = _raf;
      (cancelAnimationFrame as any) = _caf;
      _raf = _caf = undefined;
      handlers.length = 0;
      _id = 0;
    }
  };
}