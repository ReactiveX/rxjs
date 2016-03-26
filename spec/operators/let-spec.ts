import * as Rx from '../../dist/cjs/Rx';
import {DoneSignature} from '../helpers/test-helper';

/** @test {let} */
describe('Observable.prototype.let', () => {
  it('should be able to compose with let', (done: DoneSignature) => {
    const expected = ['aa', 'bb'];
    let i = 0;

    const foo = (observable: Rx.Observable<string>) => observable.map((x: string) => x + x);

    Rx.Observable
      .from(['a', 'b'])
      .let(foo)
      .subscribe(function (x) {
        expect(x).toBe(expected[i++]);
      }, (x) => {
        done.fail('should not be called');
      }, () => {
        done();
      });
  });
});
