/* globals describe, it, expect */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('Observable.prototype.partition()', function () {
  it('should partition an observable into two using a predicate', function (done) {
    var expectedPositive = [0, 1, 2];
    var expectedNegative = [-3, -2, -1];
    var completed = false;
    var positiveValues;
    var negativeValues;

    function completer() {
      if (completed) {
        expect(positiveValues).toEqual(expectedPositive);
        expect(negativeValues).toEqual(expectedNegative);
        done();
      } else {
        completed = true;
      }
    }

    var values = [-3, -2, -1, 0, 1, 2];

    var numberStream = Rx.Observable.fromArray(values);

    var streams = numberStream.partition(function (value) {
      return value >= 0;
    });

    var positiveStream = streams[0];
    var negativeStream = streams[1];

    positiveValues = [];
    negativeValues = [];

    positiveStream.subscribe(function (value) {
      positiveValues.push(value);
    }, null, completer);

    negativeStream.subscribe(function (value) {
      negativeValues.push(value);
    }, null, completer);
  });

  it('should pass errors to both returned observables', function (done) {
    var values = [-3, -2, -1, 0, 1, 2];
    var numberStream = Rx.Observable.fromArray(values);
    var errored = false;

    function rejecter() {
      expect(true).toBe(false);
    }

    function completer(error) {
      if (!errored) {
        errored = error;
      } else {
        expect(errored).toBe(error);
        done();
      }
    }

    var streams = numberStream
      .map(function (value) {
        throw 'error';
      })
      .partition(function (value) {
        return value >= 0;
      });

    var positiveStream = streams[0];
    var negativeStream = streams[1];

    positiveStream.subscribe(rejecter, completer, rejecter);
    negativeStream.subscribe(rejecter, completer, rejecter);
  });
});