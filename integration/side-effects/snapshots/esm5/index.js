var __await = void 0 && (void 0).__await || function(v) {
    return this instanceof __await ? (this.v = v, this) : new __await(v);
};

var __asyncGenerator = void 0 && (void 0).__asyncGenerator || function(thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function() {
        return this;
    }, i;
    function verb(n) {
        if (g[n]) i[n] = function(v) {
            return new Promise((function(a, b) {
                q.push([ n, v, a, b ]) > 1 || resume(n, v);
            }));
        };
    }
    function resume(n, v) {
        try {
            step(g[n](v));
        } catch (e) {
            settle(q[0][3], e);
        }
    }
    function step(r) {
        r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r);
    }
    function fulfill(value) {
        resume("next", value);
    }
    function reject(value) {
        resume("throw", value);
    }
    function settle(f, v) {
        if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]);
    }
};

var __awaiter = void 0 && (void 0).__awaiter || function(thisArg, _arguments, P, generator) {
    function adopt(value) {
        return value instanceof P ? value : new P((function(resolve) {
            resolve(value);
        }));
    }
    return new (P || (P = Promise))((function(resolve, reject) {
        function fulfilled(value) {
            try {
                step(generator.next(value));
            } catch (e) {
                reject(e);
            }
        }
        function rejected(value) {
            try {
                step(generator["throw"](value));
            } catch (e) {
                reject(e);
            }
        }
        function step(result) {
            result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    }));
};

var __asyncValues = void 0 && (void 0).__asyncValues || function(o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = "function" === typeof __values ? __values(o) : o[Symbol.iterator](), 
    i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function() {
        return this;
    }, i);
    function verb(n) {
        i[n] = o[n] && function(v) {
            return new Promise((function(resolve, reject) {
                v = o[n](v), settle(resolve, reject, v.done, v.value);
            }));
        };
    }
    function settle(resolve, reject, d, v) {
        Promise.resolve(v).then((function(v) {
            resolve({
                value: v,
                done: d
            });
        }), reject);
    }
};

var NotificationKind;

(function(NotificationKind) {
    NotificationKind["NEXT"] = "N";
    NotificationKind["ERROR"] = "E";
    NotificationKind["COMPLETE"] = "C";
})(NotificationKind || (NotificationKind = {}));
