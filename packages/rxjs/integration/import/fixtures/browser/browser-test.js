import { Observable, from, map } from './node_modules/rxjs/dist/esm/index.js';
import { ajax } from './node_modules/rxjs/dist/esm/ajax/index.js';
import { webSocket } from './node_modules/rxjs/dist/esm/webSocket/index.js';
import { fromFetch } from './node_modules/rxjs/dist/esm/fetch/index.js';
import { TestScheduler } from './node_modules/rxjs/dist/esm/testing/index.js';

let success = true;

const assert = (condition, message) => {
  if (condition) {
    // show a green check mark emoji
    console.log(`✅ ${message}`);
  } else {
    success = false;
    console.log(`❌ ${message}`);
  }
};

console.log('Hello from the browser!');

assert(Observable, 'Observable should exist');
assert(map, 'map should exist');
assert(ajax, 'ajax should exist');
assert(webSocket, 'webSocket should exist');
assert(fromFetch, 'fromFetch should exist');
assert(TestScheduler, 'TestScheduler should exist');

const results = [];
from([1, 2, 3]).subscribe((x) => {
  results.push(x);
});

assert(results.length === 3, 'from should work');

window.reportDone(success);
