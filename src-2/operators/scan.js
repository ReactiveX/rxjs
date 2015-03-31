export default (project, acc, dest) => {
    var hasValue = false, hasSeed = acc !== void 0;
    return dest.create(
        (x) => {
            if(hasValue || (hasValue = hasSeed)) {
                return dest.onNext(acc = project(acc, x));
            }
            hasValue = true;
            return dest.onNext(acc = x);
        },
        (e) => { return dest.onError(e); },
        ( ) => {
            if(!hasValue && hasSeed) {
                dest.onNext(acc);
            }
            return dest.onCompleted();
        }
    );
};
