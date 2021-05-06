const assert = require('assert').strict;

const rx = require('rxjs');
const operators = require('rxjs/operators');

const rxSnapshot = require('./rx.json');
const operatorsSnapshot = require('./operators.json');

const coldObservalbe = require('rxjs/internal/testing/ColdObservable');

assert.ok(rx, 'main export should exists');
assert.ok(operators, 'operator export should exists');
assert.ok(coldObservalbe, 'internal can be imported');

assert.deepStrictEqual(Object.keys(rx).sort(), rxSnapshot.sort(), 'main export should include exports');
assert.deepStrictEqual(Object.keys(operators).sort(), operatorsSnapshot.sort(), 'operator export should include exports');
