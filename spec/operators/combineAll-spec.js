/* globals describe, it, expect, hot, cold, expectObservable */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;
var queueScheduler = Rx.Scheduler.queue;

describe('Observable.prototype.combineAll()', function () {
  it('should work with two nevers', function () {
    var e1 = cold( '-');
    var e1subs =   '^';
    var e2 = cold( '-');
    var e2subs =   '^';
    var expected = '-';

    var result = Observable.of(e1, e2).combineAll(function (x, y) { return x + y; });

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should work with never and empty', function () {
    var e1 = cold( '-');
    var e1subs =   '^';
    var e2 = cold( '|');
    var e2subs =   '(^!)';
    var expected = '-';

    var result = Observable.of(e1, e2).combineAll(function (x, y) { return x + y; });

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should work with empty and never', function () {
    var e1 = cold( '|');
    var e1subs =   '(^!)';
    var e2 = cold( '-');
    var e2subs =   '^';
    var expected = '-';

    var result = Observable.of(e1, e2).combineAll(function (x, y) { return x + y; });

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should work with empty and empty', function () {
    var e1 = cold('|');
    var e1subs =  '(^!)';
    var e2 = cold('|');
    var e2subs =  '(^!)';
    var expected = '|';

    var result = Observable.of(e1, e2).combineAll(function (x, y) { return x + y; });

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should work with hot-empty and hot-single', function () {
    var e1 =        hot('-a-^-|');
    var e1subs =           '^ !';
    var e2 =        hot('-b-^-c-|');
    var e2subs =           '^   !';
    var expected =         '----|';

    var result = Observable.of(e1, e2).combineAll(function (x, y) { return x + y; });

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should work with hot-single and hot-empty', function () {
    var e1 =        hot('-a-^-|');
    var e1subs =           '^ !';
    var e2 =        hot('-b-^-c-|');
    var e2subs =           '^   !';
    var expected =         '----|';

    var result = Observable.of(e2, e1).combineAll(function (x, y) { return x + y; });

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should work with hot-single and never', function () {
    var e1 =        hot('-a-^-|');
    var e1subs =           '^ !';
    var e2 =        hot('------'); //never
    var e2subs =           '^  ';
    var expected =         '-'; //never

    var result = Observable.of(e1, e2).combineAll(function (x, y) { return x + y; });

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should work with never and hot-single', function () {
    var e1 =        hot('--------'); //never
    var e1subs =           '^    ';
    var e2 =        hot('-a-^-b-|');
    var e2subs =           '^   !';
    var expected =         '-----'; //never

    var result = Observable.of(e1, e2).combineAll(function (x, y) { return x + y; });

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should work with hot and hot', function () {
    var e1 =   hot('--a--^--b--c--|');
    var e1subs =        '^        !';
    var e2 =   hot('---e-^---f--g--|');
    var e2subs =        '^         !';
    var expected =      '----x-yz--|';

    var result = Observable.of(e1, e2).combineAll(function (x, y) { return x + y; });

    expectObservable(result).toBe(expected, { x: 'bf', y: 'cf', z: 'cg' });
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should combine 3 observables', function () {
    var e1 =   hot('--a--^--b--c--|');
    var e1subs =        '^        !';
    var e2 =   hot('---e-^---f--g--|');
    var e2subs =        '^         !';
    var e3 =   hot('---h-^----i--j-|');
    var e3subs =        '^         !';
    var expected =      '-----wxyz-|';

    var result = Observable.of(e1, e2, e3).combineAll(function (x, y, z) { return x + y + z; });

    expectObservable(result).toBe(expected, { w: 'bfi', x: 'cfi', y: 'cgi', z: 'cgj' });
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
    expectSubscriptions(e3.subscriptions).toBe(e3subs);
  });

  it('should work with empty and error', function () {
    var e1 =   hot('----------|'); //empty
    var e1subs =   '^     !';
    var e2 =   hot('------#', undefined, 'shazbot!'); //error
    var e2subs =   '^     !';
    var expected = '------#';

    var result = Observable.of(e1, e2).combineAll(function (x, y) { return x + y; });

    expectObservable(result).toBe(expected, null, 'shazbot!');
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should work with error and empty', function () {
    var e1 =   hot('--^---#', undefined, 'too bad, honk'); //error
    var e1subs =     '^   !';
    var e2 =   hot('--^--------|'); //empty
    var e2subs =     '^   !';
    var expected =   '----#';

    var result = Observable.of(e1, e2).combineAll(function (x, y) { return x + y; });

    expectObservable(result).toBe(expected, null, 'too bad, honk');
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should work with hot and throw', function () {
    var e1 =    hot('-a-^--b--c--|');
    var e1subs =       '^ !';
    var e2 =    hot('---^-#', undefined, 'bazinga');
    var e2subs =       '^ !';
    var expected =     '--#';

    var result = Observable.of(e1, e2).combineAll(function (x, y) { return x + y; });

    expectObservable(result).toBe(expected, null, 'bazinga');
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should work with throw and hot', function () {
    var e1 =    hot('---^-#', undefined, 'bazinga');
    var e1subs =       '^ !';
    var e2 =    hot('-a-^--b--c--|');
    var e2subs =       '^ !';
    var expected =     '--#';

    var result = Observable.of(e1, e2).combineAll(function (x, y) { return x + y; });

    expectObservable(result).toBe(expected, null, 'bazinga');
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should work with throw and throw', function () {
    var e1 =    hot('---^----#', undefined, 'jenga');
    var e1subs =       '^ !';
    var e2 =    hot('---^-#', undefined, 'bazinga');
    var e2subs =       '^ !';
    var expected =     '--#';

    var result = Observable.of(e1, e2).combineAll(function (x, y) { return x + y; });

    expectObservable(result).toBe(expected, null, 'bazinga');
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should work with error and throw', function () {
    var e1 =    hot('-a-^--b--#', undefined, 'wokka wokka');
    var e1subs =       '^ !';
    var e2 =    hot('---^-#', undefined, 'flurp');
    var e2subs =       '^ !';
    var expected =     '--#';

    var result = Observable.of(e1, e2).combineAll(function (x, y) { return x + y; });

    expectObservable(result).toBe(expected, null, 'flurp');
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should work with throw and error', function () {
    var e1 =    hot('---^-#', undefined, 'flurp');
    var e1subs =       '^ !';
    var e2 =    hot('-a-^--b--#', undefined, 'wokka wokka');
    var e2subs =       '^ !';
    var expected =     '--#';

    var result = Observable.of(e1, e2).combineAll(function (x, y) { return x + y; });

    expectObservable(result).toBe(expected, null, 'flurp');
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should work with never and throw', function () {
    var e1 =    hot('---^-----------');
    var e1subs =       '^     !';
    var e2 =    hot('---^-----#', undefined, 'wokka wokka');
    var e2subs =       '^     !';
    var expected =     '------#';

    var result = Observable.of(e1, e2).combineAll(function (x, y) { return x + y; });

    expectObservable(result).toBe(expected, null, 'wokka wokka');
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should work with throw and never', function () {
    var e1 =    hot('---^----#', undefined, 'wokka wokka');
    var e1subs =       '^    !';
    var e2 =    hot('---^-----------');
    var e2subs =       '^    !';
    var expected =     '-----#';

    var result = Observable.of(e1, e2).combineAll(function (x, y) { return x + y; });

    expectObservable(result).toBe(expected, null, 'wokka wokka');
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should work with some and throw', function () {
    var e1 =    hot('---^----a---b--|');
    var e1subs =       '^  !';
    var e2 =    hot('---^--#', undefined, 'wokka wokka');
    var e2subs =       '^  !';
    var expected =     '---#';

    var result = Observable.of(e1, e2).combineAll(function (x, y) { return x + y; });

    expectObservable(result).toBe(expected, { a: 1, b: 2}, 'wokka wokka');
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should work with throw and some', function () {
    var e1 =    hot('---^--#', undefined, 'wokka wokka');
    var e1subs =       '^  !';
    var e2 =    hot('---^----a---b--|');
    var e2subs =       '^  !';
    var expected =     '---#';

    var result = Observable.of(e1, e2).combineAll(function (x, y) { return x + y; });

    expectObservable(result).toBe(expected, null, 'wokka wokka');
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should handle throw after complete left', function () {
    var left =  hot('--a--^--b---|');
    var leftSubs =       '^      !';
    var right = hot('-----^--------#', undefined, 'bad things');
    var rightSubs =      '^        !';
    var expected =       '---------#';

    var result = Observable.of(left, right).combineAll(function (x, y) { return x + y; });

    expectObservable(result).toBe(expected, null, 'bad things');
    expectSubscriptions(left.subscriptions).toBe(leftSubs);
    expectSubscriptions(right.subscriptions).toBe(rightSubs);
  });

  it('should handle throw after complete right', function () {
    var left =   hot('-----^--------#', undefined, 'bad things');
    var leftSubs =        '^        !';
    var right =  hot('--a--^--b---|');
    var rightSubs =       '^      !';
    var expected =        '---------#';

    var result = Observable.of(left, right).combineAll(function (x, y) { return x + y; });

    expectObservable(result).toBe(expected, null, 'bad things');
    expectSubscriptions(left.subscriptions).toBe(leftSubs);
    expectSubscriptions(right.subscriptions).toBe(rightSubs);
  });

  it('should handle interleaved with tail', function () {
    var e1 = hot('-a--^--b---c---|');
    var e1subs =     '^          !';
    var e2 = hot('--d-^----e---f--|');
    var e2subs =     '^           !';
    var expected =   '-----x-y-z--|';

    var result = Observable.of(e1, e2).combineAll(function (x, y) { return x + y; });

    expectObservable(result).toBe(expected, { x: 'be', y: 'ce', z: 'cf' });
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should handle two consecutive hot observables', function () {
    var e1 = hot('--a--^--b--c--|');
    var e1subs =      '^        !';
    var e2 = hot('-----^----------d--e--f--|');
    var e2subs =      '^                   !';
    var expected =    '-----------x--y--z--|';

    var result = Observable.of(e1, e2).combineAll(function (x, y) { return x + y; });

    expectObservable(result).toBe(expected, { x: 'cd', y: 'ce', z: 'cf' });
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should handle two consecutive hot observables with error left', function () {
    var left =  hot('--a--^--b--c--#', undefined, 'jenga');
    var leftSubs =       '^        !';
    var right = hot('-----^----------d--e--f--|');
    var rightSubs =      '^        !';
    var expected =       '---------#';

    var result = Observable.of(left, right).combineAll(function (x, y) { return x + y; });

    expectObservable(result).toBe(expected, null, 'jenga');
    expectSubscriptions(left.subscriptions).toBe(leftSubs);
    expectSubscriptions(right.subscriptions).toBe(rightSubs);
  });

  it('should handle two consecutive hot observables with error right', function () {
    var left =  hot('--a--^--b--c--|');
    var leftSubs =       '^        !';
    var right = hot('-----^----------d--e--f--#', undefined, 'dun dun dun');
    var rightSubs =      '^                   !';
    var expected =       '-----------x--y--z--#';

    var result = Observable.of(left, right).combineAll(function (x, y) { return x + y; });

    expectObservable(result).toBe(expected, { x: 'cd', y: 'ce', z: 'cf' }, 'dun dun dun');
    expectSubscriptions(left.subscriptions).toBe(leftSubs);
    expectSubscriptions(right.subscriptions).toBe(rightSubs);
  });

  it('should handle selector throwing', function () {
    var e1 = hot('--a--^--b--|');
    var e1subs =      '^  !';
    var e2 = hot('--c--^--d--|');
    var e2subs =      '^  !';
    var expected =    '---#';

    var result = Observable.of(e1, e2).combineAll(function (x, y) { throw 'ha ha ' + x + ', ' + y; });

    expectObservable(result).toBe(expected, null, 'ha ha b, d');
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should combine two observables', function (done) {
    var a = Observable.of(1, 2, 3);
    var b = Observable.of(4, 5, 6, 7, 8);
    var expected = [[3, 4], [3, 5], [3, 6], [3, 7], [3, 8]];
    Observable.of(a, b).combineAll().subscribe(function (vals) {
      expect(vals).toEqual(expected.shift());
    }, null, function () {
      expect(expected.length).toBe(0);
      done();
    });
  });

  it('should combine two immediately-scheduled observables', function (done) {
    var a = Observable.of(1, 2, 3, queueScheduler);
    var b = Observable.of(4, 5, 6, 7, 8, queueScheduler);
    var r = [[1, 4], [2, 4], [2, 5], [3, 5], [3, 6], [3, 7], [3, 8]];
    var i = 0;
    Observable.of(a, b, queueScheduler).combineAll().subscribe(function (vals) {
      expect(vals).toDeepEqual(r[i++]);
    }, null, function () {
      expect(i).toEqual(r.length);
      done();
    });
  });
});