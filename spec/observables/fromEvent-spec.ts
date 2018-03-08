import { expect } from 'chai';
import { expectObservable } from '../helpers/marble-testing';
import { fromEvent, never, timer } from '../../src';
import { TestScheduler } from '../../src/testing';

declare function asDiagram(arg: string): Function;
declare const rxTestScheduler: TestScheduler;

/** @test {fromEvent} */
describe('fromEvent', () => {
  asDiagram('fromEvent(element, \'click\')')
  ('should create an observable of click on the element', () => {
    const target = {
      addEventListener: (eventType, listener) => {
        timer(50, 20, rxTestScheduler)
          .mapTo('ev')
          .take(2)
          .concat(never())
          .subscribe(listener);
      },
      removeEventListener: () => void 0,
      dispatchEvent: () => void 0,
    };
    const e1 = fromEvent(target, 'click');
    const expected = '-----x-x---';
    expectObservable(e1).toBe(expected, {x: 'ev'});
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

  it('should setup an event observable on objects with "addListener" and "removeListener" ', () => {
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

  it('should error on invalid event targets', () => {
    const obj = {
      addListener: () => {
        //noop
      }
    };

    fromEvent(obj as any, 'click').subscribe({
      error(err) {
        expect(err).to.exist
          .and.be.instanceof(Error)
          .and.have.property('message', 'Invalid event target');
      }
    });
  });

  it('should pass through options to addEventListener', () => {
    let actualOptions;
    const expectedOptions = { capture: true, passive: true };

    const obj = {
      addEventListener: (a: string, b: EventListenerOrEventListenerObject, c?: any) => {
        actualOptions = c;
      },
      removeEventListener: (a: string, b: EventListenerOrEventListenerObject, c?: any) => {
        //noop
      }
    };

    const subscription = fromEvent(<any>obj, 'click', expectedOptions)
      .subscribe(() => {
        //noop
       });

    subscription.unsubscribe();

    expect(actualOptions).to.equal(expectedOptions);
  });

  it('should pass through events that occur', (done: MochaDone) => {
    let send;
    const obj = {
      on: (name: string, handler: Function) => {
        send = handler;
      },
      off: () => {
        //noop
      }
    };

    fromEvent(obj, 'click').take(1)
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
    let send;
    const obj = {
      on: (name: string, handler: Function) => {
        send = handler;
      },
      off: () => {
        //noop
      }
    };

    fromEvent(obj, 'click').take(1)
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
