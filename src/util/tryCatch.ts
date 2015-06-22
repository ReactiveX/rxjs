import errorObj from './errorObject';
var tryCatchTarget;

function tryCatcher():any {
  try {
    return tryCatchTarget.apply(this, arguments);
  } catch (e) {
    errorObj.e = e;
    return errorObj;
  }
}

export default function tryCatch(fn:Function):Function {
  tryCatchTarget = fn;
  return tryCatcher;
};