import {expect} from 'chai';
import * as Rx from '../../dist/cjs/Rx';
import marbleTestingSignature = require('../helpers/marble-testing'); // tslint:disable-line:no-require-imports

declare const { asDiagram };
declare const expectObservable: typeof marbleTestingSignature.expectObservable;
declare const rxTestScheduler: Rx.TestScheduler;

const Observable = Rx.Observable;

/** @test {fromEvent} */
describe('Observable.fromEvent', () => {
  asDiagram('fromEvent(element, \'click\')')
  ('should create an observable of click on the element', () => {
    const target = {
      addEventListener: (eventType, listener) => {
        Observable.timer(50, 20, rxTestScheduler)
          .mapTo('ev')
          .take(2)
          .concat(Observable.never())
          .subscribe(listener);
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

    const subscribe = () => Observable.fromEvent(<any>obj, 'click').subscribe();
    expect(subscribe).to.throw(TypeError, 'Invalid event target');
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

    Observable.fromEvent(obj, 'click').take(1)
      .subscribe((e: any) => {
        expect(e).to.equal('test');
      }, (err: any) => {
        done(new Error('should not be called'));
      }, () => {
        done();
      });

    send('test');
  });

  it('should pass through events that occur and use the selector if provided', (done: MochaDone) => {
    let send;
    const obj = {
      on: (name: string, handler: Function) => {
        send = handler;
      },
      off: () => {
        //noop
      }
    };

    function selector(x) {
      return x + '!';
    }

    Observable.fromEvent(obj, 'click', selector).take(1)
      .subscribe((e: any) => {
        expect(e).to.equal('test!');
      }, (err: any) => {
        done(new Error('should not be called'));
      }, () => {
        done();
      });

    send('test');
  });

  it('should not fail if no event arguments are passed and the selector does not return', (done: MochaDone) => {
    let send;
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
      .subscribe((e: any) => {
        expect(e).not.exist;
      }, (err: any) => {
        done(new Error('should not be called'));
      }, () => {
        done();
      });

    send();
  });

  it('should return a value from the selector if no event arguments are passed', (done: MochaDone) => {
    let send;
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
      .subscribe((e: any) => {
        expect(e).to.equal('no arguments');
      }, (err: any) => {
        done(new Error('should not be called'));
      }, () => {
        done();
      });

    send();
  });

  it('should pass multiple arguments to selector from event emitter', (done: MochaDone) => {
    let send;
    const obj = {
      on: (name: string, handler: Function) => {
        send = handler;
      },
      off: () => {
        //noop
      }
    };

    function selector(x, y, z) {
      return [].slice.call(arguments);
    }

    Observable.fromEvent(obj, 'click', selector).take(1)
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
      Observable.fromEvent(obj, 'foo').subscribe();
      done();
    }).to.not.throw(TypeError);
  });

});
