export default (dest) => {
    var t = Date.now(), i, now;
    return dest.create((x) => {
        i = (now = Date.now()) - t;
        t = now;
        return dest.onNext({ interval: i, value: x });
    });
}