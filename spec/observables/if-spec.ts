import * as Rx from '../../dist/cjs/Rx.KitchenSink';
import {expectObservable} from '../helpers/marble-testing';
import {it} from '../helpers/test-helper';

const Observable = Rx.Observable;

describe('Observable.if', () => {
  it('should subscribe to thenSource when the conditional returns true', () => {
    const e1 = Observable.if(() => true, Observable.of('a'));
    const expected = '(a|)';

    expectObservable(e1).toBe(expected);
  });

  it('should subscribe to elseSource when the conditional returns false', () => {
    const e1 = Observable.if(() => false, Observable.of('a'), Observable.of('b'));
    const expected = '(b|)';

    expectObservable(e1).toBe(expected);
  });

  it('should complete without an elseSource when the conditional returns false', () => {
    const e1 = Observable.if(() => false, Observable.of('a'));
    const expected = '|';

    expectObservable(e1).toBe(expected);
  });
});
