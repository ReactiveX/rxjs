/* globals describe, it, expect, expectObservable, hot, cold */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('Observable.prototype.mergeAll()', function () {
  it('should merge all observables in an observable', function () {
    var e1 = Observable.fromArray([
      Observable.of('a'),
      Observable.of('b'),
      Observable.of('c')
    ]);
    var expected = '(abc|)';

    expectObservable(e1.mergeAll()).toBe(expected);
  });

  it('should throw if any child observable throws', function () {
    var e1 = Observable.fromArray([
      Observable.of('a'),
      Observable.throw('error'),
      Observable.of('c')
    ]);
    var expected = '(a#)';

    expectObservable(e1.mergeAll()).toBe(expected);
  });

  it('should handle merging a hot observable of observables', function () {
    var x = cold(     'a---b---c---|   ');
    var xsubs =     '  ^           !   ';
    var y = cold(        'd---e---f---|');
    var ysubs =     '     ^           !';
    var e1 =    hot('--x--y--|         ', { x: x, y: y });
    var e1subs =    '^                !';
    var expected =  '--a--db--ec--f---|';

    expectObservable(e1.mergeAll()).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle merging a hot observable of observables, outer unsubscribed early', function () {
    var x = cold(     'a---b---c---|   ');
    var xsubs =     '  ^         !     ';
    var y = cold(        'd---e---f---|');
    var ysubs =     '     ^      !     ';
    var e1 =    hot('--x--y--|         ', { x: x, y: y });
    var e1subs =    '^           !     ';
    var unsub =     '            !     ';
    var expected =  '--a--db--ec--     ';

    expectObservable(e1.mergeAll(), unsub).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should merge parallel emissions', function () {
    var x = cold(     '----a----b----c---|');
    var xsubs =     '  ^                 !';
    var y = cold(        '-d----e----f---|');
    var ysubs =     '     ^              !';
    var e1 =    hot('--x--y--|            ', { x: x, y: y });
    var e1subs =    '^                   !';
    var expected =  '------(ad)-(be)-(cf)|';

    expectObservable(e1.mergeAll()).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should merge empty and empty', function () {
    var x = cold(     '|');
    var xsubs =     '  (^!)   ';
    var y = cold(        '|');
    var ysubs =     '     (^!)';
    var e1 =    hot('--x--y--|', { x: x, y: y });
    var e1subs =    '^       !';
    var expected =  '--------|';

    expectObservable(e1.mergeAll()).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should merge three empties', function () {
    var x = cold(     '|');
    var xsubs =     '  (^!)     ';
    var y = cold(        '|');
    var ysubs =     '     (^!)  ';
    var z = cold(          '|');
    var zsubs =     '       (^!)';
    var e1 =    hot('--x--y-z---|', { x: x, y: y, z: z });
    var e1subs =    '^          !';
    var expected =  '-----------|';

    expectObservable(e1.mergeAll()).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(z.subscriptions).toBe(zsubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should merge never and empty', function () {
    var x = cold(     '-');
    var xsubs =     '  ^';
    var y = cold(        '|');
    var ysubs =     '     (^!)';
    var e1 =    hot('--x--y--|', { x: x, y: y });
    var e1subs =    '^        ';
    var expected =  '---------';

    expectObservable(e1.mergeAll()).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should merge never and never', function () {
    var x = cold(     '-');
    var xsubs =     '  ^';
    var y = cold(        '-');
    var ysubs =     '     ^';
    var e1 =    hot('--x--y--|', { x: x, y: y });
    var e1subs =    '^        ';
    var expected =  '---------';

    expectObservable(e1.mergeAll()).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should merge empty and throw', function () {
    var x = cold(     '|');
    var xsubs =     '  (^!)   ';
    var y = cold(        '#');
    var ysubs =     '     (^!)';
    var e1 =    hot('--x--y--|', { x: x, y: y });
    var e1subs =    '^    !   ';
    var expected =  '-----#   ';

    expectObservable(e1.mergeAll()).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should merge never and throw', function () {
    var x = cold(     '-');
    var xsubs =     '  ^  !';
    var y = cold(        '#');
    var ysubs =     '     (^!)';
    var e1 =    hot('--x--y--|', { x: x, y: y });
    var e1subs =    '^    !   ';
    var expected =  '-----#   ';

    expectObservable(e1.mergeAll()).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should merge empty and eventual error', function () {
    var x = cold(     '|');
    var xsubs =     '  (^!)';
    var y = cold(        '------#');
    var ysubs =     '     ^     !';
    var e1 =    hot('--x--y--|', { x: x, y: y });
    var e1subs =    '^          !';
    var expected =  '-----------#';

    expectObservable(e1.mergeAll()).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should merge never and eventual error', function () {
    var x = cold(     '-');
    var xsubs =     '  ^        !';
    var y = cold(        '------#');
    var ysubs =     '     ^     !';
    var e1 =    hot('--x--y--|', { x: x, y: y });
    var e1subs =    '^          !';
    var expected =  '-----------#';

    expectObservable(e1.mergeAll()).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should take an empty source and return empty too', function () {
    var e1 = cold( '|');
    var e1subs =   '(^!)';
    var expected = '|';

    expectObservable(e1.mergeAll()).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should take a never source and return never too', function () {
    var e1 = cold( '-');
    var e1subs =   '^';
    var expected = '-';

    expectObservable(e1.mergeAll()).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should take a throw source and return throw too', function () {
    var e1 = cold( '#');
    var e1subs =   '(^!)';
    var expected = '#';

    expectObservable(e1.mergeAll()).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle merging a hot observable of non-overlapped observables', function () {
    var x = cold(    'a-b---------|                 ');
    var xsubs =    '  ^           !                 ';
    var y = cold(              'c-d-e-f-|           ');
    var ysubs =    '            ^       !           ';
    var z = cold(                       'g-h-i-j-k-|');
    var zsubs =    '                     ^         !';
    var e1 =   hot('--x---------y--------z--------| ', { x: x, y: y, z: z });
    var e1subs =   '^                              !';
    var expected = '--a-b-------c-d-e-f--g-h-i-j-k-|';

    expectObservable(e1.mergeAll()).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(z.subscriptions).toBe(zsubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should raise error if inner observable raises error', function () {
    var x = cold(    'a-b---------|                 ');
    var xsubs =    '  ^           !                 ';
    var y = cold(              'c-d-e-f-#           ');
    var ysubs =    '            ^       !           ';
    var z = cold(                       'g-h-i-j-k-|');
    var zsubs = [];
    var e1 =   hot('--x---------y--------z--------| ', { x: x, y: y, z: z });
    var e1subs =   '^                   !           ';
    var expected = '--a-b-------c-d-e-f-#           ';

    expectObservable(e1.mergeAll()).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(z.subscriptions).toBe(zsubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should raise error if outer observable raises error', function () {
    var y = cold(    'a-b---------|                ');
    var ysubs =    '  ^           !                ';
    var z = cold(              'c-d-e-f-|          ');
    var zsubs =    '            ^   !              ';
    var e1 =   hot('--y---------z---#-------------|', { y: y, z: z });
    var e1subs =   '^               !              ';
    var expected = '--a-b-------c-d-#              ';

    expectObservable(e1.mergeAll()).toBe(expected);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(z.subscriptions).toBe(zsubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should merge all promises in an observable', function (done) {
    var e1 = Rx.Observable.fromArray([
      new Promise(function (res) { res('a'); }),
      new Promise(function (res) { res('b'); }),
      new Promise(function (res) { res('c'); }),
      new Promise(function (res) { res('d'); }),
    ]);
    var expected = ['a', 'b', 'c', 'd'];

    var res = [];
    e1.mergeAll().subscribe(
      function (x) { res.push(x); },
      function (err) { throw 'should not be called'; },
      function () {
        expect(res).toEqual(expected);
        done();
      });
  });

  it('should raise error when promise rejects', function (done) {
    var error = 'error';
    var e1 = Rx.Observable.fromArray([
      new Promise(function (res) { res('a'); }),
      new Promise(function (res, rej) { rej(error); }),
      new Promise(function (res) { res('c'); }),
      new Promise(function (res) { res('d'); }),
    ]);

    var res = [];
    e1.mergeAll().subscribe(
      function (x) { res.push(x); },
      function (err) {
        expect(res.length).toEqual(1);
        expect(err).toBe(error);
        done();
      },
      function () { throw 'should not be called'; });
  });
});