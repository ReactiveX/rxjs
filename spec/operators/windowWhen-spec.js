/* globals describe, it, expect */
var Rx = require('../../dist/cjs/Rx.KitchenSink');
var Observable = Rx.Observable;

describe('Observable.prototype.windowWhen', function () {
  it('should emit windows that close and reopen', function () {
    var e1 = hot('--a--^--b--c--d--e--f--g--h--i--|');
    var e1subs =      '^                          !';
    var e2 = cold(    '-----------(x|)             ');
    var e2subs =     ['^          !                ',
                      '           ^          !     ',
                      '                      ^    !'];
    var a = cold(     '---b--c--d-|                ');
    var b = cold(                '-e--f--g--h|     ');
    var c = cold(                           '--i--|');
    var expected =    'a----------b----------c----|';
    var values = { a: a, b: b, c: c };

    var source = e1.windowWhen(function () { return e2; });

    expectObservable(source).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should emit windows using varying cold closings', function () {
    var e1 = hot('--a--^---b---c---d---e---f---g---h------|     ');
    var e1subs =      '^                                  !     ';
    var closings = [
      cold(           '-----------------s--|                    '),
      cold(                            '-----(s|)               '),
      cold(                                 '---------------(s|)')];
    var closeSubs =  ['^                !                       ',
                      '                 ^    !                  ',
                      '                      ^            !     '];
    var expected =    'x----------------y----z------------|     ';
    var x = cold(     '----b---c---d---e|                       ');
    var y = cold(                      '---f-|                  ');
    var z = cold(                           '--g---h------|     ');
    var values = { x: x, y: y, z: z };

    var i = 0;
    var result = e1.windowWhen(function () { return closings[i++]; });

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(closings[0].subscriptions).toBe(closeSubs[0]);
    expectSubscriptions(closings[1].subscriptions).toBe(closeSubs[1]);
    expectSubscriptions(closings[2].subscriptions).toBe(closeSubs[2]);
  });

  it('should emit windows using varying hot closings', function () {
    var e1 = hot('--a--^---b---c---d---e---f---g---h------|   ');
    var subs =        '^                                  !   ';
    var closings = [
      {obs: hot(  '-1--^----------------s-|                   '), // eslint-disable-line key-spacing
       sub:           '^                !                     '}, // eslint-disable-line key-spacing
      {obs: hot(      '-----3----4-----------(s|)             '), // eslint-disable-line key-spacing
       sub:           '                 ^    !                '}, // eslint-disable-line key-spacing
      {obs: hot(      '-------3----4-------5----------------s|'), // eslint-disable-line key-spacing
       sub:           '                      ^            !   '}]; // eslint-disable-line key-spacing
    var expected =    'x----------------y----z------------|   ';
    var x = cold(     '----b---c---d---e|                     ');
    var y = cold(                      '---f-|                ');
    var z = cold(                           '--g---h------|   ');
    var values = { x: x, y: y, z: z };

    var i = 0;
    var result = e1.windowWhen(function () { return closings[i++].obs; });

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(subs);
    expectSubscriptions(closings[0].obs.subscriptions).toBe(closings[0].sub);
    expectSubscriptions(closings[1].obs.subscriptions).toBe(closings[1].sub);
    expectSubscriptions(closings[2].obs.subscriptions).toBe(closings[2].sub);
  });

  it('should emit windows using varying empty delayed closings', function () {
    var e1 = hot('--a--^---b---c---d---e---f---g---h------|  ');
    var e1subs =      '^                                  !  ';
    var closings = [
      cold(           '-----------------|                    '),
      cold(                            '-----|               '),
      cold(                                 '---------------|')];
    var closeSubs =  ['^                !                    ',
                      '                 ^    !               ',
                      '                      ^            !  '];
    var expected =    'x----------------y----z------------|  ';
    var x = cold(     '----b---c---d---e|                    ');
    var y = cold(                      '---f-|               ');
    var z = cold(                           '--g---h------|  ');
    var values = { x: x, y: y, z: z };

    var i = 0;
    var result = e1.windowWhen(function () { return closings[i++]; });

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(closings[0].subscriptions).toBe(closeSubs[0]);
    expectSubscriptions(closings[1].subscriptions).toBe(closeSubs[1]);
    expectSubscriptions(closings[2].subscriptions).toBe(closeSubs[2]);
  });

  it('should emit windows using varying cold closings, outer unsubscribed early', function () {
    var e1 = hot('--a--^---b---c---d---e---f---g---h------|     ');
    var e1subs =      '^                  !                     ';
    var unsub =       '                   !                     ';
    var closings = [
      cold(           '-----------------s--|                    '),
      cold(                            '-----(s|)               ')];
    var closeSubs =  ['^                !                       ',
                      '                 ^ !                     '];
    var expected =    'x----------------y--                     ';
    var x = cold(     '----b---c---d---e|                       ');
    var y = cold(                      '---                     ');
    var values = { x: x, y: y };

    var i = 0;
    var result = e1.windowWhen(function () { return closings[i++]; });

    expectObservable(result, unsub).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(closings[0].subscriptions).toBe(closeSubs[0]);
    expectSubscriptions(closings[1].subscriptions).toBe(closeSubs[1]);
  });

  it('should propagate error thrown from closingSelector', function () {
    var e1 = hot('--a--^---b---c---d---e---f---g---h------|     ');
    var e1subs =      '^                !                       ';
    var closings = [
      cold(           '-----------------s--|                    '),
      cold(                            '-----(s|)               '),
      cold(                                 '---------------(s|)')];
    var closeSubs =  ['^                !                       '];
    var expected =    'x----------------(y#)                    ';
    var x = cold(     '----b---c---d---e|                       ');
    var y = cold(                      '#                       ');
    var values = { x: x, y: y };

    var i = 0;
    var result = e1.windowWhen(function () {
      if (i === 1) {
        throw 'error';
      }
      return closings[i++];
    });

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(closings[0].subscriptions).toBe(closeSubs[0]);
  });

  it('should propagate error emitted from a closing', function () {
    var e1 = hot('--a--^---b---c---d---e---f---g---h------|     ');
    var e1subs =      '^                !                       ';
    var closings = [
      cold(           '-----------------s--|                    '),
      cold(                            '#                       ')];
    var closeSubs =  ['^                !                       ',
                      '                 (^!)                    '];
    var expected =    'x----------------(y#)                    ';
    var x = cold(     '----b---c---d---e|                       ');
    var y = cold(                      '#                       ');
    var values = { x: x, y: y };

    var i = 0;
    var result = e1.windowWhen(function () { return closings[i++]; });

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(closings[0].subscriptions).toBe(closeSubs[0]);
    expectSubscriptions(closings[1].subscriptions).toBe(closeSubs[1]);
  });

  it('should propagate error emitted late from a closing', function () {
    var e1 = hot('--a--^---b---c---d---e---f---g---h------|     ');
    var e1subs =      '^                     !                  ';
    var closings = [
      cold(           '-----------------s--|                    '),
      cold(                            '-----#                  ')];
    var closeSubs =  ['^                !                       ',
                      '                 ^    !                  '];
    var expected =    'x----------------y----#                  ';
    var x = cold(     '----b---c---d---e|                       ');
    var y = cold(                      '---f-#                  ');
    var values = { x: x, y: y };

    var i = 0;
    var result = e1.windowWhen(function () { return closings[i++]; });

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(closings[0].subscriptions).toBe(closeSubs[0]);
    expectSubscriptions(closings[1].subscriptions).toBe(closeSubs[1]);
  });

  it('should propagate errors emitted from the source', function () {
    var e1 = hot('--a--^---b---c---d---e---f-#                  ');
    var e1subs =      '^                     !                  ';
    var closings = [
      cold(           '-----------------s--|                    '),
      cold(                            '-------(s|)             ')];
    var closeSubs =  ['^                !                       ',
                      '                 ^    !                  '];
    var expected =    'x----------------y----#                  ';
    var x = cold(     '----b---c---d---e|                       ');
    var y = cold(                      '---f-#                  ');
    var values = { x: x, y: y };

    var i = 0;
    var result = e1.windowWhen(function () { return closings[i++]; });

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(closings[0].subscriptions).toBe(closeSubs[0]);
    expectSubscriptions(closings[1].subscriptions).toBe(closeSubs[1]);
  });

  it('should handle empty source', function () {
    var e1 = cold( '|');
    var e1subs =   '(^!)';
    var e2 = cold( '-----c--|');
    var e2subs =   '(^!)';
    var expected = '(w|)';
    var values = { w: cold('|') };

    var result = e1.windowWhen(function () { return e2; });

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should handle a never source', function () {
    var e1 = cold( '-');
    var unsub =    '                 !';
    var e1subs =   '^                !';
    var e2 = cold( '-----c--|');
    //                   -----c--|
    //                        -----c--|
    //                             -----c--|
    var e2subs =  ['^    !            ',
                   '     ^    !       ',
                   '          ^    !  ',
                   '               ^ !'];
    var win = cold('-----|');
    var d =   cold(               '---');
    var expected = 'a----b----c----d--';
    var values = { a: win, b: win, c: win, d: d };

    var result = e1.windowWhen(function () { return e2; });

    expectObservable(result, unsub).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should handle throw', function () {
    var e1 = cold('#');
    var e1subs =  '(^!)';
    var e2 = cold('-----c--|');
    var e2subs =  '(^!)';
    var win = cold('#');
    var expected = '(w#)';
    var values = { w: win };

    var result = e1.windowWhen(function () { return e2; });

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should handle a never closing Observable', function () {
    var e1 = hot('--a--^---b---c---d---e---f---g---h------|');
    var e1subs =      '^                                  !';
    var e2 =  cold(   '-');
    var e2subs =      '^                                  !';
    var expected =    'x----------------------------------|';
    var x = cold(     '----b---c---d---e---f---g---h------|');
    var values = { x: x };

    var result = e1.windowWhen(function () { return e2; });

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should handle a throw closing Observable', function () {
    var e1 = hot('--a--^---b---c---d---e---f---g---h------|');
    var e1subs =      '(^!)                                ';
    var e2 =  cold(   '#');
    var e2subs =      '(^!)                                ';
    var expected =    '(x#)                                ';
    var x = cold(     '#                                   ');
    var values = { x: x };

    var result = e1.windowWhen(function () { return e2; });

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });
});