export default (total, dest) => {
    var counter = -1, upstream;
    return (total > 0) && (upstream = dest.create((x) => {
        if(++counter < total) {
            return dest.onNext(x);
        } else {
            return upstream.dispose() && dest.onCompleted();
        }
    })) || (this.dispose() && dest.onCompleted());
};
