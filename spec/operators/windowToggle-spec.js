/* globals describe, it, expect */
var Rx = require('../../dist/cjs/Rx.KitchenSink');
var Observable = Rx.Observable;

describe('Observable.prototype.windowToggle', function () {
  it('should emit windows that are opened by an observable from the first argument ' +
    'and closed by an observable returned by the function in the second argument',
  function () {
    var e1 = hot('--1--2--^--a--b--c--d--e--f--g--h--|');
    var e2 = cold(       '--------x-------x-------x--|');
    var e3 = cold(               '----------(x|)');
    //                                    ----------(x|)
    //                                            ----------(x|)
    var expected =       '--------x-------y-------z--|';
    var x =              '---------c--d--e--(f|)';
    var y =              '------------------f--g--h-|';
    var z =              '---------------------------|';

    var values = {
      x: Rx.TestScheduler.parseMarbles(x),
      y: Rx.TestScheduler.parseMarbles(y),
      z: Rx.TestScheduler.parseMarbles(z)
    };

    var source = e1.windowToggle(e2, function (value) {
      expect(value).toBe('x');
      return e3;
    }).map(function (obs) {
      var arr = [];

      obs.materialize().map(function (notification) {
        return { frame: rxTestScheduler.frame, notification: notification };
      }).subscribe(function (value) { arr.push(value); });

      return arr;
    });

    expectObservable(source).toBe(expected, values);
  });
});