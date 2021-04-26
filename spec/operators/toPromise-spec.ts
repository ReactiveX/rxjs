/** @prettier */
import { expect } from 'chai';
import { of, EMPTY, throwError, config } from 'rxjs';

/** @test {toPromise} */
describe('Observable.toPromise', () => {
  it('should convert an Observable to a promise of its last value', (done) => {
    of(1, 2, 3)
      .toPromise(Promise)
      .then((x) => {
        expect(x).to.equal(3);
        done();
      });
  });

  it('should convert an empty Observable to a promise of undefined', (done) => {
    EMPTY.toPromise(Promise).then((x) => {
      expect(x).to.be.undefined;
      done();
    });
  });

  it('should handle errors properly', (done) => {
    throwError(() => 'bad')
      .toPromise(Promise)
      .then(
        () => {
          done(new Error('should not be called'));
        },
        (err: any) => {
          expect(err).to.equal('bad');
          done();
        }
      );
  });

  it('should allow for global config via config.Promise', async () => {
    try {
      let wasCalled = false;
      config.Promise = function MyPromise(callback: Function) {
        wasCalled = true;
        return new Promise(callback as any);
      } as any;

      const x = await of(42).toPromise();
      expect(wasCalled).to.be.true;
      expect(x).to.equal(42);
    } finally {
      config.Promise = undefined;
    }
  });
});
