/* globals describe, it, expect, expectObservable, hot */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('Observable.prototype.partition()', function () {
  function expectObservableArray(result, expected) {
    for (var idx = 0; idx < result.length; idx++ ) {
      expectObservable(result[idx]).toBe(expected[idx]);
    }
  }

  it('should partition an observable into two using a predicate', function () {
    function predicate(x) {
      return x === 'a';
    }
    var e1 =    hot('--a-b---a------d--a---c--|');
    var expected = ['--a-----a---------a------|',
                    '----b----------d------c--|'];

    expectObservableArray(e1.partition(predicate), expected);
  });

  it('should pass errors to both returned observables', function () {
    function predicate(x) {
      return x === 'a';
    }
    var e1 =    hot('--a-b---#');
    var expected = ['--a-----#',
                    '----b---#'];

    expectObservableArray(e1.partition(predicate), expected);
  });

  it('should pass errors to both returned observables if source throws', function () {
    function predicate(x) {
      return x === 'a';
    }
    var error = 'error';
    var e1 = Observable.throw(error);
    var expected = ['#',
                    '#'];

    expectObservableArray(e1.partition(predicate), expected);
  });

  it('should pass errors to both returned observables if predicate throws', function () {
    var index = 0;
    var error = 'error';
    function predicate(x) {
      var match = x === 'a';
      if (match && index++ > 1) {
        throw error;
      }
      return match;
    }
    var e1 =    hot('--a-b--a--|');
    var expected = ['--a----#',
                    '----b--#'];

    expectObservableArray(e1.partition(predicate), expected);
  });

  it('should partition empty observable if source does not emits', function () {
    function predicate(x) {
      return x === 'x';
    }
    var e1 =    hot('----|');
    var expected = ['----|',
                    '----|'];

    expectObservableArray(e1.partition(predicate), expected);
  });

  it('should partition empty observable if source is empty', function () {
    function predicate(x) {
      return x === 'x';
    }
    var e1 = Observable.empty();
    var expected = ['|',
                    '|'];

    expectObservableArray(e1.partition(predicate), expected);
  });

  it('should partition if source emits single elements', function () {
    function predicate(x) {
      return x === 'a';
    }
    var e1 =    hot('--a--|');
    var expected = ['--a--|',
                    '-----|'];

    expectObservableArray(e1.partition(predicate), expected);
  });

  it('should partition if predicate matches all of source elements', function () {
    function predicate(x) {
      return x === 'a';
    }
    var e1 =    hot('--a--a--a--a--a--a--a--|');
    var expected = ['--a--a--a--a--a--a--a--|',
                    '-----------------------|'];

    expectObservableArray(e1.partition(predicate), expected);
  });

  it('should partition if predicate does not match all of source elements', function () {
    function predicate(x) {
      return x === 'a';
    }
    var e1 =    hot('--b--b--b--b--b--b--b--|');
    var expected = ['-----------------------|',
                    '--b--b--b--b--b--b--b--|'];

    expectObservableArray(e1.partition(predicate), expected);
  });

  it('should partition to infinite observable if source does not completes', function () {
    function predicate(x) {
      return x === 'a';
    }
    var e1 =    hot('--a-b---a------d----');
    var expected = ['--a-----a-',
                    '----b----------d-'];

    expectObservableArray(e1.partition(predicate), expected);
  });

  it('should partition to infinite observable if source never completes', function () {
    function predicate(x) {
      return x === 'a';
    }
    var e1 = Observable.never();
    var expected = ['-',
                    '-'];

    expectObservableArray(e1.partition(predicate), expected);
  });

  it('should partition into two observable with early unsubscription', function () {
    function predicate(x) {
      return x === 'a';
    }
    var e1 =    hot('--a-b---a------d-|');
    var unsub =     '-------!';
    var expected = ['--a-',
                    '----b-'];
    var result = e1.partition(predicate);

    for (var idx = 0; idx < result.length; idx++ ) {
      expectObservable(result[idx], unsub).toBe(expected[idx]);
    }
  });

  it('should throw without predicate', function () {
    var e1 = hot('--a-b---a------d----');
    expect(e1.partition).toThrow();
  });
});