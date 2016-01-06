/* globals describe, it, expect, sinon, rxTestScheduler */
var Rx = require('../../../dist/cjs/Rx.DOM');
var Observable = Rx.Observable;

function noop() {
  // nope.
}

describe('Observable.ajax', function () {
  beforeEach(function () {
    jasmine.Ajax.install();
  });

  afterEach(function () {
    jasmine.Ajax.uninstall();
  });

  it('should have an optional resultSelector', function () {
    var expected = 'avast ye swabs!';
    var result;
    var complete = false;

    Rx.Observable
      .ajax({
        url: '/flibbertyJibbet',
        responseType: 'text',
        resultSelector: function (res) {
          return res.responseText;
        }
      })
      .subscribe(function(x) {
        result = x;
      }, function () {
        throw 'should not have been called';
      }, function () {
        complete = true;
      });

    expect(jasmine.Ajax.requests.mostRecent().url).toBe('/flibbertyJibbet');

    jasmine.Ajax.requests.mostRecent().respondWith({
      'status': 200,
      'contentType': 'application/json',
      'responseText': expected
    });

    expect(result).toBe(expected);
    expect(complete).toBe(true);
  });

  it('should have error when resultSelector errors', function () {
    var expected = 'avast ye swabs!';
    var error;

    Rx.Observable
      .ajax({
        url: '/flibbertyJibbet',
        responseType: 'text',
        resultSelector: function (res) {
          throw new Error('ha! ha! fooled you!');
        }
      })
      .subscribe(function(x) {
        throw 'should not next';
      }, function (err) {
        error = err;
      }, function () {
        throw 'should not complete';
      });

    expect(jasmine.Ajax.requests.mostRecent().url).toBe('/flibbertyJibbet');

    jasmine.Ajax.requests.mostRecent().respondWith({
      'status': 200,
      'contentType': 'application/json',
      'responseText': expected
    });

    expect(error).toEqual(new Error('ha! ha! fooled you!'));
  });

  it('should error if createXHR throws', function () {
    var error;

    Rx.Observable
      .ajax({
        url: '/flibbertyJibbet',
        responseType: 'text',
        createXHR: function () {
          throw new Error('wokka wokka');
        }
      })
      .subscribe(function(x) {
        throw 'should not next';
      }, function (err) {
        error = err;
      }, function () {
        throw 'should not complete';
      });

    expect(error).toEqual(new Error('wokka wokka'));
  });

  it('should succeed on 200', function () {
    var expected = { foo: 'bar' };
    var result;
    var complete = false;

    Rx.Observable
      .ajax({
        url: '/flibbertyJibbet',
        responseType: 'text',
      })
      .subscribe(function(x) {
        result = x;
      }, function () {
        throw 'should not have been called';
      }, function () {
        complete = true;
      });

    expect(jasmine.Ajax.requests.mostRecent().url).toBe('/flibbertyJibbet');

    jasmine.Ajax.requests.mostRecent().respondWith({
      'status': 200,
      'contentType': 'application/json',
      'responseText': JSON.stringify(expected)
    });

    expect(result.xhr).toBeDefined();
    expect(result.response).toBe(JSON.stringify({ foo: 'bar' }));
    expect(complete).toBe(true);
  });

  it('should fail on 404', function () {
    var error;

    Rx.Observable
      .ajax({
        url: '/flibbertyJibbet',
        normalizeError: function (e, xhr, type) {
          return xhr.response || xhr.responseText;
        }
      })
      .subscribe(function (x) {
        console.log(x);
        throw 'should not next';
      }, function (x) {
        error = x;
      }, function () {
        throw 'should not complete';
      });

    expect(jasmine.Ajax.requests.mostRecent().url).toBe('/flibbertyJibbet');

    jasmine.Ajax.requests.mostRecent().respondWith({
      'status': 404,
      'contentType': 'text/plain',
      'responseText': 'Wee! I am text!'
    });

    expect(error instanceof Rx.AjaxError).toBe(true);
    expect(error.message).toBe('ajax error 404');
    expect(error.status).toBe(404);
  });


  it('should fail on 404', function () {
    var error;

    Rx.Observable
      .ajax({
        url: '/flibbertyJibbet',
        normalizeError: function (e, xhr, type) {
          return xhr.response || xhr.responseText;
        }
      })
      .subscribe(function (x) {
        console.log(x);
        throw 'should not next';
      }, function (x) {
        error = x;
      }, function () {
        throw 'should not complete';
      });

    expect(jasmine.Ajax.requests.mostRecent().url).toBe('/flibbertyJibbet');

    jasmine.Ajax.requests.mostRecent().respondWith({
      'status': 300,
      'contentType': 'text/plain',
      'responseText': 'Wee! I am text!'
    });

    expect(error instanceof Rx.AjaxError).toBe(true);
    expect(error.message).toBe('ajax error 300');
    expect(error.status).toBe(300);
  });

  it('should succeed no settings', function () {
    var expected = JSON.stringify({ foo: 'bar' });

    Rx.Observable
        .ajax('/flibbertyJibbet')
        .subscribe(function (x) {
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

  it('should fail no settings', function () {
    var expected = JSON.stringify({ foo: 'bar' });

    Rx.Observable
        .ajax('/flibbertyJibbet')
        .subscribe(function () {
          throw 'should not have been called';
        }, function (x) {
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
