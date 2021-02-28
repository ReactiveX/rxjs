/* eslint-parserOptions sourceType: module */
import * as rx from 'rxjs';
import * as operators from 'rxjs/operators';
import operatorsSnapshot from '../operators.json';
import rxSnapshot from '../rx.json';

const deepStrictEqual = (a, b) => {
  return JSON.stringify(a) === JSON.stringify(b);
};

if (!rx) {
  throw new Error('main export should exist');
}
if (!operators) {
  throw new Error('operator export should exist');
}

const rxApi = Object.keys(rx).sort();
const operatorsApi = Object.keys(operators).sort();

if (!deepStrictEqual(rxApi, rxSnapshot)) {
  throw new Error('main export should include export');
}

if (!deepStrictEqual(operatorsApi, operatorsSnapshot.sort())) {
  throw new Error('operator export should include exports');
}
console.log('completed');
