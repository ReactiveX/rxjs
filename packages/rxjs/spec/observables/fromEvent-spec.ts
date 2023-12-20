/** @prettier */
import { expect } from 'chai';
import { fromEvent, NEVER, timer } from 'rxjs';
import { mapTo, take, concatWith } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { observableMatcher } from '../helpers/observableMatcher';

/** @test {fromEvent} */
describe('fromEvent', () => {
  let rxTestScheduler: TestScheduler;

  beforeEach(() => {
    rxTestScheduler = new TestScheduler(observableMatcher);
  });

  it('should create an observable of click on the element', () => {
    rxTestScheduler.run(({ expectObservable, time }) => {
      const delay1 = time('-----|     ');
      const delay2 = time('     --|   ');
      const expected = '   -----x-x---';

      const target = {
        addEventListener: (eventType: any, listener: any) => {
          // Here we're just simulating some event target that emits to events after delay1 and delay2.
          timer(delay1, delay2).pipe(mapTo('ev'), take(2), concatWith(NEVER)).subscribe(listener);
        },
        removeEventListener: (): void => void 0,
        dispatchEvent: (): void => void 0,
      };
      const e1 = fromEvent(target as any, 'click');
      expectObservable(e1).toBe(expected, { x: 'ev' });
    });
  });

  it('should setup an event observable on objects with "on" and "off" ', () => {
    let onEventName;
    let onHandler;
    let offEventName;
    let offHandler;

    const obj = {
      on: (a: string, b: (...args: unknown[]) => any) => {
        onEventName = a;
        onHandler = b;
      },
      off: (a: string, b: (...args: unknown[]) => any) => {
        offEventName = a;
        offHandler = b;
      },
    };

    const subscription = fromEvent(obj, 'click').subscribe(() => {
      //noop
    });

    subscription.unsubscribe();

    expect(onEventName).to.equal('click');
    expect(typeof onHandler).to.equal('function');
    expect(offEventName).to.equal(onEventName);
    expect(offHandler).to.equal(onHandler);
  });

  it('should setup an event observable on objects with "addEventListener" and "removeEventListener" ', () => {
    let onEventName;
    let onHandler;
    let offEventName;
    let offHandler;

    const obj = {
      addEventListener: (a: string, b: EventListenerOrEventListenerObject, useCapture?: boolean) => {
        onEventName = a;
        onHandler = b;
      },
      removeEventListener: (a: string, b: EventListenerOrEventListenerObject, useCapture?: boolean) => {
        offEventName = a;
        offHandler = b;
      },
    };

    const subscription = fromEvent(<any>obj, 'click').subscribe(() => {
      //noop
    });

    subscription.unsubscribe();

    expect(onEventName).to.equal('click');
    expect(typeof onHandler).to.equal('function');
    expect(offEventName).to.equal(onEventName);
    expect(offHandler).to.equal(onHandler);
  });

  it('should setup an event observable on objects with "addListener" and "removeListener" returning event emitter', () => {
    let onEventName;
    let onHandler;
    let offEventName;
    let offHandler;

    const obj = {
      addListener(a: string | symbol, b: (...args: any[]) => void) {
        onEventName = a;
        onHandler = b;
        return this;
      },
      removeListener(a: string | symbol, b: (...args: any[]) => void) {
        offEventName = a;
        offHandler = b;
        return this;
      },
    };

    const subscription = fromEvent(obj, 'click').subscribe(() => {
      //noop
    });

    subscription.unsubscribe();

    expect(onEventName).to.equal('click');
    expect(typeof onHandler).to.equal('function');
    expect(offEventName).to.equal(onEventName);
    expect(offHandler).to.equal(onHandler);
  });

  it('should pass symbol to "addListener" and "removeListener"', () => {
    let onEventName;
    let onHandler;
    let offEventName;
    let offHandler;

    const SYMBOL_EVENT = Symbol();

    const obj = {
      addListener(a: string | symbol, b: (...args: any[]) => void) {
        onEventName = a;
        onHandler = b;
        return this;
      },
      removeListener(a: string | symbol, b: (...args: any[]) => void) {
        offEventName = a;
        offHandler = b;
        return this;
      },
    };

    const subscription = fromEvent(obj, SYMBOL_EVENT).subscribe(() => {
      //noop
    });

    subscription.unsubscribe();

    expect(onEventName).to.equal(SYMBOL_EVENT);
    expect(typeof onHandler).to.equal('function');
    expect(offEventName).to.equal(onEventName);
    expect(offHandler).to.equal(onHandler);
  });

  it('should setup an event observable on objects with "addListener" and "removeListener" returning nothing', () => {
    let onEventName;
    let onHandler;
    let offEventName;
    let offHandler;

    const obj = {
      addListener(a: string, b: (...args: any[]) => any, context?: any): { context: any } {
        onEventName = a;
        onHandler = b;
        return { context: '' };
      },
      removeListener(a: string, b: (...args: any[]) => void) {
        offEventName = a;
        offHandler = b;
      },
    };

    const subscription = fromEvent(obj, 'click').subscribe(() => {
      //noop
    });

    subscription.unsubscribe();

    expect(onEventName).to.equal('click');
    expect(typeof onHandler).to.equal('function');
    expect(offEventName).to.equal(onEventName);
    expect(offHandler).to.equal(onHandler);
  });

  it('should setup an event observable on objects with "addListener" and "removeListener" and "length" ', () => {
    let onEventName;
    let onHandler;
    let offEventName;
    let offHandler;

    const obj = {
      addListener: (a: string, b: (...args: unknown[]) => any) => {
        onEventName = a;
        onHandler = b;
      },
      removeListener: (a: string, b: (...args: unknown[]) => any) => {
        offEventName = a;
        offHandler = b;
      },
      length: 1,
    };

    const subscription = fromEvent(obj, 'click').subscribe(() => {
      //noop
    });

    subscription.unsubscribe();

    expect(onEventName).to.equal('click');
    expect(typeof onHandler).to.equal('function');
    expect(offEventName).to.equal(onEventName);
    expect(offHandler).to.equal(onHandler);
  });

  it('should throw if passed an invalid event target', () => {
    const obj = {
      addListener: () => {
        //noop
      },
    };
    expect(() => {
      fromEvent(obj as any, 'click');
    }).to.throw(/Invalid event target/);
  });

  it('should pass through options to addEventListener and removeEventListener', () => {
    let onOptions;
    let offOptions;
    const expectedOptions = { capture: true, passive: true };

    const obj = {
      addEventListener: (a: string, b: EventListenerOrEventListenerObject, c?: any) => {
        onOptions = c;
      },
      removeEventListener: (a: string, b: EventListenerOrEventListenerObject, c?: any) => {
        offOptions = c;
      },
    };

    const subscription = fromEvent(<any>obj, 'click', expectedOptions).subscribe(() => {
      //noop
    });

    subscription.unsubscribe();

    expect(onOptions).to.equal(expectedOptions);
    expect(offOptions).to.equal(expectedOptions);
  });

  it('should pass through events that occur', (done) => {
    let send: any;
    const obj = {
      on: (name: string, handler: (...args: unknown[]) => any) => {
        send = handler;
      },
      off: () => {
        //noop
      },
    };

    fromEvent(obj, 'click')
      .pipe(take(1))
      .subscribe({
        next: (e: any) => {
          expect(e).to.equal('test');
        },
        error: (err: any) => {
          done(new Error('should not be called'));
        },
        complete: () => {
          done();
        },
      });

    send('test');
  });

  it('should pass through events that occur and use the selector if provided', (done) => {
    let send: any;
    const obj = {
      on: (name: string, handler: (t: string, ...args: unknown[]) => any) => {
        send = handler;
      },
      off: () => {
        //noop
      },
    };

    function selector(x: string) {
      return x + '!';
    }

    fromEvent(obj, 'click', selector)
      .pipe(take(1))
      .subscribe({
        next: (e: any) => {
          expect(e).to.equal('test!');
        },
        error: (err: any) => {
          done(new Error('should not be called'));
        },
        complete: () => {
          done();
        },
      });

    send('test');
  });

  it('should not fail if no event arguments are passed and the selector does not return', (done) => {
    let send: any;
    const obj = {
      on: (name: string, handler: (...args: unknown[]) => any) => {
        send = handler;
      },
      off: () => {
        //noop
      },
    };

    function selector() {
      //noop
    }

    fromEvent(obj, 'click', selector)
      .pipe(take(1))
      .subscribe({
        next: (e: any) => {
          expect(e).not.exist;
        },
        error: (err: any) => {
          done(new Error('should not be called'));
        },
        complete: () => {
          done();
        },
      });

    send();
  });

  it('should return a value from the selector if no event arguments are passed', (done) => {
    let send: any;
    const obj = {
      on: (name: string, handler: (...args: unknown[]) => any) => {
        send = handler;
      },
      off: () => {
        //noop
      },
    };

    function selector() {
      return 'no arguments';
    }

    fromEvent(obj, 'click', selector)
      .pipe(take(1))
      .subscribe({
        next: (e: any) => {
          expect(e).to.equal('no arguments');
        },
        error: (err: any) => {
          done(new Error('should not be called'));
        },
        complete: () => {
          done();
        },
      });

    send();
  });

  it('should pass multiple arguments to selector from event emitter', (done) => {
    let send: any;
    const obj = {
      on: (name: string, handler: (t: number, ...args: unknown[]) => any) => {
        send = handler;
      },
      off: () => {
        //noop
      },
    };

    function selector(x: number, y: number, z: number) {
      // eslint-disable-next-line prefer-rest-params
      return [].slice.call(arguments);
    }

    fromEvent(obj, 'click', selector)
      .pipe(take(1))
      .subscribe({
        next: (e: any) => {
          expect(e).to.deep.equal([1, 2, 3]);
        },
        error: (err: any) => {
          done(new Error('should not be called'));
        },
        complete: () => {
          done();
        },
      });

    send(1, 2, 3);
  });

  it('should emit multiple arguments from event as an array', (done) => {
    let send: any;
    const obj = {
      on: (name: string, handler: (...args: unknown[]) => any) => {
        send = handler;
      },
      off: () => {
        //noop
      },
    };

    fromEvent(obj, 'click')
      .pipe(take(1))
      .subscribe({
        next: (e: any) => {
          expect(e).to.deep.equal([1, 2, 3]);
        },
        error: (err: any) => {
          done(new Error('should not be called'));
        },
        complete: () => {
          done();
        },
      });

    send(1, 2, 3);
  });

  it('should not throw an exception calling toString on obj with a null prototype', (done) => {
    // NOTE: Can not test with Object.create(null) or `class Foo extends null`
    // due to TypeScript bug. https://github.com/Microsoft/TypeScript/issues/1108
    class NullProtoEventTarget {
      on() {
        /*noop*/
      }
      off() {
        /*noop*/
      }
    }
    NullProtoEventTarget.prototype.toString = null!;
    const obj: NullProtoEventTarget = new NullProtoEventTarget();

    expect(() => {
      fromEvent(obj, 'foo').subscribe();
      done();
    }).to.not.throw(TypeError);
  });

  it('should throw on subscription if one of the items in an ArrayLike is not a valid event target', (done) => {
    const nodeList = {
      [0]: {
        addEventListener() {
          /* noop */
        },
        removeEventListener() {
          /* noop */
        },
      },
      [1]: {
        addEventListener() {
          /* noop */
        },
        removeEventListener() {
          /* noop */
        },
      },
      [2]: {
        notAnEventTargetLOL: true,
      },
      [3]: {
        addEventListener() {
          /* noop */
        },
        removeEventListener() {
          /* noop */
        },
      },
      length: 4,
    };

    // @ts-expect-error We're testing this for the rebels that don't type check properly.
    const source = fromEvent(nodeList, 'cool-event-name-bro');

    source.subscribe({
      error: (err) => {
        expect(err).to.be.an.instanceOf(TypeError);
        expect(err.message).to.equal('Invalid event target');
        done();
      },
    });
  });

  it('should handle adding events to an arraylike of targets', () => {
    const nodeList = {
      [0]: {
        addEventListener(...args: any[]) {
          this._addEventListenerArgs = args;
        },
        removeEventListener(...args: any[]) {
          this._removeEventListenerArgs = args;
        },
        _addEventListenerArgs: null as any,
        _removeEventListenerArgs: null as any,
      },
      [1]: {
        addEventListener(...args: any[]) {
          this._addEventListenerArgs = args;
        },
        removeEventListener(...args: any[]) {
          this._removeEventListenerArgs = args;
        },
        _addEventListenerArgs: null as any,
        _removeEventListenerArgs: null as any,
      },
      length: 2,
    };

    const options = {};

    const subscription = fromEvent(nodeList, 'click', options).subscribe();

    expect(nodeList[0]._addEventListenerArgs[0]).to.equal('click');
    expect(nodeList[0]._addEventListenerArgs[1]).to.be.a('function');
    expect(nodeList[0]._addEventListenerArgs[2]).to.equal(options);

    expect(nodeList[1]._addEventListenerArgs[0]).to.equal('click');
    expect(nodeList[1]._addEventListenerArgs[1]).to.be.a('function');
    expect(nodeList[1]._addEventListenerArgs[2]).to.equal(options);

    expect(nodeList[0]._removeEventListenerArgs).to.be.null;
    expect(nodeList[1]._removeEventListenerArgs).to.be.null;

    subscription.unsubscribe();

    expect(nodeList[0]._removeEventListenerArgs).to.deep.equal(nodeList[0]._addEventListenerArgs);
    expect(nodeList[1]._removeEventListenerArgs).to.deep.equal(nodeList[1]._addEventListenerArgs);
  });
});
