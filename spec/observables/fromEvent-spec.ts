import * as Rx from '../../dist/cjs/Rx';
import {DoneSignature} from '../helpers/test-helper';

const Observable = Rx.Observable;

/** @test {fromEvent} */
describe('Observable.fromEvent', () => {
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

    expect(onEventName).toBe('click');
    expect(typeof onHandler).toBe('function');
    expect(offEventName).toBe(onEventName);
    expect(offHandler).toBe(onHandler);
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

    expect(onEventName).toBe('click');
    expect(typeof onHandler).toBe('function');
    expect(offEventName).toBe(onEventName);
    expect(offHandler).toBe(onHandler);
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

    expect(onEventName).toBe('click');
    expect(typeof onHandler).toBe('function');
    expect(offEventName).toBe(onEventName);
    expect(offHandler).toBe(onHandler);
  });

  it('should pass through events that occur', (done: DoneSignature) => {
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
        expect(e).toBe('test');
      }, (err: any) => {
        done.fail('should not be called');
      }, done);

    send('test');
  });

  it('should pass through events that occur and use the selector if provided', (done: DoneSignature) => {
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
        expect(e).toBe('test!');
      }, (err: any) => {
        done.fail('should not be called');
      }, done);

    send('test');
  });

  it('should not fail if no event arguments are passed and the selector does not return', (done: DoneSignature) => {
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
        expect(e).toBeUndefined();
      }, (err: any) => {
        done.fail('should not be called');
      }, done);

    send();
  });

  it('should return a value from the selector if no event arguments are passed', (done: DoneSignature) => {
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
        expect(e).toBe('no arguments');
      }, (err: any) => {
        done.fail('should not be called');
      }, done);

    send();
  });

  it('should pass multiple arguments to selector from event emitter', (done: DoneSignature) => {
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
        expect(e).toEqual([1, 2, 3]);
      }, (err: any) => {
        done.fail('should not be called');
      }, done);

    send(1, 2, 3);
  });
});
