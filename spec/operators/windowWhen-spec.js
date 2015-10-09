/* globals describe, it, expect */
var Rx = require('../../dist/cjs/Rx.KitchenSink');
var Observable = Rx.Observable;

describe('Observable.prototype.windowWhen', function () {
  it('should emit windows that close and reopen', function () {
    var e1 = hot('--a--^--b--c--d--e--f--g--h--i--|');
    var e2 = cold(    '-----------(x|)');
    //                            -----------(x|)
    // a              '---b--c--d-|');
    var a =           '---b--c--d-|';
    // b                         '-e--f--g--h|')
    var b =           '------------e--f--g--h|';
    // c                                    '--i--|'
    var c =           '------------------------i--|';
    var expected =    'a----------b----------c----|';

    var values = {
      a: Rx.TestScheduler.parseMarbles(a),
      b: Rx.TestScheduler.parseMarbles(b),
      c: Rx.TestScheduler.parseMarbles(c)
    };

    var source = e1.windowWhen(function () { return e2; })
      .map(function (x) {
        var arr = [];

        x.materialize().map(function (notification) {
          return { frame: rxTestScheduler.frame, notification: notification };
        }).subscribe(function (value) { arr.push(value); });

        return arr;
      });

    expectObservable(source).toBe(expected, values);
  });
});