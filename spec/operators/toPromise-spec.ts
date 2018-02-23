import { expect } from 'chai';
import * as Rx from '../../src/Rx';

declare const __root__: any;
const Observable = Rx.Observable;

/** @test {toPromise} */
describe('Observable.prototype.toPromise', () => {
  it('should convert an Observable to a promise of its last value', (done) => {
    Observable.of(1, 2, 3).toPromise(Promise).then((x) => {
      expect(x).to.equal(3);
      done();
    });
  });

  it('should handle errors properly', (done) => {
    Observable.throwError('bad').toPromise(Promise).then(() => {
      done(new Error('should not be called'));
    }, (err) => {
      expect(err).to.equal('bad');
      done();
    });
  });

  it('should allow for global config via Rx.config.Promise', (done) => {
    let wasCalled = false;
    __root__.Rx = {};
    __root__.Rx.config = {};
    __root__.Rx.config.Promise = function MyPromise(callback: any) {
      wasCalled = true;
      return new Promise(callback);
    };

    Observable.of(42).toPromise().then((x) => {
      expect(wasCalled).to.be.true;
      expect(x).to.equal(42);

      delete __root__.Rx;
      done();
    });
  });
});
