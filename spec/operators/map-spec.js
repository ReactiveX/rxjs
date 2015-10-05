/* globals describe, it, expect */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

// function shortcuts
var addDrama = function (x) { return x + '!'; };

describe('Observable.prototype.map()', function () {
  it('should map one value', function () {
    var a =   cold('--x--|', {x: 42});
    var expected = '--y--|';

    var r = a.map(addDrama);
    expectObservable(r).toBe(expected, {y: '42!'});
  });

  it('should map multiple values', function () {
    var a =   cold('--1--2--3--|');
    var expected = '--x--y--z--|';

    var r = a.map(addDrama);
    expectObservable(r).toBe(expected, {x: '1!', y: '2!', z: '3!'});
  });

  it('should send errors down the error path', function () {
    var a =   cold('--x--|', {x: 42});
    var expected = '--#';

    var r = a.map(function (x) {
      throw 'too bad';
    });
    expectObservable(r).toBe(expected, null, 'too bad');
  });
});
