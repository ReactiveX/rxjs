import scan from './scan';

export default (project, acc, dest) => {
    var val = dest;
    return scan(dest.create(
        (x) => { return (val = x) && true || true; },
        (e) => { return dest.onError(e); },
        ( ) => { return (val === dest || dest.onNext(val)) && dest.onCompleted(); }
    ), project, acc);
};
