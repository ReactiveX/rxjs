module.exports = function() {
    
    function Disposable(dispose) {
        !!dispose && (this._dispose = dispose);
        this.disposed = false;
        this.length = 0;
    }
    
    Disposable.prototype.dispose = function() {
        if(!this.disposed) {
            var result = true, f, xs, i, n;
            (f = this._dispose) && (result = f.call(this));
            if(!!result || result === void 0) {
                this.disposed = true;
                delete this._dispose;
                while(xs = this._disposables) {
                    i = -1;
                    n = xs.length;
                    delete this._disposables;
                    while(++i < n) {
                        xs[i].dispose();
                    }
                }
                this.length = 0;
            }
        }
        return result;
    };
    
    Disposable.prototype.add = function () {
        
        var argsIdx = -1;
        var argsLen = arguments.length;
        var disposables = new Array(argsLen);
        while(++argsIdx < argsLen) { disposables[argsIdx] = arguments[argsIdx]; }
        
        var xs = this._disposables || (this._disposables = []),
            ys = disposables, j = xs.length, i = -1, n = ys.length,
            xd = this.disposed, x;
        while(++i < n) {
            // 
            // expression-ize all the things.
            // 
            // get the disposable to add
            (x = ys[i]) &&
            // make sure it's an object
            (typeof x === 'object') &&
            // make sure it isn't already disposed
            (!x.disposed) &&
            // make sure it has a dispose function
            (typeof x.dispose === 'function') &&
                // If this disposable is already disposed,
                // immediately dispose the new disposable.
                (xd && x.dispose() ||
                // If this disposable isn't already disposed,
                // or the new disposable's dispose() returns
                // false, add it to the disposables list.
                (xs[j++] = x));
        }
        this.length = j;
        return this;
    };
    
    Disposable.prototype.remove = function () {
        
        var argsIdx = -1;
        var argsLen = arguments.length;
        var disposables = new Array(argsLen);
        while(++argsIdx < argsLen) { disposables[argsIdx] = arguments[argsIdx]; }
        
        var xs = this._disposables, ys = disposables;
        var i  = -1, j = -1, k, n, x;
        if(xs && (n = xs.length) && ys.length) {
            var zs = [];
            while(++i < n) {
                if(~(k = ys.indexOf(x = xs[i]))) {
                    ys.splice(k, 1);
                    if(ys.length == 0) {
                        while(++i < n) {
                            zs[++j] = x;
                        }
                        break;
                    }
                } else {
                    zs[++j] = x;
                }
            }
            this._disposables = ~j && zs || undefined;
            this.length = ~j && (j + 1);
        }
        return this;
    };
    
    Disposable.empty = new Disposable();
    Disposable.empty.disposed = true;
    
    return Disposable;
}();
