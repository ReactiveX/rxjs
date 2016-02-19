import * as Rx from '../../dist/cjs/Rx';
import {hot, cold, expectObservable, expectSubscriptions} from '../helpers/marble-testing';
import {it, DoneSignature, asDiagram} from '../helpers/test-helper';

declare const __root__: any;
const Observable = Rx.Observable;

describe('Observable.prototype.toPromise()', () => {
  it('should convert an Observable to a promise of its last value', (done: DoneSignature) => {
    Observable.of(1, 2, 3).toPromise(Promise).then((x: number) => {
      expect(x).toBe(3);
      done();
    });
  });

  it('should handle errors properly', (done: DoneSignature) => {
    Observable.throw('bad').toPromise(Promise).then(() => {
      done.fail('should not be called');
    }, function (err) {
      expect(err).toBe('bad');
      done();
    });
  });

  it('should allow for global config via Rx.config.Promise', (done: DoneSignature) => {
    var wasCalled = false;
    __root__.Rx = {};
    __root__.Rx.config = {};
    __root__.Rx.config.Promise = function MyPromise(callback) {
      wasCalled = true;
      return new Promise(callback);
    };

    Observable.of(42).toPromise().then((x: number) => {
      expect(wasCalled).toBe(true);
      expect(x).toBe(42);
      done();
    });
  });
});