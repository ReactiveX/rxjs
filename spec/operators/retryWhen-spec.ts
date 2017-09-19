import { expect } from 'chai';
import * as Rx from '../../dist/package/Rx';
import marbleTestingSignature = require('../helpers/marble-testing'); // tslint:disable-line:no-require-imports

declare const { asDiagram };
declare const hot: typeof marbleTestingSignature.hot;
declare const cold: typeof marbleTestingSignature.cold;
declare const expectObservable: typeof marbleTestingSignature.expectObservable;
declare const expectSubscriptions: typeof marbleTestingSignature.expectSubscriptions;

const Observable = Rx.Observable;

/** @test {retryWhen} */
describe('Observable.prototype.retryWhen', () => {
  asDiagram('retryWhen')('should handle a source with eventual error using a hot notifier', () => {
    const source =  cold('-1--2--#');
    const subs =        ['^      !                     ',
                       '             ^      !        ',
                       '                          ^ !'];
    const notifier = hot('-------------r------------r-|');
    const expected =     '-1--2---------1--2---------1|';

    const result = source.retryWhen((errors: any) => notifier);

    expectObservable(result).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should handle a source with eventual error using a hot notifier that raises error', () => {
    const source = cold( '-1--2--#');
    const subs =        ['^      !                    ',
                       '           ^      !           ',
                       '                   ^      !   '];
    const notifier = hot('-----------r-------r---------#');
    const expected =     '-1--2-------1--2----1--2-----#';

    const result = source.retryWhen((errors: any) => notifier);

    expectObservable(result).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should retry when notified via returned notifier on thrown error', (done: MochaDone) => {
    let retried = false;
    const expected = [1, 2, 1, 2];
    let i = 0;
    Observable.of(1, 2, 3)
      .map((n: number) => {
        if (n === 3) {
          throw 'bad';
        }
        return n;
      })
      .retryWhen((errors: any) => errors.map((x: any) => {
          expect(x).to.equal('bad');
          if (retried) {
            throw new Error('done');
          }
          retried = true;
          return x;
      }))
      .subscribe((x: any) => {
        expect(x).to.equal(expected[i++]);
      },
      (err: any) => {
        expect(err).to.be.an('error', 'done');
        done();
      });
  });

  it('should retry when notified and complete on returned completion', (done: MochaDone) => {
    const expected = [1, 2, 1, 2];
    Observable.of(1, 2, 3)
      .map((n: number) => {
        if (n === 3) {
          throw 'bad';
        }
        return n;
      })
      .retryWhen((errors: any) => Observable.empty())
      .subscribe((n: number) => {
        expect(n).to.equal(expected.shift());
      }, (err: any) => {
        done(new Error('should not be called'));
      }, () => {
        done();
      });
  });

  it('should apply an empty notifier on an empty source', () => {
    const source = cold(  '|');
    const subs =          '(^!)';
    const notifier = cold('|');
    const expected =      '|';

    const result = source.retryWhen((errors: any) => notifier);

    expectObservable(result).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should apply a never notifier on an empty source', () => {
    const source = cold(  '|');
    const subs =          '(^!)';
    const notifier = cold('-');
    const expected =      '|';

    const result = source.retryWhen((errors: any) => notifier);

    expectObservable(result).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should apply an empty notifier on a never source', () => {
    const source = cold(  '-');
    const unsub =         '                                         !';
    const subs =          '^                                        !';
    const notifier = cold('|');
    const expected =      '-';

    const result = source.retryWhen((errors: any) => notifier);

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should apply a never notifier on a never source', () => {
    const source = cold(  '-');
    const unsub =         '                                         !';
    const subs =          '^                                        !';
    const notifier = cold('-');
    const expected =      '-';

    const result = source.retryWhen((errors: any) => notifier);

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should return an empty observable given a just-throw source and empty notifier', () => {
    const source = cold(  '#');
    const notifier = cold('|');
    const expected =      '|';

    const result = source.retryWhen((errors: any) => notifier);

    expectObservable(result).toBe(expected);
  });

  it('should return a never observable given a just-throw source and never notifier', () => {
    const source = cold(  '#');
    const notifier = cold('-');
    const expected =      '-';

    const result = source.retryWhen((errors: any) => notifier);

    expectObservable(result).toBe(expected);
  });

  it('should hide errors using a never notifier on a source with eventual error', () => {
    const source = cold(  '--a--b--c--#');
    const subs =          '^          !';
    const notifier = cold(           '-');
    const expected =      '--a--b--c---------------------------------';

    const result = source.retryWhen((errors: any) => notifier);

    expectObservable(result).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should propagate error thrown from notifierSelector function', () => {
    const source = cold('--a--b--c--#');
    const subs =        '^          !';
    const expected =    '--a--b--c--#';

    const result = source.retryWhen(<any>(() => { throw 'bad!'; }));

    expectObservable(result).toBe(expected, undefined, 'bad!');
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should replace error with complete using an empty notifier on a source ' +
  'with eventual error', () => {
    const source = cold(  '--a--b--c--#');
    const subs =          '^          !';
    const notifier = cold(           '|');
    const expected =      '--a--b--c--|';

    const result = source.retryWhen((errors: any) => notifier);

    expectObservable(result).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should mirror a basic cold source with complete, given a never notifier', () => {
    const source = cold(  '--a--b--c--|');
    const subs =          '^          !';
    const notifier = cold(           '|');
    const expected =      '--a--b--c--|';

    const result = source.retryWhen((errors: any) => notifier);

    expectObservable(result).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should mirror a basic cold source with no termination, given a never notifier', () => {
    const source = cold(  '--a--b--c---');
    const subs =          '^           ';
    const notifier = cold(           '|');
    const expected =      '--a--b--c---';

    const result = source.retryWhen((errors: any) => notifier);

    expectObservable(result).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should mirror a basic hot source with complete, given a never notifier', () => {
    const source = hot('-a-^--b--c--|');
    const subs =          '^        !';
    const notifier = cold(         '|');
    const expected =      '---b--c--|';

    const result = source.retryWhen((errors: any) => notifier);

    expectObservable(result).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should handle a hot source that raises error but eventually completes', () => {
    const source =   hot('-1--2--3----4--5---|');
    const ssubs =       ['^      !            ',
                       '              ^    !'];
    const notifier = hot('--------------r--------r---r--r--r---|');
    const nsubs =        '       ^           !';
    const expected =     '-1--2---      -5---|';

    const result = source
      .map((x: string) => {
        if (x === '3') {
          throw 'error';
        }
        return x;
      }).retryWhen(() => notifier);

    expectObservable(result).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(ssubs);
    expectSubscriptions(notifier.subscriptions).toBe(nsubs);
  });

  it('should tear down resources when result is unsubscribed early', () => {
    const source = cold( '-1--2--#');
    const unsub =        '                    !       ';
    const subs =        ['^      !                    ',
                       '         ^      !           ',
                       '                 ^  !       '];
    const notifier = hot('---------r-------r---------#');
    const nsubs =        '       ^            !       ';
    const expected =     '-1--2-----1--2----1--       ';

    const result = source.retryWhen((errors: any) => notifier);

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
    expectSubscriptions(notifier.subscriptions).toBe(nsubs);
  });

  it('should not break unsubscription chains when unsubscribed explicitly', () => {
    const source = cold( '-1--2--#');
    const subs =        ['^      !                    ',
                       '         ^      !           ',
                       '                 ^  !       '];
    const notifier = hot('---------r-------r-------r-#');
    const nsubs =        '       ^            !       ';
    const expected =     '-1--2-----1--2----1--       ';
    const unsub =        '                    !       ';

    const result = source
      .mergeMap((x: string) => Observable.of(x))
      .retryWhen((errors: any) => notifier)
      .mergeMap((x: string) => Observable.of(x));

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
    expectSubscriptions(notifier.subscriptions).toBe(nsubs);
  });

  it('should handle a source with eventual error using a dynamic notifier ' +
  'selector which eventually throws', () => {
    const source = cold('-1--2--#');
    const subs =       ['^      !              ',
                      '       ^      !       ',
                      '              ^      !'];
    const expected =    '-1--2---1--2---1--2--#';

    let invoked = 0;
    const result = source.retryWhen((errors: any) =>
      errors.map((err: any) => {
        if (++invoked === 3) {
          throw 'error';
        } else {
          return 'x';
        }
      }));

    expectObservable(result).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should handle a source with eventual error using a dynamic notifier ' +
  'selector which eventually completes', () => {
    const source = cold('-1--2--#');
    const subs =       ['^      !              ',
                      '       ^      !       ',
                      '              ^      !'];
    const expected =    '-1--2---1--2---1--2--|';

    let invoked = 0;
    const result = source.retryWhen((errors: any) => errors
        .map(() => 'x')
        .takeUntil(
          errors.flatMap(() => {
            if (++invoked < 3) {
              return Observable.empty();
            } else {
              return Observable.of('stop!');
            }
          })
      ));

    expectObservable(result).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });
});
