/// <reference path="../../typings/jasmine/jasmine"/>

import { Observable } from '../../src/observable/observable';
import SubscriptionReference from '../../src/subscription/subscription-reference';

describe('Observable', () => {
  it('should exist', () => {
    expect(typeof Observable).toEqual('function');
  });

  describe('observer(generator)', () => {
    it('should return a subscription reference', () => {
      var observable = new Observable(() => {});
      var subref = observable.observer(<any>{});
      expect(subref instanceof SubscriptionReference).toEqual(true);
    });

    it('should invoke the dispose action '+
        'when the subscription has been disposed', () => {
      var disposeAction = jasmine.createSpy("disposeAction");
      var observable = new Observable(() => disposeAction);
      var subscription = observable.observer(<any>{});

      subscription.dispose();

      expect(disposeAction).toHaveBeenCalled();
    });

    it('should not call methods on the observer '+
       'after the subscription has been disposed', () => {
      var generator;
      var observable = new Observable(g => {generator = g;});
      var subscription = observable.observer(<any>{
        next:     () => {throw 'Should not be called';},
        'throw':  () => {throw 'Should not be called';},
        'return': () => {throw 'Should not be called';}
      });

      subscription.dispose();

      expect(() => generator.next(42)).not.toThrow();
      expect(() => generator.throw(new Error())).not.toThrow();
      expect(() => generator.return(42)).not.toThrow();
    });
  });

  describe('map()', () => {
    it('should change the output value', done => {
      var observable = new Observable(generator => {
        generator.next(42);
        generator.return(undefined);
      });

      observable.map(x => x + 1).observer(<any>{
        next: x => {
          expect(x).toEqual(43);
          done();
        }
      });
    });
  });

  describe('flatMap()', () => {
    it('should flatten return observables', done => {
      var observable = new Observable(generator => {
        generator.next(new Observable(gen2 => {
          gen2.next(42);
          gen2.return(undefined);
        }));
        generator.return(undefined);
      });

      observable.flatMap(x => x).observer(<any>{
        next: x => {
          expect(x).toEqual(42);
          done();
        }
      });
    });
  });

  describe('Observable.return(value)', () => {
    it('should return an observable of just that value', done => {
      var observable = Observable.return(42);
      var calls = 0;

      observable.observer(<any>{
        next(x) {
          expect(x).toEqual(42);
          expect(++calls).toEqual(1);
        },

        return() {
          done();
        }
      });
    });
  });
});