import {expect} from 'chai';
import * as Rx from '../../dist/cjs/Rx';

declare const __root__: any;
const Observable = Rx.Observable;

/** @test {toPromise} */
describe('Observable.prototype.toPromise', () => {
  it('should convert an Observable to a promise of its last value', (done: MochaDone) => {
    Observable.of(1, 2, 3).toPromise(Promise).then((x: number) => {
      expect(x).to.equal(3);
      done();
    });
  });

  it('should handle errors properly', (done: MochaDone) => {
    Observable.throw('bad').toPromise(Promise).then(() => {
      done(new Error('should not be called'));
    }, (err: any) => {
      expect(err).to.equal('bad');
      done();
    });
  });

  it('should allow for global config via Rx.config.Promise', (done: MochaDone) => {
    let wasCalled = false;
    __root__.Rx = {};
    __root__.Rx.config = {};
    __root__.Rx.config.Promise = function MyPromise(callback) {
      wasCalled = true;
      return new Promise(callback);
    };

    Observable.of(42).toPromise().then((x: number) => {
      expect(wasCalled).to.be.true;
      expect(x).to.equal(42);

      delete __root__.Rx;
      done();
    });
  });
});