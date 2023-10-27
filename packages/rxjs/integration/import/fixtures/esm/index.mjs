import { strict as assert } from 'assert';
import * as rx from 'rxjs';
import * as operators from 'rxjs/operators';
import * as ajax from 'rxjs/ajax';
import * as webSocket from 'rxjs/webSocket';
import * as rxFetch from 'rxjs/fetch';
import * as testing from 'rxjs/testing';
import * as coldObservable from 'rxjs/internal/testing/ColdObservable';

assert.ok(rx, 'main export should exists');
assert.ok(operators, 'operator export should exists');
assert.ok(coldObservable, 'internal can be imported');
assert.ok(ajax, 'ajax can be imported');
assert.ok(webSocket, 'webSocket can be imported');
assert.ok(rxFetch, 'rxFetch can be imported');
assert.ok(testing, 'testing can be imported');

// Assert a few key things exist in each of the imported modules
assert.ok(rx.Observable, 'Observable should exist');
assert.ok(operators.map, 'map should exist');
assert.ok(ajax.ajax, 'ajax should exist');
assert.ok(webSocket.webSocket, 'webSocket should exist');
assert.ok(rxFetch.fromFetch, 'fromFetch should exist');
assert.ok(testing.TestScheduler, 'TestScheduler should exist');
