/* globals describe, it, expect, rxTestScheduler, expectObservable*/
var Rx = require('../../dist/cjs/Rx');
var ErrorObservable = require('../../dist/cjs/observable/throw').ErrorObservable;
var Observable = Rx.Observable;

describe('ErrorObservable', function () {
  it('should create expose a error property', function () {
    var e = new ErrorObservable('error');
    expect(e.error).toBe('error');
  });

  it('should create ErrorObservable via static create function', function () {
    var e = new ErrorObservable('error');
    var r = ErrorObservable.create('error');

    expect(e).toEqual(r);
  });

  it('should accept scheduler', function () {
    var e = ErrorObservable.create('error', rxTestScheduler);

    expectObservable(e).toBe('#');
  });
});
