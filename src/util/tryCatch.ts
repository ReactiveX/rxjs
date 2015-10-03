import {errorObject} from './errorObject';

let tryCatchTarget;

function tryCatcher(): any {
  try {
    return tryCatchTarget.apply(this, arguments);
  } catch (e) {
    errorObject.e = e;
    return errorObject;
  }
}

export default function tryCatch(fn: Function): Function {
  tryCatchTarget = fn;
  return tryCatcher;
};