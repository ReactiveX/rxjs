/* globals describe, it, expect, expectObservable, hot */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('Observable.prototype.sample', function () {
  it('should get samples when the notifier emits', function () {
    var e1 =   hot('----a-^--b----c----d----e----f----|');
    var e2 =   hot(      '-----x----------x----------x----------|');
    var expected =       '-----b----------d----------f|';

    expectObservable(e1.sample(e2)).toBe(expected);
  });

  it('should sample nothing if source has not nexted yet', function () {
    var e1 =   hot('----a-^-------b----|');
    var e2 =   hot(      '-----x-------|');
    var expected =       '-------------|';

    expectObservable(e1.sample(e2)).toBe(expected);
  });

  it('should not complete when the notifier completes, nor should it emit', function () {
    var e1 =   hot('----a----b----c----d----e----f----');
    var e2 =   hot('------x-|');
    var expected = '------a-';

    expectObservable(e1.sample(e2)).toBe(expected);
  });

  it('should raise error if source raises error', function () {
    var e1 =   hot('----a-^--b----c----d----#');
    var e2 =   hot(      '-----x----------x----------x----------|');
    var expected =       '-----b----------d-#';

    expectObservable(e1.sample(e2)).toBe(expected);
  });

  it('should completes if source does not emits', function () {
    var e1 = Observable.empty();
    var e2 =   hot('------x-------|');
    var expected = '|';

    expectObservable(e1.sample(e2)).toBe(expected);
  });

  it('should raise error if source throws immediately', function () {
    var e1 =   Observable.throw('error');
    var e2 =   hot('------x-------|');
    var expected = '#';

    expectObservable(e1.sample(e2)).toBe(expected);
  });

  it('should not completes if source does not complete', function () {
    var e1 =   Observable.never();
    var e2 =   hot('------x-------|');
    var expected = '-';

    expectObservable(e1.sample(e2)).toBe(expected);
  });

  it('should sample only until source completes', function () {
    var e1 =   hot('----a----b----c----d-|');
    var e2 =   hot('-----------x----------x------------|');
    var expected = '-----------b---------|';

    expectObservable(e1.sample(e2)).toBe(expected);
  });

  it('should complete sampling if sample observable completes', function () {
    var e1 =   hot('----a----b----c----d-|');
    var e2 =   hot('|');
    var expected = '---------------------|';

    expectObservable(e1.sample(e2)).toBe(expected);
  });
});