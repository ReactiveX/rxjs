/* globals describe, it, expect, hot, cold, expectObservable */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('Observable.prototype.bufferWhen', function () {
  it('should emit buffers that close and reopen', function () {
    var e1 = hot('--a--^---b---c---d---e---f---g---h------|');
    var e2 = cold(    '---------------(s|)');
    //                                ---------------(s|)
    var expected =    '---------------x--------------y----(z|)';
    var values = {
      x: ['b','c','d'],
      y: ['e','f','g','h'],
      z: []
    };

    expectObservable(e1.bufferWhen(function () { return e2; })).toBe(expected, values);
  });

  it('should handle errors', function () {
    var e1 = hot('--a--^---b---c---d---e---f---#');
    var e2 = cold(    '---------------(s|)');
    //                                ---------------(s|)
    var expected =    '---------------x--------#';
    var values = {
      x: ['b','c','d']
    };

    expectObservable(e1.bufferWhen(function () { return e2; })).toBe(expected, values);
  });

  it('should handle empty', function () {
    var e1 = Observable.empty();
    var e2 = cold('--------(s|)');
    var expected = '(x|)';
    var values = {
      x: []
    };

    expectObservable(e1.bufferWhen(function () { return e2; })).toBe(expected, values);
  });

  it('should handle throw', function () {
    var e1 = Observable.throw('blah?');
    var e2 = cold('--------(s|)');
    var expected = '#';
    var values = {
      x: []
    };

    expectObservable(e1.bufferWhen(function () { return e2; })).toBe(expected, values, 'blah?');
  });

  it('should handle never', function () {
    var e1 = Observable.never();
    var e2 = cold( '--------(s|)');
    var expected = '--------x-------x-------x-------x-------x-------x-------x-------x-------x----';
    var values = {
      x: []
    };

    expectObservable(e1.bufferWhen(function () { return e2; })).toBe(expected, values);
  });

  it('should handle an inner never', function () {
    var e1 = hot('--a--^---b---c---d---e---f---g---h------|');
    var e2 = Observable.never();
    var expected =    '-----------------------------------(x|)';
    var values = {
      x: ['b','c','d','e','f','g','h']
    };

    expectObservable(e1.bufferWhen(function () { return e2; })).toBe(expected, values);
  });

  it('should handle inner empty', function () {
    var e1 = hot('--a--^---b---c---d---e---f---g---h------|');
    var e2 = Observable.empty();
    var expected =    '-----------------------------------(x|)';
    var values = {
      x: ['b','c','d','e','f','g','h']
    };

    expectObservable(e1.bufferWhen(function () { return e2; })).toBe(expected, values);
  });

  it('should handle inner throw', function () {
    var e1 = hot('--a--^---b---c---d---e---f---g---h------|');
    var e2 = Observable.throw('bad!');
    var expected =    '#';
    var values = {
      x: ['b','c','d','e','f','g','h']
    };

    expectObservable(e1.bufferWhen(function () { return e2; })).toBe(expected, values, 'bad!');
  });

  it('should handle disposing of source', function () {
    var e1 =         hot('--a--^---b---c---d---e---f---g---h------|');
    var e1disp =         '-----^--------------------!';
    var e2 = cold(            '---------------(s|)');
    //                                        ---------------(s|)
    var expected =            '---------------x-----';
    // var sourceSubs =     '-----^-------------------!';
    var values = {
      x: ['b','c','d'],
      y: ['e','f','g','h'],
      z: []
    };

    var source = e1.bufferWhen(function () { return e2; });
    expectObservable(source, e1disp).toBe(expected, values);
    // expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });
});