/* globals describe, it, expect */
var Rx = require('../../dist/cjs/Rx.KitchenSink');
var Observable = Rx.Observable;

describe('Observable.prototype.windowToggle', function () {
  it('should emit windows that are opened by an observable from the first argument ' +
    'and closed by an observable returned by the function in the second argument',
  function () {
    var e1 = hot('--1--2--^--a--b--c--d--e--f--g--h--|');
    var subs =           '^                          !';
    var e2 = cold(       '--------x-------x-------x--|');
    var e3 = cold(               '----------(x|)      ');
    //                                    ----------(x|)
    //                                            ----------(x|)
    var expected =       '--------x-------y-------z--|';
    var x = cold(                '-c--d--e--(f|)      ');
    var y = cold(                        '--f--g--h-| ');
    var z = cold(                                '---|');
    var values = { x: x, y: y, z: z };

    var source = e1.windowToggle(e2, function (value) {
      expect(value).toBe('x');
      return e3;
    });

    expectObservable(source).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should emit windows using varying cold closings', function () {
    var e1 = hot('--a--^---b---c---d---e---f---g---h------|      ');
    var e2 =     cold('--x-----------y--------z---|              ');
    var subs =        '^                                  !      ';
    var closings = [
      cold(             '---------------s--|                     '),
      cold(                         '----(s|)                    '),
      cold(                                  '---------------(s|)')];
    var expected =    '--x-----------y--------z-----------|      ';
    var x = cold(       '--b---c---d---e|                        ');
    var y = cold(                   '--e-|                       ');
    var z = cold(                            '-g---h------|      ');
    var values = { x: x, y: y, z: z };

    var i = 0;
    var result = e1.windowToggle(e2, function () { return closings[i++]; });

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should emit windows using varying hot closings', function () {
    var e1 = hot('--a--^---b---c---d---e---f---g---h------|   ');
    var e2 =     cold('--x-----------y--------z---|           ');
    var subs =        '^                                  !   ';
    var closings = [
      {obs: hot(  '-1--^----------------s-|                   '), // eslint-disable-line key-spacing
       sub:           '  ^              !                     '}, // eslint-disable-line key-spacing
      {obs: hot(      '-----3----4-------(s|)                 '), // eslint-disable-line key-spacing
       sub:           '              ^   !                    '}, // eslint-disable-line key-spacing
      {obs: hot(      '-------3----4-------5----------------s|'), // eslint-disable-line key-spacing
       sub:           '                       ^           !   '}]; // eslint-disable-line key-spacing
    var expected =    '--x-----------y--------z-----------|   ';
    var x = cold(       '--b---c---d---e|                     ');
    var y = cold(                   '--e-|                    ');
    var z = cold(                            '-g---h------|   ');
    var values = { x: x, y: y, z: z };

    var i = 0;
    var result = e1.windowToggle(e2, function () { return closings[i++].obs; });

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(subs);
    for (var j = 0; j < closings.length; j++) {
      expectSubscriptions(closings[j].obs.subscriptions).toBe(closings[j].sub);
    }
  });

  it('should emit windows using varying empty delayed closings', function () {
    var e1 = hot('--a--^---b---c---d---e---f---g---h------|   ');
    var e2 =     cold('--x-----------y--------z---|           ');
    var subs =        '^                                  !   ';
    var closings = [
      cold(             '---------------|                     '),
      cold(                         '----|                    '),
      cold(                                  '---------------|')];
    var expected =    '--x-----------y--------z-----------|   ';
    var x = cold(       '--b---c---d---e|                     ');
    var y = cold(                   '--e-|                    ');
    var z = cold(                            '-g---h------|   ');
    var values = { x: x, y: y, z: z };

    var i = 0;
    var result = e1.windowToggle(e2, function () { return closings[i++]; });

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should emit windows using varying cold closings, outer unsubscribed early', function () {
    var e1 = hot('--a--^---b---c---d---e---f---g---h------|      ');
    var unsub =       '                  !                       ';
    var subs =        '^                 !                       ';
    var e2 =     cold('--x-----------y--------z---|              ');
    var closings = [
      cold(             '---------------s--|                     '),
      cold(                         '----(s|)                    '),
      cold(                                  '---------------(s|)')];
    var expected =    '--x-----------y----                    ';
    var x = cold(       '--b---c---d---e|                     ');
    var y = cold(                   '--e-|                    ');
    var values = { x: x, y: y };

    var i = 0;
    var result = e1.windowToggle(e2, function () { return closings[i++]; });

    expectObservable(result, unsub).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should propagate error thrown from closingSelector', function () {
    var e1 = hot('--a--^---b---c---d---e---f---g---h------|      ');
    var e2 =     cold('--x-----------y--------z---|              ');
    var subs =        '^             !                           ';
    var closings = [
      cold(             '---------------s--|                     '),
      cold(                         '----(s|)                    '),
      cold(                                  '---------------(s|)')];
    var expected =    '--x-----------#----                       ';
    var x = cold(       '--b---c---d-#                           ');
    var values = { x: x };

    var i = 0;
    var result = e1.windowToggle(e2, function () {
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
    var e2 =     cold('--x-----------y--------z---|        ');
    var subs =        '^             !                     ';
    var closings = [
      cold(             '---------------s--|               '),
      cold(                         '#                     ')];
    var expected =    '--x-----------(y#)                  ';
    var x = cold(       '--b---c---d-#                     ');
    var y = cold(                   '#                     ');
    var values = { x: x, y: y };

    var i = 0;
    var result = e1.windowToggle(e2, function () { return closings[i++]; });

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should propagate error emitted late from a closing', function () {
    var e1 = hot('--a--^---b---c---d---e---f---g---h------|');
    var e2 =     cold('--x-----------y--------z---|        ');
    var subs =        '^                  !                ';
    var closings = [
      cold(             '---------------s--|               '),
      cold(                         '-----#                ')];
    var expected =    '--x-----------y----#                ';
    var x = cold(       '--b---c---d---e|                  ');
    var y = cold(                   '--e--#                ');
    var values = { x: x, y: y };

    var i = 0;
    var result = e1.windowToggle(e2, function () { return closings[i++]; });

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should handle errors', function () {
    var e1 = hot('--a--^---b---c---d---e--#f---g---h------|');
    var e2 =     cold('--x-----------y--------z---|        ');
    var subs =        '^                  !                ';
    var closings = [
      cold(             '---------------s--|               '),
      cold(                         '-------s|             ')];
    var expected =    '--x-----------y----#                ';
    var x = cold(       '--b---c---d---e|                  ');
    var y = cold(                   '--e--#                ');
    var values = { x: x, y: y };

    var i = 0;
    var result = e1.windowToggle(e2, function () { return closings[i++]; });

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should handle empty source', function () {
    var e1 = cold( '|');
    var e2 = cold( '--o-----|');
    var e3 = cold(   '-----c--|');
    var expected = '|';

    var result = e1.windowToggle(e2, function () { return e3; });

    expectObservable(result).toBe(expected);
  });

  it('should handle throw', function () {
    var e1 = cold('#');
    var e2 = cold('--o-----|');
    var e3 = cold('-----c--|');
    var expected = '#';

    var result = e1.windowToggle(e2, function () { return e3; });

    expectObservable(result).toBe(expected);
  });

  it('should handle never', function () {
    var e1 =   hot('-');
    var e2 =  cold('--o-----o------o-----o---o-----|');
    var e3 =  cold(  '--c-|');
    var unsub =    '                                            !';
    var subs =     '^                                           !';
    var expected = '--u-----v------x-----y---z-------------------';
    var u = cold(    '--|                                        ');
    var v = cold(          '--|                                  ');
    var x = cold(                 '--|                           ');
    var y = cold(                       '--|                     ');
    var z = cold(                           '--|                 ');
    var values = { u: u, v: v, x: x, y: y, z: z };

    var result = e1.windowToggle(e2, function () { return e3; });

    expectObservable(result, unsub).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should handle a never opening Observable', function () {
    var e1 = hot('--a--^---b---c---d---e---f---g---h------|');
    var e2 = cold(    '-');
    var e3 =  cold(   '--c-|');
    var expected =    '-----------------------------------|';

    var result = e1.windowToggle(e2, function () { return e3; });

    expectObservable(result).toBe(expected);
  });

  it('should handle a never closing Observable', function () {
    var e1 = hot('--a--^---b---c---d---e---f---g---h------|');
    var e2 = cold(    '---o---------------o-----------|    ');
    var e3 =  cold('-');
    var expected =    '---x---------------y---------------|';
    var x = cold(        '-b---c---d---e---f---g---h------|');
    var y = cold(                        '-f---g---h------|');
    var values = { x: x, y: y };

    var result = e1.windowToggle(e2, function () { return e3; });

    expectObservable(result).toBe(expected, values);
  });

  it('should handle opening Observable that just throws', function () {
    var e1 = hot('--a--^---b---c---d---e---f---g---h------|');
    var e2 = cold(    '#');
    var e3 = cold(    '--c-|');
    var subs =        '(^!)';
    var expected =    '#';

    var result = e1.windowToggle(e2, function () { return e3; });

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });
});