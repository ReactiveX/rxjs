"use strict";
var Rx = require('../../../dist/cjs/Rx.DOM');
var root_1 = require('../../../dist/cjs/util/root');
var ajax_helper_1 = require('../../helpers/ajax-helper');
/** @test {ajax} */
describe('Observable.ajax', function () {
    var gXHR;
    var rXHR;
    beforeEach(function () {
        gXHR = global.XMLHttpRequest;
        rXHR = root_1.root.XMLHttpRequest;
        global.XMLHttpRequest = ajax_helper_1.MockXMLHttpRequest;
        root_1.root.XMLHttpRequest = ajax_helper_1.MockXMLHttpRequest;
    });
    afterEach(function () {
        ajax_helper_1.MockXMLHttpRequest.clearRequest();
        global.XMLHttpRequest = gXHR;
        root_1.root.XMLHttpRequest = rXHR;
    });
    it('should set headers', function () {
        var obj = {
            url: '/talk-to-me-goose',
            headers: {
                'Content-Type': 'kenny/loggins',
                'Fly-Into-The': 'Dangah Zone!',
                'Take-A-Ride-Into-The': 'Danger ZoooOoone!'
            },
            method: ''
        };
        Rx.Observable.ajax(obj).subscribe();
        var request = ajax_helper_1.MockXMLHttpRequest.mostRecent;
        expect(request.url).toBe('/talk-to-me-goose');
        expect(request.requestHeaders).toEqual({
            'Content-Type': 'kenny/loggins',
            'Fly-Into-The': 'Dangah Zone!',
            'Take-A-Ride-Into-The': 'Danger ZoooOoone!',
            'X-Requested-With': 'XMLHttpRequest'
        });
    });
    it('should have an optional resultSelector', function () {
        var expected = 'avast ye swabs!';
        var result;
        var complete = false;
        var obj = {
            url: '/flibbertyJibbet',
            responseType: 'text',
            resultSelector: function (res) { return res.response; }
        };
        Rx.Observable.ajax(obj)
            .subscribe(function (x) {
            result = x;
        }, null, function () {
            complete = true;
        });
        expect(ajax_helper_1.MockXMLHttpRequest.mostRecent.url).toBe('/flibbertyJibbet');
        ajax_helper_1.MockXMLHttpRequest.mostRecent.respondWith({
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
        var obj = {
            url: '/flibbertyJibbet',
            responseType: 'text',
            resultSelector: function (res) {
                throw new Error('ha! ha! fooled you!');
            },
            method: ''
        };
        Rx.Observable.ajax(obj)
            .subscribe(function (x) {
            throw 'should not next';
        }, function (err) {
            error = err;
        }, function () {
            throw 'should not complete';
        });
        expect(ajax_helper_1.MockXMLHttpRequest.mostRecent.url).toBe('/flibbertyJibbet');
        ajax_helper_1.MockXMLHttpRequest.mostRecent.respondWith({
            'status': 200,
            'contentType': 'application/json',
            'responseText': expected
        });
        expect(error).toEqual(new Error('ha! ha! fooled you!'));
    });
    it('should error if createXHR throws', function () {
        var error;
        var obj = {
            url: '/flibbertyJibbet',
            responseType: 'text',
            createXHR: function () {
                throw new Error('wokka wokka');
            }
        };
        Rx.Observable.ajax(obj)
            .subscribe(function (x) {
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
        var obj = {
            url: '/flibbertyJibbet',
            responseType: 'text',
            method: ''
        };
        Rx.Observable.ajax(obj)
            .subscribe(function (x) {
            result = x;
        }, null, function () {
            complete = true;
        });
        expect(ajax_helper_1.MockXMLHttpRequest.mostRecent.url).toBe('/flibbertyJibbet');
        ajax_helper_1.MockXMLHttpRequest.mostRecent.respondWith({
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
        var obj = {
            url: '/flibbertyJibbet',
            normalizeError: function (e, xhr, type) {
                return xhr.response || xhr.responseText;
            },
            responseType: 'text',
            method: ''
        };
        Rx.Observable.ajax(obj)
            .subscribe(function (x) {
            throw 'should not next';
        }, function (err) {
            error = err;
        }, function () {
            throw 'should not complete';
        });
        expect(ajax_helper_1.MockXMLHttpRequest.mostRecent.url).toBe('/flibbertyJibbet');
        ajax_helper_1.MockXMLHttpRequest.mostRecent.respondWith({
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
        var obj = {
            url: '/flibbertyJibbet',
            normalizeError: function (e, xhr, type) {
                return xhr.response || xhr.responseText;
            },
            responseType: 'text',
            method: ''
        };
        Rx.Observable.ajax(obj).subscribe(function (x) {
            throw 'should not next';
        }, function (err) {
            error = err;
        }, function () {
            throw 'should not complete';
        });
        expect(ajax_helper_1.MockXMLHttpRequest.mostRecent.url).toBe('/flibbertyJibbet');
        ajax_helper_1.MockXMLHttpRequest.mostRecent.respondWith({
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
        Rx.Observable.ajax('/flibbertyJibbet')
            .subscribe(function (x) {
            expect(x.status).toBe(200);
            expect(x.xhr.method).toBe('GET');
            expect(x.xhr.responseText).toBe(expected);
        }, function () {
            throw 'should not have been called';
        });
        expect(ajax_helper_1.MockXMLHttpRequest.mostRecent.url).toBe('/flibbertyJibbet');
        ajax_helper_1.MockXMLHttpRequest.mostRecent.respondWith({
            'status': 200,
            'contentType': 'text/plain',
            'responseText': expected
        });
    });
    it('should fail no settings', function () {
        var expected = JSON.stringify({ foo: 'bar' });
        Rx.Observable.ajax('/flibbertyJibbet')
            .subscribe(function () {
            throw 'should not have been called';
        }, function (x) {
            expect(x.status).toBe(500);
            expect(x.xhr.method).toBe('GET');
            expect(x.xhr.responseText).toBe(expected);
        }, function () {
            throw 'should not have been called';
        });
        expect(ajax_helper_1.MockXMLHttpRequest.mostRecent.url).toBe('/flibbertyJibbet');
        ajax_helper_1.MockXMLHttpRequest.mostRecent.respondWith({
            'status': 500,
            'contentType': 'text/plain',
            'responseText': expected
        });
    });
    describe('ajax.get', function () {
        it('should succeed on 200', function () {
            var expected = { foo: 'bar' };
            var result;
            var complete = false;
            Rx.Observable
                .ajax.get('/flibbertyJibbet')
                .subscribe(function (x) {
                result = x;
            }, null, function () {
                complete = true;
            });
            var request = ajax_helper_1.MockXMLHttpRequest.mostRecent;
            expect(request.url).toBe('/flibbertyJibbet');
            request.respondWith({
                'status': 200,
                'contentType': 'application/json',
                'responseText': JSON.stringify(expected)
            });
            expect(result).toEqual(expected);
            expect(complete).toBe(true);
        });
        it('should succeed on 200 with a resultSelector', function () {
            var expected = { larf: 'hahahahaha' };
            var result;
            var innerResult;
            var complete = false;
            Rx.Observable
                .ajax.get('/flibbertyJibbet', function (x) {
                innerResult = x;
                return x.response.larf.toUpperCase();
            })
                .subscribe(function (x) {
                result = x;
            }, null, function () {
                complete = true;
            });
            expect(ajax_helper_1.MockXMLHttpRequest.mostRecent.url).toBe('/flibbertyJibbet');
            ajax_helper_1.MockXMLHttpRequest.mostRecent.respondWith({
                'status': 200,
                'contentType': 'application/json',
                'responseText': JSON.stringify(expected)
            });
            expect(innerResult.xhr).toBeDefined();
            expect(innerResult.response).toEqual({ larf: 'hahahahaha' });
            expect(result).toBe('HAHAHAHAHA');
            expect(complete).toBe(true);
        });
    });
    describe('ajax.post', function () {
        it('should succeed on 200', function () {
            var expected = { foo: 'bar', hi: 'there you' };
            var result;
            var complete = false;
            Rx.Observable
                .ajax.post('/flibbertyJibbet', expected)
                .subscribe(function (x) {
                result = x;
            }, null, function () {
                complete = true;
            });
            var request = ajax_helper_1.MockXMLHttpRequest.mostRecent;
            expect(request.method).toBe('POST');
            expect(request.url).toBe('/flibbertyJibbet');
            expect(request.requestHeaders).toEqual({
                'X-Requested-With': 'XMLHttpRequest',
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
            });
            request.respondWith({
                'status': 200,
                'contentType': 'application/json',
                'responseText': JSON.stringify(expected)
            });
            expect(request.data).toEqual('foo=bar&hi=there%20you');
            expect(result.response).toEqual(expected);
            expect(complete).toBe(true);
        });
    });
});
//# sourceMappingURL=ajax-spec.js.map