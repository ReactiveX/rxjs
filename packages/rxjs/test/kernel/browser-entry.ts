import 'rxjs';
import { map } from 'rxjs/map';
import { pipe } from 'rxjs/pipe';
import { scan } from 'rxjs/scan';
import { switchMap } from 'rxjs/switch-map';
import { timeout } from 'rxjs/timeout';
import { timer } from 'rxjs/timer';

const target = globalThis as typeof globalThis & {
  __rxjsExtensionKernelPilot?: { map: symbol; pipe: symbol; scan: symbol; switchMap: symbol; timeout: symbol; timer: symbol };
};

target.__rxjsExtensionKernelPilot = { map, pipe, scan, switchMap, timeout, timer };
