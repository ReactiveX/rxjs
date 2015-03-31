export default (concurrent, dest) => {
    
    var buffer, upstream;
    
    if(typeof concurrent === 'undefined' || concurrent < 1) {
        concurrent = Number.POSITIVE_INFINITY;
    } else {
        buffer = [];
    }
    
    return upstream = dest.create(
        (x) => {
            if(upstream.length > concurrent) {
                buffer.push(x);
            } else {
                var inner;
                upstream.add(inner = x.subscribe(
                    (x) => { return dest.onNext(x);  },
                    (e) => { return dest.onError(e); },
                    ( ) => {
                        inner && upstream.remove(inner);
                        if(upstream.length < concurrent) {
                            if(buffer && buffer.length > 0) {
                                upstream.onNext(buffer.shift());
                            } else if(upstream.stopped === true && upstream.length === 0) {
                                return dest.onCompleted();
                            }
                        }
                        return false;
                    }
                ));
            }
        },
        null,
        () => {
            upstream.stopped = true;
            if(upstream.length === 0 && (!buffer || buffer.length === 0)) {
                return dest.onCompleted();
            }
            return false;
        }
    );
};