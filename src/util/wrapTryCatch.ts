export default function wrapTryCatch(tryCatchTarget:Function):any {
    return function tryCatcher() {
        try {
            return tryCatchTarget.apply(this, arguments);
        } catch (e) {
            return this["throw"](e);
        }
    }
};
