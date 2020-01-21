import { merge } from 'rxjs/operators';
import { queueScheduler, of } from 'rxjs';
import { expect } from 'chai';

describe('merge (legacy)', () => {
  it('should merge an immediately-scheduled source with an immediately-scheduled second', done => {
    const a = of(1, 2, 3, queueScheduler);
    const b = of(4, 5, 6, 7, 8, queueScheduler);
    const r = [1, 2, 4, 3, 5, 6, 7, 8];

    a.pipe(merge(b, queueScheduler)).subscribe(
      val => {
        expect(val).to.equal(r.shift());
      },
      x => {
        done(new Error('should not be called'));
      },
      () => {
        done();
      }
    );
  });
});
