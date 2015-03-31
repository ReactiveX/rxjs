export default (selector, dest) => {
    return dest.create((x) => {
        return !selector(x) && true || dest.onNext(x);
    });
}