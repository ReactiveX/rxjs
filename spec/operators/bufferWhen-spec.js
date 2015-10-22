/* globals describe, it, expect, hot, cold, expectObservable, expectSubscriptions */
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

  it('should emit buffers using varying cold closings', function () {
    var e1 = hot('--a--^---b---c---d---e---f---g---h------|      ');
    var subs =        '^                                  !      ';
    var closings = [
      cold(           '---------------s--|                       '),
      cold(                          '----------(s|)             '),
      cold(                                    '-------------(s|)')];
    var expected =    '---------------x---------y---------(z|)   ';
    var values = {
      x: ['b','c','d'],
      y: ['e','f','g'],
      z: ['h']
    };

    var i = 0;
    var result = e1.bufferWhen(function () { return closings[i++]; });

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should emit buffers using varying hot closings', function () {
    var e1 = hot('--a--^---b---c---d---e---f---g---h------|   ');
    var subs =        '^                                  !   ';
    var closings = [
      {obs: hot(  '-1--^--------------s---|                   '), // eslint-disable-line key-spacing
       sub:           '^              !                       '}, // eslint-disable-line key-spacing
      {obs: hot(  '--1-^----3--------4----------s-|           '), // eslint-disable-line key-spacing
       sub:           '               ^         !             '}, // eslint-disable-line key-spacing
      {obs: hot(  '1-2-^------3----4-------5--6-----------s--|'), // eslint-disable-line key-spacing
       sub:           '                         ^         !   '}]; // eslint-disable-line key-spacing
    var expected =    '---------------x---------y---------(z|)';
    var values = {
      x: ['b','c','d'],
      y: ['e','f','g'],
      z: ['h']
    };

    var i = 0;
    var result = e1.bufferWhen(function () { return closings[i++].obs; });

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(subs);
    for (var j = 0; j < closings.length; j++) {
      expectSubscriptions(closings[j].obs.subscriptions).toBe(closings[j].sub);
    }
  });

  it('should emit buffers using varying empty delayed closings', function () {
    var e1 = hot('--a--^---b---c---d---e---f---g---h------|      ');
    var subs =        '^                                  !      ';
    var closings = [
      cold(           '---------------|                       '),
      cold(                          '----------|             '),
      cold(                                    '-------------|')];
    var expected =    '---------------x---------y---------(z|)   ';
    var values = {
      x: ['b','c','d'],
      y: ['e','f','g'],
      z: ['h']
    };

    var i = 0;
    var result = e1.bufferWhen(function () { return closings[i++]; });

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should emit buffers using varying cold closings, outer unsubscribed early', function () {
    var e1 = hot('--a--^---b---c---d---e---f---g---h------|      ');
    var unsub =       '                  !                       ';
    var subs =        '^                 !                       ';
    var closings = [
      cold(           '---------------(s|)                       '),
      cold(                          '----------(s|)             '),
      cold(                                    '-------------(s|)')];
    var expected =    '---------------x---                       ';
    var values = {
      x: ['b','c','d']
    };

    var i = 0;
    var result = e1.bufferWhen(function () { return closings[i++]; });

    expectObservable(result, unsub).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should propagate error thrown from closingSelector', function () {
    var e1 = hot('--a--^---b---c---d---e---f---g---h------|      ');
    var subs =        '^              !                          ';
    var closings = [
      cold(           '---------------s--|                       '),
      cold(                          '----------(s|)             '),
      cold(                                    '-------------(s|)')];
    var expected =    '---------------(x#)                       ';
    var values = { x: ['b','c','d'] };

    var i = 0;
    var result = e1.bufferWhen(function () {
      if (i === 1) {
        throw 'error';
      }
      return closings[i++];
    });

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should propagate error emitted from a closing', function () {
    var e1 = hot('--a--^---b---c---d---e---f---g---h------|');
    var subs =        '^              !                    ';
    var closings = [
      cold(           '---------------s--|                 '),
      cold(                          '#                    ')];
    var expected =    '---------------(x#)                 ';
    var values = { x: ['b','c','d'] };

    var i = 0;
    var result = e1.bufferWhen(function () { return closings[i++]; });

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should propagate error emitted late from a closing', function () {
    var e1 = hot('--a--^---b---c---d---e---f---g---h------|');
    var subs =        '^                    !              ';
    var closings = [
      cold(           '---------------s--|                 '),
      cold(                          '------#              ')];
    var expected =    '---------------x-----#              ';
    var values = { x: ['b','c','d'] };

    var i = 0;
    var result = e1.bufferWhen(function () { return closings[i++]; });

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(subs);
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
    var e1 =   hot('-');
    var e2 = cold( '--------(s|)                                 ');
    var unsub =    '                                            !';
    var subs =     '^                                           !';
    var expected = '--------x-------x-------x-------x-------x----';
    var values = {
      x: []
    };

    var source = e1.bufferWhen(function () { return e2; });

    expectObservable(source, unsub).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should handle an inner never', function () {
    var e1 = hot('--a--^---b---c---d---e---f---g---h------|');
    var e2 = cold('-');
    var expected =    '-----------------------------------(x|)';
    var values = {
      x: ['b','c','d','e','f','g','h']
    };

    expectObservable(e1.bufferWhen(function () { return e2; })).toBe(expected, values);
  });

  // bufferWhen is not supposed to handle a factory that returns always empty
  // closing Observables, because doing such would constantly recreate a new
  // buffer in a synchronous infinite loop until the stack overflows. This also
  // happens with buffer in RxJS 4.
  it('should NOT handle hot inner empty', function (done) {
    var source = Observable.of(1, 2, 3, 4, 5, 6, 7, 8, 9);
    var closing = Observable.empty();
    var TOO_MANY_INVOCATIONS = 30;

    var invoked = 0;
    source
      .bufferWhen(function () { return closing; })
      .subscribe(function (val) {
        expect(Array.isArray(val)).toBe(true);
        expect(val.length).toBe(0);
        invoked++;
        if (invoked > TOO_MANY_INVOCATIONS) {
          done();
        }
      }, null, null);
  });

  it('should handle inner throw', function () {
    var e1 = hot('--a--^---b---c---d---e---f---g---h------|');
    var subs =        '(^!)';
    var e2 = Observable.throw('bad!');
    var expected =    '#';
    var values = {
      x: ['b','c','d','e','f','g','h']
    };

    expectObservable(e1.bufferWhen(function () { return e2; })).toBe(expected, values, 'bad!');
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should handle disposing of source', function () {
    var e1 =         hot('--a--^---b---c---d---e---f---g---h------|');
    var subs =                '^                   !';
    var unsub =               '                    !';
    var e2 = cold(            '---------------(s|)');
    //                                        ---------------(s|)
    var expected =            '---------------x-----';
    var values = {
      x: ['b','c','d'],
      y: ['e','f','g','h'],
      z: []
    };

    var source = e1.bufferWhen(function () { return e2; });

    expectObservable(source, unsub).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });
});