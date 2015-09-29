/* globals describe, it, expect, expectObservable, hot, cold */
var Rx = require('../../dist/cjs/Rx');

describe('Observable.prototype.concatAll()', function () {
  it('should concat sources from promise', function(done) {
    var sources = Rx.Observable.fromArray([
      new Promise(function (res) { res(0); }),
      new Promise(function (res) { res(1); }),
      new Promise(function (res) { res(2); }),
      new Promise(function (res) { res(3); }),
    ]);
    
    var res = [];
    sources.concatAll().subscribe(
      function (x) { res.push(x) },
      null,
      function () {
        expect(res).toEqual([0,1,2,3]);
        done();
      });
  }, 2000);
  
  it('should concat and raise error from promise', function(done) {
    var sources = Rx.Observable.fromArray([
      new Promise(function (res) { res(0); }),
      new Promise(function (res, rej) { rej(1); }),
      new Promise(function (res) { res(2); }),
      new Promise(function (res) { res(3); }),
    ]);
    
    var res = [];
    sources.concatAll().subscribe(
      function (x) { res.push(x) },
      function (err) {
        expect(res.length).toBe(1);
        expect(err).toBe(1);
        done();
      }, null);
  }, 2000);
});