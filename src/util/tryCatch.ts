import { errorObject } from './errorObject';
import { getZone } from './getZone';

let tryCatchTarget: Function;
let tryCatchZone: Zone;

function tryCatcher(this: any): any {
  try {
    return tryCatchZone && tryCatchZone != getZone()
        ? tryCatchZone.run(tryCatchTarget, this, arguments as any)
        : tryCatchTarget.apply(this, arguments);
  } catch (e) {
    errorObject.e = e;
    return errorObject;
  } finally {
    // Cleanup to prevent unnecessarily holding onto memory.
    tryCatchZone = null;
    tryCatchTarget = null;
  }
}

export function tryCatch<T extends Function>(fn: T, zone?: Zone): T {
  tryCatchTarget = fn;
  tryCatchZone = zone;
  return <any>tryCatcher;
};
