import { strict as assert } from 'assert'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import * as rx from 'rxjs'
import * as operators from 'rxjs/operators'

const readJSONSync = (path) => JSON.parse(readFileSync(join(dirname(fileURLToPath(import.meta.url)), path), 'utf-8'))
const rxSnapshot = readJSONSync('rx.json');
const operatorsSnapshot = readJSONSync('operators.json');

assert.ok(rx, 'main export should exists');
assert.ok(operators, 'operator export should exists');

assert.deepStrictEqual(Object.keys(rx).sort(), rxSnapshot.sort(), 'main export should include exports');
assert.deepStrictEqual(Object.keys(operators).sort(), operatorsSnapshot.sort(), 'operator export should include exports');