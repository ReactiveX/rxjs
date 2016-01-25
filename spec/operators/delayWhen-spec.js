/* globals describe, it, expect, expectObservable, expectSubscriptions, hot, cold, rxTestScheduler */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('Observable.prototype.delayWhen()', function () {
  it.asDiagram('delay(durationSelector)')('should delay by duration selector', function () {
    var e1 =        hot('---a---b---c--|');
    var expected =      '-----a------c----(b|)';
    var subs =          '^                !';
    var selector = [cold(  '--x--|'),
                    cold(      '----------x-|'),
                    cold(          '-x--|')];
    var selectorSubs = ['   ^ !            ',
                        '       ^         !',
                        '           ^!     '];

    var idx = 0;
    function durationSelector(x) {
      return selector[idx++];
    }

    var result = e1.delayWhen(durationSelector);

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
    expectSubscriptions(selector[0].subscriptions).toBe(selectorSubs[0]);
    expectSubscriptions(selector[1].subscriptions).toBe(selectorSubs[1]);
    expectSubscriptions(selector[2].subscriptions).toBe(selectorSubs[2]);
  });

  it('should delay by selector', function () {
    var e1 =        hot('--a--b--|');
    var expected =      '---a--b-|';
    var subs =          '^       !';
    var selector = cold(  '-x--|');
    var selectorSubs = ['  ^!     ',
                        '     ^!  '];

    var result = e1.delayWhen(function (x) { return selector; });

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
    expectSubscriptions(selector.subscriptions).toBe(selectorSubs);
  });

  it('should raise error if source raises error', function () {
    var e1 =        hot('--a--#');
    var expected =      '---a-#';
    var subs =          '^    !';
    var selector = cold(  '-x--|');
    var selectorSubs =  '  ^!     ';

    var result = e1.delayWhen(function (x) { return selector; });

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
    expectSubscriptions(selector.subscriptions).toBe(selectorSubs);
  });

  it('should raise error if selector raises error', function () {
    var e1 =        hot('--a--b--|');
    var expected =      '---#';
    var subs =          '^  !';
    var selector = cold(  '-#');
    var selectorSubs =  '  ^!     ';

    var result = e1.delayWhen(function (x) { return selector; });

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
    expectSubscriptions(selector.subscriptions).toBe(selectorSubs);
  });

  it('should delay by selector and completes after value emits', function () {
    var e1 =        hot('--a--b--|');
    var expected =      '---------a--(b|)';
    var subs =          '^           !';
    var selector = cold('-------x--|');
    var selectorSubs = ['  ^      !',
                        '     ^      !'];

    var result = e1.delayWhen(function (x) { return selector; });

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
    expectSubscriptions(selector.subscriptions).toBe(selectorSubs);
  });

  it('should delay by selector completes if selector does not emits', function () {
    var e1 =        hot('--a--b--|');
    var expected =      '------a--(b|)';
    var subs =          '^        !';
    var selector = cold(  '----|');
    var selectorSubs = ['  ^   !',
                        '     ^   !'];

    var result = e1.delayWhen(function (x) { return selector; });

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
    expectSubscriptions(selector.subscriptions).toBe(selectorSubs);
  });

  it('should not emit if selector never emits', function () {
    var e1 =        hot('--a--b--|');
    var expected =      '-';
    var subs =          '^         ';
    var selector = cold(  '-');
    var selectorSubs = ['  ^       ',
                        '     ^    '];

    var result = e1.delayWhen(function (x) { return selector; });

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
    expectSubscriptions(selector.subscriptions).toBe(selectorSubs);
  });

  it('should delay by first value from selector', function () {
    var e1 =        hot('--a--b--|');
    var expected =      '------a--(b|)';
    var subs =          '^        !';
    var selector = cold(  '----x--y--|');
    var selectorSubs = ['  ^   !',
                        '     ^   !'];

    var result = e1.delayWhen(function (x) { return selector; });

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
    expectSubscriptions(selector.subscriptions).toBe(selectorSubs);
  });

  it('should delay by selector does not completes', function () {
    var e1 =        hot('--a--b--|');
    var expected =      '------a--(b|)';
    var subs =          '^        !';
    var selector = cold(  '----x-----y---');
    var selectorSubs = ['  ^   !',
                        '     ^   !'];

    var result = e1.delayWhen(function (x) { return selector; });

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
    expectSubscriptions(selector.subscriptions).toBe(selectorSubs);
  });

  it('should raise error if selector throws', function () {
    var e1 =        hot('--a--b--|');
    var expected =      '--#';
    var subs =          '^ !';

    var err = new Error('error');
    var result = e1.delayWhen(function (x) { throw err; });

    expectObservable(result).toBe(expected, null, err);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should start subscription when subscription delay emits', function () {
    var e1 =        hot('-----a---b---|');
    var expected =      '  -----a---b-|';
    var subs =          '  ^          !';
    var selector = cold(     '--x--|');
    var selectorSubs = ['     ^ !',
                        '         ^ !'];
    var subDelay = cold('--x--|');
    var subDelaySub =   '^ !';

    var result = e1.delayWhen(function (x) { return selector; }, subDelay);

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
    expectSubscriptions(selector.subscriptions).toBe(selectorSubs);
    expectSubscriptions(subDelay.subscriptions).toBe(subDelaySub);
  });

  it('should start subscription when subscription delay completes without emit value', function () {
    var e1 =        hot('-----a---b---|');
    var expected =      '  -----a---b-|';
    var subs =          '  ^          !';
    var selector = cold(     '--x--|');
    var selectorSubs = ['     ^ !',
                        '         ^ !'];
    var subDelay = cold('--|');
    var subDelaySub =   '^ !';

    var result = e1.delayWhen(function (x) { return selector; }, subDelay);

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
    expectSubscriptions(selector.subscriptions).toBe(selectorSubs);
    expectSubscriptions(subDelay.subscriptions).toBe(subDelaySub);
  });

  it('should raise error when subscription delay raises error', function () {
    var e1 =        hot('-----a---b---|');
    var expected =      '   #          ';
    var selector = cold(     '--x--|');
    var subDelay = cold('---#');
    var subDelaySub =   '^  !';

    var result = e1.delayWhen(function (x) { return selector; }, subDelay);

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe([]);
    expectSubscriptions(selector.subscriptions).toBe([]);
    expectSubscriptions(subDelay.subscriptions).toBe(subDelaySub);
  });
});