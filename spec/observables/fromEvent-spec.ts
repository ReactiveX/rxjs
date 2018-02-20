import { expect } from 'chai';
import * as Rx from '../../src/Rx';
import { expectObservable } from '../helpers/marble-testing';

declare function asDiagram(arg: string): Function;
declare const rxTestScheduler: Rx.TestScheduler;

const Observable = Rx.Observable;

/** @test {fromEvent} */
describe('Observable.fromEvent', () => {
  asDiagram('fromEvent(element, \'click\')')
  ('should create an observable of click on the element', () => {
    const target: EventTarget = {
      addEventListener: (eventType, listener) => {
        Observable.timer(50, 20, rxTestScheduler)
          .mapTo('ev')
          .take(2)
          .concat(Observable.never())
          .subscribe(<any>listener);
      },
      removeEventListener: () => void 0,
      dispatchEvent: () => void 0,
    };
    const e1 = Observable.fromEvent(target, 'click');
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

    const subscription = Observable.fromEvent(obj, 'click')
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

    const subscription = Observable.fromEvent(<any>obj, 'click')
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

    const subscription = Observable.fromEvent(obj, 'click')
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

    Observable.fromEvent(obj as any, 'click').subscribe({
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

    const subscription = Observable.fromEvent(<any>obj, 'click', expectedOptions)
      .subscribe(() => {
        //noop
       });

    subscription.unsubscribe();

    expect(actualOptions).to.equal(expectedOptions);
  });

  it('should pass through events that occur', (done) => {
    let send: Function;
    const obj = {
      on: (name: string, handler: Function) => {
        send = handler;
      },
      off: () => {
        //noop
      }
    };

    Observable.fromEvent(obj, 'click').take(1)
      .subscribe((e) => {
        expect(e).to.equal('test');
      }, (err) => {
        done(new Error('should not be called'));
      }, () => {
        done();
      });

    send('test');
  });

  it('should pass through events that occur and use the selector if provided', (done) => {
    let send: Function;
    const obj = {
      on: (name: string, handler: Function) => {
        send = handler;
      },
      off: () => {
        //noop
      }
    };

    function selector(x: any) {
      return x + '!';
    }

    Observable.fromEvent(obj, 'click', selector).take(1)
      .subscribe((e) => {
        expect(e).to.equal('test!');
      }, (err) => {
        done(new Error('should not be called'));
      }, () => {
        done();
      });

    send('test');
  });

  it('should not fail if no event arguments are passed and the selector does not return', (done) => {
    let send: Function;
    const obj = {
      on: (name: string, handler: Function) => {
        send = handler;
      },
      off: () => {
        //noop
      }
    };

    function selector() {
      //noop
    }

    Observable.fromEvent(obj, 'click', selector).take(1)
      .subscribe((e) => {
        expect(e).not.exist;
      }, (err) => {
        done(new Error('should not be called'));
      }, () => {
        done();
      });

    send();
  });

  it('should return a value from the selector if no event arguments are passed', (done) => {
    let send: Function;
    const obj = {
      on: (name: string, handler: Function) => {
        send = handler;
      },
      off: () => {
        //noop
      }
    };

    function selector() {
      return 'no arguments';
    }

    Observable.fromEvent(obj, 'click', selector).take(1)
      .subscribe((e) => {
        expect(e).to.equal('no arguments');
      }, (err) => {
        done(new Error('should not be called'));
      }, () => {
        done();
      });

    send();
  });

  it('should pass multiple arguments to selector from event emitter', (done) => {
    let send: Function;
    const obj = {
      on: (name: string, handler: Function) => {
        send = handler;
      },
      off: () => {
        //noop
      }
    };

    function selector(x: number, y: number, z: number) {
      return [].slice.call(arguments);
    }

    Observable.fromEvent(obj, 'click', selector).take(1)
      .subscribe((e) => {
        expect(e).to.deep.equal([1, 2, 3]);
      }, (err) => {
        done(new Error('should not be called'));
      }, () => {
        done();
      });

    send(1, 2, 3);
  });

  it('should not throw an exception calling toString on obj with a null prototype', (done) => {
    // NOTE: Can not test with Object.create(null) or `class Foo extends null`
    // due to TypeScript bug. https://github.com/Microsoft/TypeScript/issues/1108
    class NullProtoEventTarget {
      on() { /*noop*/ }
      off() { /*noop*/ }
    }
    NullProtoEventTarget.prototype.toString = null;
    const obj: NullProtoEventTarget = new NullProtoEventTarget();

    expect(() => {
      Observable.fromEvent(obj, 'foo').subscribe();
      done();
    }).to.not.throw(TypeError);
  });

});
