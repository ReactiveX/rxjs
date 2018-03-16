import { expect } from 'chai';
import * as Rx from 'rxjs/Rx';

/** @test {let} */
describe('Observable.prototype.let', () => {
  it('should be able to compose with let', (done: MochaDone) => {
    const expected = ['aa', 'bb'];
    let i = 0;

    const foo = (observable: Rx.Observable<string>) => observable.map((x: string) => x + x);

    Rx.Observable
      .from(['a', 'b'])
      .let(foo)
      .subscribe(function (x) {
        expect(x).to.equal(expected[i++]);
      }, (x) => {
        done(new Error('should not be called'));
      }, () => {
        done();
      });
  });
});
