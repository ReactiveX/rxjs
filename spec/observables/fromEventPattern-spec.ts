import {expect} from 'chai';
import * as Rx from '../../dist/cjs/Rx';

declare const rxTestScheduler: Rx.TestScheduler;
declare const {hot, asDiagram, expectObservable, expectSubscriptions};
const Observable = Rx.Observable;

/** @test {fromEventPattern} */
describe('Observable.fromEventPattern', () => {
  asDiagram('fromEventPattern(addHandler, removeHandler)')
  ('should create an observable from the handler API', () => {
    function addHandler(h) {
      Observable.timer(50, 20, rxTestScheduler)
        .mapTo('ev')
        .take(2)
        .concat(Observable.never())
        .subscribe(h);
    }
    const e1 = Observable.fromEventPattern(addHandler, () => void 0);
    const expected = '-----x-x---';
    expectObservable(e1).toBe(expected, {x: 'ev'});
  });

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
    Observable.fromEventPattern((_h: any) => {
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
    const trigger = function (..._args) {
      if (target) {
        target.apply(null, arguments);
      }
    };

    const addHandler = (handler: any) => {
      target = handler;
    };
    const removeHandler = (_handler: any) => {
      target = null;
    };
    const selector = (a: any, b: any) => {
      return a + b + '!';
    };

    Observable.fromEventPattern(addHandler, removeHandler, selector).take(1)
      .subscribe((x: any) => {
        expect(x).to.equal('testme!');
      }, (_err: any) => {
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
    const removeHandler = (_handler: any) => {
      target = null;
    };
    const selector = (_x: any) => {
      throw 'bad';
    };

    Observable.fromEventPattern(addHandler, removeHandler, selector)
      .subscribe((_x: any) => {
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