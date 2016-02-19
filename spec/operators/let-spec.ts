import * as Rx from '../../dist/cjs/Rx';
import {it, DoneSignature} from '../helpers/test-helper';

describe('let', () => {
  it('should be able to compose with let', (done: DoneSignature) => {
    const expected = ['aa', 'bb'];
    let i = 0;

    const foo = (observable: Rx.Observable<string>) => observable.map((x: string) => x + x);

    Rx.Observable
      .fromArray(['a','b'])
      .let(foo)
      .subscribe(function (x) {
        expect(x).toBe(expected[i++]);
      }, done.fail, done);
  });
});
