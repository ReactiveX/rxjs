/* globals describe, it, expect, sinon, rxTestScheduler */
var Rx = require('../../../dist/cjs/Rx.DOM');
var Observable = Rx.Observable;

function noop() { }

describe('Observable.ajax', function () {
  beforeEach(function() {
    jasmine.Ajax.install();
  });

  afterEach(function() {
    jasmine.Ajax.uninstall();
  });

  it('should succeed', function() {
    var expected = { foo: 'bar' };
    var doneFn = jasmine.createSpy("success");

    Rx.Observable
      .ajax({
        url: '/flibbertyJibbet', upload: true,
        emitType: 'json', responseType: 'json'
      })
      .subscribe(doneFn, function () {
        throw 'should not have been called';
      });

    expect(jasmine.Ajax.requests.mostRecent().url).toBe('/flibbertyJibbet');
    expect(doneFn).not.toHaveBeenCalled();

    jasmine.Ajax.requests.mostRecent().respondWith({
      'status': 200,
      'contentType': 'text/plain',
      'responseText': JSON.stringify(expected)
    });

    expect(doneFn).toHaveBeenCalledWith(expected);
  });

  it('should fail', function() {
    var expected = JSON.stringify({ foo: 'bar' });
    var errorFn = jasmine.createSpy("success");

    Rx.Observable
      .ajax({
        url: '/flibbertyJibbet',
        normalizeError: function(e, xhr, type) {
          return xhr.response || xhr.responseText;
        }
      })
      .subscribe(function() {}, errorFn, function () {
        throw 'should not have been called';
      });

    expect(jasmine.Ajax.requests.mostRecent().url).toBe('/flibbertyJibbet');
    expect(errorFn).not.toHaveBeenCalled();

    jasmine.Ajax.requests.mostRecent().respondWith({
      'status': 404,
      'contentType': 'text/plain',
      'responseText': expected
    });

    expect(errorFn).toHaveBeenCalledWith(expected);
  })

  it('should succeed no settings', function() {
    var expected = JSON.stringify({ foo: 'bar' });

    Rx.Observable
        .ajax('/flibbertyJibbet')
        .subscribe(function(x) {
          expect(x.status).toBe(200);
          expect(x.xhr.method).toBe('GET');
          expect(x.xhr.responseText).toBe(expected);
        }, function () {
          throw 'should not have been called';
        });

    expect(jasmine.Ajax.requests.mostRecent().url).toBe('/flibbertyJibbet');
    jasmine.Ajax.requests.mostRecent().respondWith({
       'status': 200,
       'contentType': 'text/plain',
       'responseText': expected
    });
  });

  it('should fail no settings', function() {
    var expected = JSON.stringify({ foo: 'bar' });

    Rx.Observable
        .ajax('/flibbertyJibbet')
        .subscribe(function() {
          throw 'should not have been called';
        }, function(x) {
          expect(x.status).toBe(500);
          expect(x.xhr.method).toBe('GET');
          expect(x.xhr.responseText).toBe(expected);
        }, function () {
          throw 'should not have been called';
        });

    expect(jasmine.Ajax.requests.mostRecent().url).toBe('/flibbertyJibbet');
    jasmine.Ajax.requests.mostRecent().respondWith({
       'status': 500,
       'contentType': 'text/plain',
       'responseText': expected
    });
  });
});
