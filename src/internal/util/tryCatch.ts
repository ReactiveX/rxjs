import { errorObject } from './errorObject';

let tryCatchTarget: Function;

function tryCatcher(this: any): any {
  let result;
  try {
    result = tryCatchTarget.apply(this, arguments);
  } catch (e) {
    errorObject.e = e;
    result = errorObject;
  }
  tryCatchTarget = undefined;
  return result;
}

export function tryCatch<T extends Function>(fn: T): T {
  tryCatchTarget = fn;
  return <any>tryCatcher;
}
