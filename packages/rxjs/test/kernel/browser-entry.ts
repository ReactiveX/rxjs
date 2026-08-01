import { map } from '../../src/map.js';
import { pipe } from '../../src/pipe.js';
import { scan } from '../../src/scan.js';
import { switchMap } from '../../src/switch-map.js';
import { timeout } from '../../src/timeout.js';
import { timer } from '../../src/timer.js';

const target = globalThis as typeof globalThis & {
  __rxjsExtensionKernelPilot?: { map: symbol; pipe: symbol; scan: symbol; switchMap: symbol; timeout: symbol; timer: symbol };
};

target.__rxjsExtensionKernelPilot = { map, pipe, scan, switchMap, timeout, timer };
