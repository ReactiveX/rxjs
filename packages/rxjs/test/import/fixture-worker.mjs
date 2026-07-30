import { parentPort } from 'node:worker_threads';
import { getObservablePolyfillInfo } from '@rxjs/observable-polyfill';
import { map } from 'rxjs/map';

parentPort.postMessage({
  hasMap: typeof globalThis.Observable.prototype[map] === 'function',
  info: getObservablePolyfillInfo(),
});
