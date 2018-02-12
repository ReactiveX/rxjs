import { expect } from 'chai';
import { hotObservable, coldObservable, getObservableMessage, expectedObservable, expectedSubscription, rxSandbox } from 'rx-sandbox';
import { take, mergeMap } from '../../src/operators';
import { ArgumentOutOfRangeError } from '../../src/internal/util/ArgumentOutOfRangeError';
import { Observable } from '../../src/internal/Observable';
import { Subject } from '../../src/internal/Subject';
import { of } from '../../src/create';
import { Observer } from '../../src/internal/Observer';
const { marbleAssert } = rxSandbox;

/** @test {take} */
describe('Observable.prototype.take', () => {
  let hot: hotObservable, cold: coldObservable, getMessages: getObservableMessage, e: expectedObservable, s: expectedSubscription;
  beforeEach(() => ({ hot, cold, e, s, getMessages } = rxSandbox.create(true)));

  it('should take two values of an observable with many values', () => {
    const e1 = cold('   --a-----b----c---d--|');
    const e1subs = s('  ^-------!            ');
    const expected = e('--a-----(b|)         ');

    const value = getMessages(e1.pipe(take(2)));
    marbleAssert(value).to.equal(expected);
    marbleAssert(e1.subscriptions).to.equal([e1subs]);
  });

  it('should work with empty', () => {
    const e1 = cold('|');
    const e1subs = s('(^!)');
    const expected = e('|');

    const value = getMessages(e1.pipe(take(42)));
    marbleAssert(value).to.equal(expected);
    marbleAssert(e1.subscriptions).to.equal([e1subs]);
  });

  it('should go on forever on never', () => {
    const e1 = cold('   -');
    const e1subs = s('  ^');
    const expected = e('-');

    const value = getMessages(e1.pipe(take(42)));
    marbleAssert(value).to.equal(expected);
    marbleAssert(e1.subscriptions).to.equal([e1subs]);
  });

  it('should be empty on take(0)', () => {
    const e1 = hot('--a--^--b----c---d--|');
    const e1subs = []; // Don't subscribe at all
    const expected = e('|');

    const value = getMessages(e1.pipe(take(0)));
    marbleAssert(value).to.equal(expected);
    marbleAssert(e1.subscriptions).to.equal(e1subs);
  });

  it('should take one value of an observable with one value', () => {
    const e1 = hot('    ---(a|)');
    const e1subs = s('  ^--!   ');
    const expected = e('---(a|)');

    const value = getMessages(e1.pipe(take(1)));
    marbleAssert(value).to.equal(expected);
    marbleAssert(e1.subscriptions).to.equal([e1subs]);
  });

  it('should take one values of an observable with many values', () => {
    const e1 = hot('--a--^--b----c---d--|');
    const e1subs = s('   ^--!            ');
    const expected = e(' ---(b|)         ');

    const value = getMessages(e1.pipe(take(1)));
    marbleAssert(value).to.equal(expected);
    marbleAssert(e1.subscriptions).to.equal([e1subs]);
  });

  it('should error on empty', () => {
    const e1 = hot('--a--^----|');
    const e1subs = s('   ^----!');
    const expected = e(' -----|');

    const value = getMessages(e1.pipe(take(42)));
    marbleAssert(value).to.equal(expected);
    marbleAssert(e1.subscriptions).to.equal([e1subs]);
  });

  it('should propagate error from the source observable', () => {
    const e1 = hot('---^---#', null, 'too bad');
    const e1subs = s(' ^---!');
    const expected = e('----#', null, 'too bad');

    const value = getMessages(e1.pipe(take(42)));
    marbleAssert(value).to.equal(expected);
    marbleAssert(e1.subscriptions).to.equal([e1subs]);
  });

  it('should propagate error from an observable with values', () => {
    const e1 = hot(' ---^--a--b--#');
    const e1subs = s('  ^--------!');
    const expected = e('---a--b--#');

    const value = getMessages(e1.pipe(take(42)));
    marbleAssert(value).to.equal(expected);
    marbleAssert(e1.subscriptions).to.equal([e1subs]);
  });

  it('should allow unsubscribing explicitly and early', () => {
    const e1 = hot('    ---^--a--b-----c--d--e--|');
    const unsub = '        ---------!            ';
    const e1subs = s('     ^--------!            ');
    const expected = e('   ---a--b---            ');

    const value = getMessages(e1.pipe(take(42)), unsub);
    marbleAssert(value).to.equal(expected);
    marbleAssert(e1.subscriptions).to.equal([e1subs]);
  });

  it('should work with throw', () => {
    const e1 = cold('   #');
    const e1subs = s('  (^!)');
    const expected = e('#');

    const value = getMessages(e1.pipe(take(42)));
    marbleAssert(value).to.equal(expected);
    marbleAssert(e1.subscriptions).to.equal([e1subs]);
  });

  it('should throw if total is less than zero', () => {
    expect(() => { Observable.range(0, 10).take(-1); })
      .to.throw(ArgumentOutOfRangeError);
  });

  it('should not break unsubscription chain when unsubscribed explicitly', () => {
    const e1 = hot('---^--a--b-----c--d--e--|');
    const unsub = '    ---------!            ';
    const e1subs = s(' ^--------!            ');
    const expected = e('---a--b---            ');

    const result = e1
      .pipe(
      mergeMap((x) => of(x)),
      take(42),
      mergeMap((x) => of(x))
      );

    const value = getMessages(result, unsub);
    marbleAssert(value).to.equal(expected);
    marbleAssert(e1.subscriptions).to.equal([e1subs]);
  });

  it('should unsubscribe from the source when it reaches the limit', () => {
    const source = Observable.create((observer: Observer<number>) => {
      expect(observer.closed).to.be.false;
      observer.next(42);
      expect(observer.closed).to.be.true;
    }).take(1);

    source.subscribe();
  });

  it('should complete when the source is reentrant', () => {
    let completed = false;
    const source = new Subject();
    source.take(5).subscribe({
      next() {
        source.next();
      },
      complete() {
        completed = true;
      }
    });
    source.next();
    expect(completed).to.be.true;
  });
});
