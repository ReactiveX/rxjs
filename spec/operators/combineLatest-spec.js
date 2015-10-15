/* globals describe, it, expect, hot, cold, expectObservable */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;
var immediateScheduler = Rx.Scheduler.immediate;

describe('Observable.prototype.combineLatest', function () {
  it('should work with two nevers', function () {
    var e1 = Observable.never();
    var e2 = Observable.never();

    expectObservable(e1.combineLatest(e2, function (x, y) { return x + y; })).toBe('-');
  });

  it('should work with never and empty', function () {
    var e1 = Observable.never();
    var e2 = Observable.empty();

    expectObservable(e1.combineLatest(e2, function (x, y) { return x + y; })).toBe('-');
  });

  it('should work with empty and never', function () {
    var e1 = Observable.empty();
    var e2 = Observable.never();

    expectObservable(e1.combineLatest(e2, function (x, y) { return x + y; })).toBe('-');
  });

  it('should work with empty and empty', function () {
    var e1 = Observable.empty();
    var e2 = Observable.empty();

    expectObservable(e1.combineLatest(e2, function (x, y) { return x + y; })).toBe('|');
  });

  it('should work with hot-empty and hot-single', function () {
    var values = {
      a: 1,
      b: 2,
      c: 3,
      r: 1 + 3 //a + c
    };
    var e1 =        hot('-a-^-|', values);
    var e2 =        hot('-b-^-c-|', values);
    var expected =         '----|';

    expectObservable(e1.combineLatest(e2, function (x, y) { return x + y; })).toBe(expected, values);
  });

  it('should work with hot-single and hot-empty', function () {
    var values = {
      a: 1, b: 2, c: 3
    };
    var e1 =        hot('-a-^-|', values);
    var e2 =        hot('-b-^-c-|', values);
    var expected =         '----|';

    expectObservable(e2.combineLatest(e1, function (x, y) { return x + y; })).toBe(expected, values);
  });

  it('should work with hot-single and never', function () {
    var values = {
      a: 1
    };
    var e1 =        hot('-a-^-|', values);
    var e2 =        hot('------', values); //never
    var expected =         '-'; //never

    expectObservable(e1.combineLatest(e2, function (x, y) { return x + y; })).toBe(expected, values);
  });

  it('should work with never and hot-single', function () {
    var values = {
      a: 1, b: 2
    };
    var e1 =        hot('--------', values); //never
    var e2 =        hot('-a-^-b-|', values);
    var expected =         '-----'; //never

    expectObservable(e1.combineLatest(e2, function (x, y) { return x + y; })).toBe(expected, values);
  });

  it('should work with hot and hot', function () {
    var e1 =   hot('--a--^--b--c--|', { a: 'a', b: 'b', c: 'c' });
    var e2 =   hot('---e-^---f--g--|', { e: 'e', f: 'f', g: 'g' });
    var expected =      '----x-yz--|';

    expectObservable(e1.combineLatest(e2, function (x, y) {
      return x + y;
    })).toBe(expected, { x: 'bf', y: 'cf', z: 'cg' });
  });

  it('should work with empty and error', function () {
    var e1 =   hot('----------|'); //empty
    var e2 =   hot('------#', null, 'shazbot!'); //error
    var expected = '------#';
    expectObservable(e1.combineLatest(e2, function (x, y) {
      return x + y;
    })).toBe(expected, null, 'shazbot!');
  });

  it('should work with error and empty', function () {
    var e1 =   hot('--^---#', null, 'too bad, honk'); //error
    var e2 =   hot('--^--------|'); //empty
    var expected =   '----#';
    expectObservable(e1.combineLatest(e2, function (x, y) {
      return x + y;
    })).toBe(expected, null, 'too bad, honk');
  });

  it('should work with hot and throw', function () {
    var e1 =    hot('-a-^--b--c--|', { a: 1, b: 2, c: 3});
    var e2 =    hot('---^-#', null, 'bazinga');
    var expected =     '--#';
    expectObservable(e1.combineLatest(e2, function (x, y) {
      return x + y;
    })).toBe(expected, null, 'bazinga');
  });

  it('should work with throw and hot', function () {
    var e1 =    hot('---^-#', null, 'bazinga');
    var e2 =    hot('-a-^--b--c--|', { a: 1, b: 2, c: 3});
    var expected =     '--#';
    expectObservable(e1.combineLatest(e2, function (x, y) {
      return x + y;
    })).toBe(expected, null, 'bazinga');
  });

  it('should work with throw and throw', function () {
    var e1 =    hot('---^----#', null, 'jenga');
    var e2 =    hot('---^-#', null, 'bazinga');
    var expected =     '--#';
    expectObservable(e1.combineLatest(e2, function (x, y) {
      return x + y;
    })).toBe(expected, null, 'bazinga');
  });

  it('should work with error and throw', function () {
    var e1 =    hot('-a-^--b--#', { a: 1, b: 2 }, 'wokka wokka');
    var e2 =    hot('---^-#', null, 'flurp');
    var expected =     '--#';
    expectObservable(e1.combineLatest(e2, function (x, y) {
      return x + y;
    })).toBe(expected, null, 'flurp');
  });

  it('should work with throw and error', function () {
    var e1 =    hot('---^-#', null, 'flurp');
    var e2 =    hot('-a-^--b--#', { a: 1, b: 2 }, 'wokka wokka');
    var expected =     '--#';
    expectObservable(e1.combineLatest(e2, function (x, y) {
      return x + y;
    })).toBe(expected, null, 'flurp');
  });

  it('should work with never and throw', function () {
    var e1 =    hot('---^-----------');
    var e2 =    hot('---^-----#', null, 'wokka wokka');
    var expected =     '------#';
    expectObservable(e1.combineLatest(e2, function (x, y) {
      return x + y;
    })).toBe(expected, null, 'wokka wokka');
  });

  it('should work with throw and never', function () {
    var e1 =    hot('---^----#', null, 'wokka wokka');
    var e2 =    hot('---^-----------');
    var expected =     '-----#';
    expectObservable(e1.combineLatest(e2, function (x, y) {
      return x + y;
    })).toBe(expected, null, 'wokka wokka');
  });

  it('should work with some and throw', function () {
    var e1 =    hot('---^----a---b--|', { a: 1, b: 2 });
    var e2 =    hot('---^--#', null, 'wokka wokka');
    var expected =     '---#';
    expectObservable(e1.combineLatest(e2, function (x, y) {
      return x + y;
    })).toBe(expected, { a: 1, b: 2}, 'wokka wokka');
  });

  it('should work with throw and some', function () {
    var e1 =    hot('---^--#', null, 'wokka wokka');
    var e2 =    hot('---^----a---b--|', { a: 1, b: 2 });
    var expected =     '---#';
    expectObservable(e1.combineLatest(e2, function (x, y) {
      return x + y;
    })).toBe(expected, { a: 1, b: 2}, 'wokka wokka');
  });

  it('should handle throw after complete left', function () {
    var left =  hot('--a--^--b---|', { a: 1, b: 2 });
    var right = hot('-----^--------#', null, 'bad things');
    var expected =       '---------#';
    expectObservable(left.combineLatest(right, function (x, y) {
      return x + y;
    })).toBe(expected, null, 'bad things');
  });

  it('should handle throw after complete right', function () {
    var left =   hot('-----^--------#', null, 'bad things');
    var right =  hot('--a--^--b---|', { a: 1, b: 2 });
    var expected =        '---------#';
    expectObservable(left.combineLatest(right, function (x, y) {
      return x + y;
    })).toBe(expected, null, 'bad things');
  });

  it('should handle interleaved with tail', function () {
    var e1 = hot('-a--^--b---c---|', { a: 'a', b: 'b', c: 'c' });
    var e2 = hot('--d-^----e---f--|', { d: 'd', e: 'e', f: 'f'});
    var expected =   '-----x-y-z--|';
    expectObservable(e1.combineLatest(e2, function (x, y) {
      return x + y;
    })).toBe(expected, { x: 'be', y: 'ce', z: 'cf' });
  });

  it('should handle two consecutive hot observables', function () {
    var e1 = hot('--a--^--b--c--|', { a: 'a', b: 'b', c: 'c' });
    var e2 = hot('-----^----------d--e--f--|', { d: 'd', e: 'e', f: 'f' });
    var expected =    '-----------x--y--z--|';
    expectObservable(e1.combineLatest(e2, function (x, y) {
      return x + y;
    })).toBe(expected, { x: 'cd', y: 'ce', z: 'cf' });
  });

  it('should handle two consecutive hot observables with error left', function () {
    var left =  hot('--a--^--b--c--#', { a: 'a', b: 'b', c: 'c' }, 'jenga');
    var right = hot('-----^----------d--e--f--|', { d: 'd', e: 'e', f: 'f' });
    var expected =       '---------#';
    expectObservable(left.combineLatest(right, function (x, y) {
      return x + y;
    })).toBe(expected, null, 'jenga');
  });

  it('should handle two consecutive hot observables with error right', function () {
    var left =  hot('--a--^--b--c--|', { a: 'a', b: 'b', c: 'c' });
    var right = hot('-----^----------d--e--f--#', { d: 'd', e: 'e', f: 'f' }, 'dun dun dun');
    var expected =       '-----------x--y--z--#';
    expectObservable(left.combineLatest(right, function (x, y) {
      return x + y;
    })).toBe(expected, { x: 'cd', y: 'ce', z: 'cf' }, 'dun dun dun');
  });

  it('should handle selector throwing', function () {
    var e1 = hot('--a--^--b--|', { a: 1, b: 2});
    var e2 = hot('--c--^--d--|', { c: 3, d: 4});
    var expected =    '---#';
    expectObservable(e1.combineLatest(e2, function (x, y) {
      throw 'ha ha ' + x + ', ' + y;
    })).toBe(expected, null, 'ha ha 2, 4');
  });
});
