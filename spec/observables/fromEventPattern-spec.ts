import {expect} from 'chai';
import * as Rx from '../../dist/cjs/Rx';

const Observable = Rx.Observable;

/** @test {fromEventPattern} */
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

    expect(addHandlerCalledWith).to.be.a('function');
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

    expect(removeHandlerCalledWith).to.be.a('function');
  });

  it('should send errors in addHandler down the error path', () => {
    Observable.fromEventPattern((h: any) => {
      throw 'bad';
    }, () => {
        //noop
      }).subscribe(() => {
        //noop
       }, (err: any) => {
          expect(err).to.equal('bad');
        });
  });

  it('should accept a selector that maps outgoing values', (done: MochaDone) => {
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
        expect(x).to.equal('testme!');
      }, (err: any) => {
        done(new Error('should not be called'));
      }, () => {
        done();
      });

    trigger('test', 'me');
  });

  it('should send errors in the selector down the error path', (done: MochaDone) => {
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
        done(new Error('should not be called'));
      }, (err: any) => {
        expect(err).to.equal('bad');
        done();
      }, () => {
        done(new Error('should not be called'));
      });

    trigger('test');
  });
});