/* globals describe, it, expect, expectObservable, hot */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('toArray', function () {
  it('should be never when source is never', function () {
    var e1 = Observable.never();
    var expected = '-';

    expectObservable(e1.toArray()).toBe(expected);
  });

  it('should be never when source is empty', function () {
    var e1 = Observable.empty();
    var expected = '(w|)';

    expectObservable(e1.toArray()).toBe(expected, { w: [] });
  });

  it('should be never when source doesn\'t complete', function () {
    var e1 = hot('--x--^--y--');
    var expected = '-';

    expectObservable(e1.toArray()).toBe(expected);
  });

  it('should reduce observable without values into an array of length zero', function () {
    var e1 = hot('-x-^---|');
    var expected =  '----(w|)';

    expectObservable(e1.toArray()).toBe(expected, { w: [] });
  });

  it('should reduce the a single value of an observable into an array', function () {
    var e1 = hot('-x-^--y--|');
    var expected =  '------(w|)';

    expectObservable(e1.toArray()).toBe(expected, { w: ['y'] });
  });

  it('should reduce the values of an observable into an array', function () {
    var e1 = hot('-x-^--y--z--|');
    var expected =  '---------(w|)';

    expectObservable(e1.toArray()).toBe(expected, { w: ['y', 'z'] });
  });

  it('should work with error', function () {
    var e1 = hot('-x-^--y--z--#', { x: 1, y: 2, z: 3 }, 'too bad');
    var expected =  '---------#';

    expectObservable(e1.toArray()).toBe(expected, null, 'too bad');
  });

  it('should work with throw', function () {
    var e1 = Observable.throw(new Error('too bad'));
    var expected = '#';

    expectObservable(e1.toArray()).toBe(expected, null, new Error('too bad'));
  });
});
