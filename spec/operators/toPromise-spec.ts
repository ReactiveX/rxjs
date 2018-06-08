import { expect } from 'chai';
import { of, EMPTY, throwError, config } from 'rxjs';

/** @test {toPromise} */
describe('Observable.toPromise', () => {
  it('should convert an Observable to a promise of its last value', (done: MochaDone) => {
    of(1, 2, 3).toPromise(Promise).then((x: number) => {
      expect(x).to.equal(3);
      done();
    });
  });

  it('should convert an empty Observable to a promise of undefined', (done: MochaDone) => {
    EMPTY.toPromise(Promise).then((x) => {
      expect(x).to.be.undefined;
      done();
    });
  });

  it('should handle errors properly', (done: MochaDone) => {
    throwError('bad').toPromise(Promise).then(() => {
      done(new Error('should not be called'));
    }, (err: any) => {
      expect(err).to.equal('bad');
      done();
    });
  });

  it('should allow for global config via config.Promise', (done: MochaDone) => {
    let wasCalled = false;
    config.Promise = function MyPromise(callback: Function) {
      wasCalled = true;
      return new Promise(callback as any);
    } as any;

    of(42).toPromise().then((x: number) => {
      expect(wasCalled).to.be.true;
      expect(x).to.equal(42);
      done();
    });
  });
});
