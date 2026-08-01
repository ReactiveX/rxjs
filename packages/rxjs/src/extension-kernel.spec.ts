import { beforeAll, describe, expect, it } from 'vitest';
import '@rxjs/observable-polyfill';

type PilotSymbols = {
  map: typeof import('./map.js').map;
  pipe: typeof import('./pipe.js').pipe;
  scan: typeof import('./scan.js').scan;
  switchMap: typeof import('./switch-map.js').switchMap;
  timeout: typeof import('./timeout.js').timeout;
  timer: typeof import('./timer.js').timer;
};

let pilot: PilotSymbols;
let platformMap: Observable<unknown>['map'];
let platformSwitchMap: Observable<unknown>['switchMap'];

beforeAll(async () => {
  platformMap = Observable.prototype.map;
  platformSwitchMap = Observable.prototype.switchMap;
  const [mapModule, pipeModule, scanModule, switchMapModule, timeoutModule, timerModule] = await Promise.all([
    import('./map.js'),
    import('./pipe.js'),
    import('./scan.js'),
    import('./switch-map.js'),
    import('./timeout.js'),
    import('./timer.js'),
  ]);
  pilot = {
    map: mapModule.map,
    pipe: pipeModule.pipe,
    scan: scanModule.scan,
    switchMap: switchMapModule.switchMap,
    timeout: timeoutModule.timeout,
    timer: timerModule.timer,
  };
});

describe('Symbol extension kernel pilot', () => {
  it('installs every pilot capability with ordinary assignment descriptors', () => {
    for (const symbol of [pilot.map, pilot.pipe, pilot.scan, pilot.switchMap, pilot.timeout]) {
      expect(Object.getOwnPropertyDescriptor(Observable.prototype, symbol)).toMatchObject({
        configurable: true,
        enumerable: true,
        writable: true,
      });
    }
    for (const symbol of [pilot.pipe, pilot.timer]) {
      expect(Object.getOwnPropertyDescriptor(Observable, symbol)).toMatchObject({
        configurable: true,
        enumerable: true,
        writable: true,
      });
    }
  });

  it('keeps every public pilot Symbol out of the global registry', () => {
    for (const symbol of Object.values(pilot)) {
      expect(Symbol.keyFor(symbol)).toBeUndefined();
    }
  });

  it('preserves the platform map method and adds no RxJS string property', () => {
    expect(Observable.prototype.map).toBe(platformMap);
    expect(Observable.prototype.switchMap).toBe(platformSwitchMap);
    expect(Object.hasOwn(Observable.prototype, 'scan')).toBe(false);
    expect(Object.hasOwn(Observable.prototype, 'timeout')).toBe(false);
    expect(Object.hasOwn(Observable.prototype, 'pipe')).toBe(false);
    expect(Object.hasOwn(Observable, 'timer')).toBe(false);
    expect(Object.hasOwn(Observable, 'pipe')).toBe(false);
  });
});
