export default (dest) => {
    var buffer = [];
    return dest.create(
        (x) => { buffer.push(x); },
        (e) => { return dest.onError(e); },
        ( ) => { return dest.onNext(buffer) && dest.onCompleted(); }
    );
};