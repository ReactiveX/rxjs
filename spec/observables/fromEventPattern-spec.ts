/* globals describe, it, expect, jasmine */
import * as Rx from '../../dist/cjs/Rx';
import {it, DoneSignature} from '../helpers/test-helper';

const Observable = Rx.Observable;

describe('Observable.fromEventPattern', () => {
  it('should call addHandler on subscription', () => {
    let addHandlerCalledWith;
    const addHandler = (h: any) => {
      addHandlerCalledWith = h;
    };

    const removeHandler = () => {
      //noop
    };

    Observable.fromEventPattern(addHandler, removeHandler)
      .subscribe(() => {
        //noop
      });

    expect(typeof addHandlerCalledWith).toBe('function');
  });

  it('should call removeHandler on unsubscription', () => {
    let removeHandlerCalledWith;
    const addHandler = () => {
      //noop
     };
    const removeHandler = (h: any) => {
      removeHandlerCalledWith = h;
    };

    const subscription = Observable.fromEventPattern(addHandler, removeHandler)
      .subscribe(() => {
        //noop
      });

    subscription.unsubscribe();

    expect(typeof removeHandlerCalledWith).toBe('function');
  });

  it('should send errors in addHandler down the error path', () => {
    Observable.fromEventPattern((h: any) => {
      throw 'bad';
    }, () => {
        //noop
      }).subscribe(() => {
        //noop
       }, (err: any) => {
          expect(err).toBe('bad');
        });
  });

  it('should accept a selector that maps outgoing values', (done: DoneSignature) => {
    let target;
    const trigger = function (...args) {
      if (target) {
        target.apply(null, arguments);
      }
    };

    const addHandler = (handler: any) => {
      target = handler;
    };
    const removeHandler = (handler: any) => {
      target = null;
    };
    const selector = (a: any, b: any) => {
      return a + b + '!';
    };

    Observable.fromEventPattern(addHandler, removeHandler, selector).take(1)
      .subscribe((x: any) => {
        expect(x).toBe('testme!');
      }, (err: any) => {
        done.fail('should not be called');
      }, done);

    trigger('test', 'me');
  });

  it('should send errors in the selector down the error path', (done: DoneSignature) => {
    let target;
    const trigger = (value: any) => {
      if (target) {
        target(value);
      }
    };

    const addHandler = (handler: any) => {
      target = handler;
    };
    const removeHandler = (handler: any) => {
      target = null;
    };
    const selector = (x: any) => {
      throw 'bad';
    };

    Observable.fromEventPattern(addHandler, removeHandler, selector)
      .subscribe((x: any) => {
        done.fail('should not be called');
      }, (err: any) => {
        expect(err).toBe('bad');
        done();
      }, () => {
        done.fail('should not be called');
      });

    trigger('test');
  });
});