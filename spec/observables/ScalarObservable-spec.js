/* globals describe, it, expect, rxTestScheduler*/
var Rx = require('../../dist/cjs/Rx');
var ScalarObservable = require('../../dist/cjs/observable/ScalarObservable').ScalarObservable;
var EmptyObservable = require('../../dist/cjs/observable/empty').EmptyObservable;
var ErrorObservable = require('../../dist/cjs/observable/throw').ErrorObservable;
var Observable = Rx.Observable;

describe('ScalarObservable', function () {
  it('should create expose a value property', function () {
    var s = new ScalarObservable(1);
    expect(s.value).toBe(1);
  });

  it('should not schedule further if subscriber unsubscribed', function () {
    var s = new ScalarObservable(1, rxTestScheduler);
    var subscriber = new Rx.Subscriber();
    s.subscribe(subscriber);
    subscriber.isUnsubscribed = true;
    rxTestScheduler.flush();
  });
});