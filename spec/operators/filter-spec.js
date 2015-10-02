/* globals describe, it, expect, expectObservable, hot */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('Observable.prototype.filter()', function () {
  function oddFilter(x) {
    return (+x) % 2 === 1;
  }

  function isPrime(i) {
    if (+i <= 1) { return false; }
    var max = Math.floor(Math.sqrt(+i));
    for (var j = 2; j <= max; ++j) {
      if (+i % j === 0) { return false; }
    }
    return true;
  }

  it('should filter out even values', function () {
    var source = hot('--0--1--2--3--4--|');
    var expected =   '-----1-----3-----|';

    expectObservable(source.filter(oddFilter)).toBe(expected);
  });

  it('should filter in only prime numbers', function () {
    var source = hot('-1--2--^-3-4-5-6--7-8--9--|');
    var expected =          '--3---5----7-------|';

    expectObservable(source.filter(isPrime)).toBe(expected);
  });

  it('should filter with an always-true predicate', function () {
    var source = hot('-1--2--^-3-4-5-6--7-8--9--|');
    var expected =          '--3-4-5-6--7-8--9--|';
    var predicate = function () { return true; };

    expectObservable(source.filter(predicate)).toBe(expected);
  });

  it('should filter with an always-false predicate', function () {
    var source = hot('-1--2--^-3-4-5-6--7-8--9--|');
    var expected =          '-------------------|';
    var predicate = function () { return false; };

    expectObservable(source.filter(predicate)).toBe(expected);
  });

  it('should filter in only prime numbers, source unsubscribes early', function () {
    var source = hot('-1--2--^-3-4-5-6--7-8--9--|');
    var unsub =             '------------!';
    var expected =          '--3---5----7-';

    expectObservable(source.filter(isPrime), unsub).toBe(expected);
  });

  it('should filter in only prime numbers, source throws', function () {
    var source = hot('-1--2--^-3-4-5-6--7-8--9--#');
    var expected =          '--3---5----7-------#';

    expectObservable(source.filter(isPrime)).toBe(expected);
  });

  it('should filter in only prime numbers, but predicate throws', function () {
    var source = hot('-1--2--^-3-4-5-6--7-8--9--|');
    var expected =          '--3---5-#';

    var invoked = 0;
    var predicate = function (x) {
      invoked++;
      if (invoked === 4) {
        throw 'error';
      }
      return isPrime(x);
    };

    expectObservable(source.filter(predicate)).toBe(expected);
  });

  it('should filter in only prime numbers, predicate with index', function () {
    var source = hot('-1--2--^-3-4-5-6--7-8--9--|');
    var expected =          '--3--------7-------|';

    var predicate = function (x, i) {
      return isPrime((+x) + i * 10);
    };

    expectObservable(source.filter(predicate)).toBe(expected);
  });

  it('should filter in only prime numbers, predicate with index, ' +
    'source unsubscribes early',
  function () {
    var source = hot('-1--2--^-3-4-5-6--7-8--9--|');
    var unsub =             '------------!';
    var expected =          '--3--------7-';

    var predicate = function (x, i) {
      return isPrime((+x) + i * 10);
    };

    expectObservable(source.filter(predicate), unsub).toBe(expected);
  });

  it('should filter in only prime numbers, predicate with index, source throws', function () {
    var source = hot('-1--2--^-3-4-5-6--7-8--9--#');
    var expected =          '--3--------7-------#';

    var predicate = function (x, i) {
      return isPrime((+x) + i * 10);
    };

    expectObservable(source.filter(predicate)).toBe(expected);
  });

  it('should filter in only prime numbers, predicate with index and throws', function () {
    var source = hot('-1--2--^-3-4-5-6--7-8--9--|');
    var expected =          '--3-----#';

    var invoked = 0;
    var predicate = function (x, i) {
      invoked++;
      if (invoked === 4) {
        throw 'error';
      }
      return isPrime((+x) + i * 10);
    };

    expectObservable(source.filter(predicate)).toBe(expected);
  });

  it('should compose with another filter to allow multiples of six', function () {
    var source = hot('-1--2--^-3-4-5-6--7-8--9--|');
    var expected =          '--------6----------|';

    expectObservable(
      source
        .filter(function (x) { return x % 2 === 0; })
        .filter(function (x) { return x % 3 === 0; })
    ).toBe(expected);
  });

  it('should be able to accept and use a thisArg', function () {
    var source = hot('-1--2--^-3-4-5-6--7-8--9--|');
    var expected =          '--------6----------|';

    function Filterer() {
      this.filter1 = function (x) { return x % 2 === 0; };
      this.filter2 = function (x) { return x % 3 === 0; };
    }

    var filterer = new Filterer();

    expectObservable(
      source
        .filter(function (x) { return this.filter1(x); }, filterer)
        .filter(function (x) { return this.filter2(x); }, filterer)
        .filter(function (x) { return this.filter1(x); }, filterer)
    ).toBe(expected);
  });

  it('should be able to use filter and map composed', function () {
    var source = hot('-1--2--^-3-4-5-6--7-8--9--|');
    var expected =          '----a---b----c-----|';
    var values = { a: 16, b: 36, c: 64 };

    expectObservable(
      source
        .filter(function (x) { return x % 2 === 0; })
        .map(function (x) { return x * x; })
    ).toBe(expected, values);
  });

  it('should propagate errors from the source', function() {
    var source = hot('--0--1--2--3--4--#');
    var expected =   '-----1-----3-----#';

    expectObservable(source.filter(oddFilter)).toBe(expected);
  });

  it('should support Observable.empty', function() {
    var source = Observable.empty();
    var expected = "|";

    expectObservable(source.filter(oddFilter)).toBe(expected);
  });

  it('should support Observable.never', function() {
    var source = Observable.never();
    var expected = "-";

    expectObservable(source.filter(oddFilter)).toBe(expected);
  });

  it('should support Observable.throw', function() {
    var source = Observable.throw(new Error('oops'));
    var expected = '#';

    expectObservable(source.filter(oddFilter)).toBe(expected, undefined, new Error('oops'));
  });

  it('should send errors down the error path', function (done) {
    Observable.of(42).filter(function (x) {
      throw 'bad';
    })
      .subscribe(function (x) {
        expect(true).toBe(false);
      }, function (err) {
        expect(err).toBe('bad');
        done();
      }, function () {
        expect(true).toBe(false);
      });
  });
});
