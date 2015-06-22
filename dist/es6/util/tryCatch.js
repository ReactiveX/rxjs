import errorObj from './errorObject';
var tryCatchTarget;
function tryCatcher() {
    try {
        return tryCatchTarget.apply(this, arguments);
    }
    catch (e) {
        errorObj.e = e;
        return errorObj;
    }
}
export default function tryCatch(fn) {
    tryCatchTarget = fn;
    return tryCatcher;
}
;
