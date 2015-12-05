/* globals describe, it, expect, hot, cold, expectObservable, expectSubscriptions */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('Observable.prototype.retryWhen()', function () {
  it('should retry when notified via returned notifier on thrown error', function (done) {
    var retried = false;
    var expected = [1, 2, 1, 2];
    var i = 0;
    Observable.of(1, 2, 3)
      .map(function (n) {
        if (n === 3) {
          throw 'bad';
        }
        return n;
      })
      .retryWhen(function (errors) {
        return errors.map(function (x) {
          expect(x).toBe('bad');
          if (retried) {
            throw 'done';
          }
          retried = true;
          return x;
        });
      })
      .subscribe(function (x) {
        expect(x).toBe(expected[i++]);
      },
      function (err) {
        expect(err).toBe('done');
        done();
      });
  });

  it('should retry when notified and complete on returned completion', function (done) {
    var expected = [1, 2, 1, 2];
    Observable.of(1, 2, 3)
      .map(function (n) {
        if (n === 3) {
          throw 'bad';
        }
        return n;
      })
      .retryWhen(function (errors) {
        return Observable.empty();
      })
      .subscribe(function (n) {
        expect(n).toBe(expected.shift());
      }, function (err) {
        throw 'error should not be called';
      }, done);
  });

  it('should apply an empty notifier on an empty source', function () {
    var source = cold(  '|');
    var subs =          '(^!)';
    var notifier = cold('|');
    var expected =      '|';

    var result = source.retryWhen(function (errors) { return notifier; });

    expectObservable(result).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should apply a never notifier on an empty source', function () {
    var source = cold(  '|');
    var subs =          '(^!)';
    var notifier = cold('-');
    var expected =      '|';

    var result = source.retryWhen(function (errors) { return notifier; });

    expectObservable(result).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should apply an empty notifier on a never source', function () {
    var source = cold(  '-');
    var unsub =         '                                         !';
    var subs =          '^                                        !';
    var notifier = cold('|');
    var expected =      '-';

    var result = source.retryWhen(function (errors) { return notifier; });

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should apply a never notifier on a never source', function () {
    var source = cold(  '-');
    var unsub =         '                                         !';
    var subs =          '^                                        !';
    var notifier = cold('-');
    var expected =      '-';

    var result = source.retryWhen(function (errors) { return notifier; });

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should return an empty observable given a just-throw source and empty notifier', function () {
    var source = cold(  '#');
    var notifier = cold('|');
    var expected =      '|';

    var result = source.retryWhen(function (errors) { return notifier; });

    expectObservable(result).toBe(expected);
  });

  it('should return a never observable given a just-throw source and never notifier', function () {
    var source = cold(  '#');
    var notifier = cold('-');
    var expected =      '-';

    var result = source.retryWhen(function (errors) { return notifier; });

    expectObservable(result).toBe(expected);
  });

  it('should hide errors using a never notifier on a source with eventual error', function () {
    var source = cold(  '--a--b--c--#');
    var subs =          '^          !';
    var notifier = cold(           '-');
    var expected =      '--a--b--c---------------------------------';

    var result = source.retryWhen(function (errors) { return notifier; });

    expectObservable(result).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should propagate error thrown from notifierSelector function', function () {
    var source = cold('--a--b--c--#');
    var subs =        '^          !';
    var expected =    '--a--b--c--#';

    var result = source.retryWhen(function () { throw 'bad!'; });

    expectObservable(result).toBe(expected, undefined, 'bad!');
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should replace error with complete using an empty notifier on a source ' +
  'with eventual error', function () {
    var source = cold(  '--a--b--c--#');
    var subs =          '^          !';
    var notifier = cold(           '|');
    var expected =      '--a--b--c--|';

    var result = source.retryWhen(function (errors) { return notifier; });

    expectObservable(result).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should mirror a basic cold source with complete, given a never notifier', function () {
    var source = cold(  '--a--b--c--|');
    var subs =          '^          !';
    var notifier = cold(           '|');
    var expected =      '--a--b--c--|';

    var result = source.retryWhen(function (errors) { return notifier; });

    expectObservable(result).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should mirror a basic cold source with no termination, given a never notifier', function () {
    var source = cold(  '--a--b--c---');
    var subs =          '^           ';
    var notifier = cold(           '|');
    var expected =      '--a--b--c---';

    var result = source.retryWhen(function (errors) { return notifier; });

    expectObservable(result).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should mirror a basic hot source with complete, given a never notifier', function () {
    var source = hot('-a-^--b--c--|');
    var subs =          '^        !';
    var notifier = cold(         '|');
    var expected =      '---b--c--|';

    var result = source.retryWhen(function (errors) { return notifier; });

    expectObservable(result).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should handle a source with eventual error using a hot notifier', function () {
    var source = cold( '-1--2--#');
    var subs =        ['^      !                    ',
                       '         ^      !           ',
                       '                 ^      !   '];
    var notifier = hot('---------r-------r---------#');
    var expected =     '-1--2-----1--2----1--2-----#';

    var result = source.retryWhen(function (errors) { return notifier; });

    expectObservable(result).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should handle a hot source that raises error but eventually completes', function () {
    var source =   hot('-1--2--3----4--5---|');
    var ssubs =       ['^      !            ',
                       '              ^    !'];
    var notifier = hot('--------------r--------r---r--r--r---|');
    var nsubs =        '       ^           !';
    var expected =     '-1--2---      -5---|';

    var result = source
      .map(function (x) {
        if (x === '3') {
          throw 'error';
        }
        return x;
      })
      .retryWhen(function () {
        return notifier;
      });

    expectObservable(result).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(ssubs);
    expectSubscriptions(notifier.subscriptions).toBe(nsubs);
  });

  it('should tear down resources when result is unsubscribed early', function () {
    var source = cold( '-1--2--#');
    var unsub =        '                    !       ';
    var subs =        ['^      !                    ',
                       '         ^      !           ',
                       '                 ^  !       '];
    var notifier = hot('---------r-------r---------#');
    var nsubs =        '       ^            !       ';
    var expected =     '-1--2-----1--2----1--       ';

    var result = source.retryWhen(function (errors) { return notifier; });

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
    expectSubscriptions(notifier.subscriptions).toBe(nsubs);
  });

  it('should not break unsubscription chains when unsubscribed explicitly', function () {
    var source = cold( '-1--2--#');
    var subs =        ['^      !                    ',
                       '         ^      !           ',
                       '                 ^  !       '];
    var notifier = hot('---------r-------r-------r-#');
    var nsubs =        '       ^            !       ';
    var expected =     '-1--2-----1--2----1--       ';
    var unsub =        '                    !       ';

    var result = source
      .mergeMap(function (x) { return Observable.of(x); })
      .retryWhen(function (errors) { return notifier; })
      .mergeMap(function (x) { return Observable.of(x); });

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
    expectSubscriptions(notifier.subscriptions).toBe(nsubs);
  });

  it('should handle a source with eventual error using a dynamic notifier ' +
  'selector which eventually throws', function () {
    var source = cold('-1--2--#');
    var subs =       ['^      !              ',
                      '       ^      !       ',
                      '              ^      !'];
    var expected =    '-1--2---1--2---1--2--#';

    var invoked = 0;
    var result = source.retryWhen(function (errors) {
      return errors.map(function (err) {
        if (++invoked === 3) {
          throw 'error';
        } else {
          return 'x';
        }
      });
    });

    expectObservable(result).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should handle a source with eventual error using a dynamic notifier ' +
  'selector which eventually completes', function () {
    var source = cold('-1--2--#');
    var subs =       ['^      !              ',
                      '       ^      !       ',
                      '              ^      !'];
    var expected =    '-1--2---1--2---1--2--|';

    var invoked = 0;
    var result = source.retryWhen(function (errors) {
      return errors
        .map(function () { return 'x'; })
        .takeUntil(
          errors.flatMap(function () {
            if (++invoked < 3) {
              return Observable.empty();
            } else {
              return Observable.of('stop!');
            }
          })
        );
    });

    expectObservable(result).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });
});