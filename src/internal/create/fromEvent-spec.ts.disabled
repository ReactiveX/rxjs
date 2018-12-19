import { expect } from 'chai';
import { fromEvent, NEVER, timer } from 'rxjs';
import { NodeStyleEventEmitter, NodeCompatibleEventEmitter, NodeEventHandler } from './fromEvent';
import { mapTo, take, concatWith } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { assertDeepEquals } from '../test_helpers/assertDeepEquals';

/** @test {fromEvent} */
describe('fromEvent', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler(assertDeepEquals);
  });

  //asDiagram('fromEvent(element, \'click\')')
  it('should create an observable of click on the element', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const target = {
        addEventListener: (eventType: any, listener: any) => {
          timer(5, 2, testScheduler)
            .pipe(
              mapTo('ev'),
              take(2),
              concatWith(NEVER)
            )
            .subscribe(e => listener(e));
        },
        removeEventListener: (): void => void 0,
        dispatchEvent: (): void => void 0,
      };
      const e1 = fromEvent(target as any, 'click');
      const expected = '-----x-x---';
      expectObservable(e1).toBe(expected, {x: 'ev'});
    });
  });

  it('should setup an event observable on objects with "on" and "off" ', () => {
    let onEventName;
    let onHandler;
    let offEventName;
    let offHandler;

    const obj = {
      on: (a: string, b: Function) => {
        onEventName = a;
        onHandler = b;
      },
      off: (a: string, b: Function) => {
        offEventName = a;
        offHandler = b;
      }
    };

    const subscription = fromEvent(obj, 'click')
      .subscribe(() => {
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
      }
    };

    const subscription = fromEvent(<any>obj, 'click')
      .subscribe(() => {
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
      }
    };

    const subscription = fromEvent(obj, 'click')
      .subscribe(() => {
        //noop
       });

    subscription.unsubscribe();

    expect(onEventName).to.equal('click');
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
      }
    };

    const subscription = fromEvent(obj, 'click')
      .subscribe(() => {
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
      addListener: (a: string, b: Function) => {
        onEventName = a;
        onHandler = b;
      },
      removeListener: (a: string, b: Function) => {
        offEventName = a;
        offHandler = b;
      },
      length: 1
    };

    const subscription = fromEvent(obj, 'click')
      .subscribe(() => {
        //noop
       });

    subscription.unsubscribe();

    expect(onEventName).to.equal('click');
    expect(typeof onHandler).to.equal('function');
    expect(offEventName).to.equal(onEventName);
    expect(offHandler).to.equal(onHandler);
  });

  it('should error on invalid event targets', () => {
    const obj = {
      addListener: () => {
        //noop
      }
    };

    fromEvent(obj as any, 'click').subscribe({
      error(err: any) {
        expect(err).to.exist
          .and.be.instanceof(Error)
          .and.have.property('message', 'Invalid event target');
      }
    });
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
      }
    };

    const subscription = fromEvent(<any>obj, 'click', expectedOptions)
      .subscribe(() => {
        //noop
       });

    subscription.unsubscribe();

    expect(onOptions).to.equal(expectedOptions);
    expect(offOptions).to.equal(expectedOptions);
  });

  it('should pass through events that occur', (done: MochaDone) => {
    let send: any;
    const obj = {
      on: (name: string, handler: Function) => {
        send = handler;
      },
      off: () => {
        //noop
      }
    };

    fromEvent(obj, 'click').pipe(take(1))
      .subscribe((e: any) => {
        expect(e).to.equal('test');
      }, (err: any) => {
        done(new Error('should not be called'));
      }, () => {
        done();
      });

    send('test');
  });

  it('should emit multiple arguments from event as an array', (done: MochaDone) => {
    let send: any;
    const obj = {
      on: (name: string, handler: Function) => {
        send = handler;
      },
      off: () => {
        //noop
      }
    };

    fromEvent(obj, 'click').pipe(take(1))
      .subscribe((e: any) => {
        expect(e).to.deep.equal([1, 2, 3]);
      }, (err: any) => {
        done(new Error('should not be called'));
      }, () => {
        done();
      });

    send(1, 2, 3);
  });

  it('should not throw an exception calling toString on obj with a null prototype', (done: MochaDone) => {
    // NOTE: Can not test with Object.create(null) or `class Foo extends null`
    // due to TypeScript bug. https://github.com/Microsoft/TypeScript/issues/1108
    class NullProtoEventTarget {
      on() { /*noop*/ }
      off() { /*noop*/ }
    }
    NullProtoEventTarget.prototype.toString = null;
    const obj: NullProtoEventTarget = new NullProtoEventTarget();

    expect(() => {
      fromEvent(obj, 'foo').subscribe();
      done();
    }).to.not.throw(TypeError);
  });
});
