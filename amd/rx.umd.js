define(['exports', 'src/observable/observable'], function (exports, _srcObservableObservable) {
    /* globals define */
    'use strict';

    var platform;
    var Rx = {
        Observable: _srcObservableObservable.Observable
    };
    /* global self */
    if (typeof self === 'object') {
        platform = self;
    } else if (typeof global === 'object') {
        platform = global;
    } else {
        throw new Error('no global: `self` or `global` found');
    }
    /* global define:true module:true window: true */
    if (typeof define === 'function' && define['amd']) {
        define(function () {
            return Rx;
        });
    } else if (typeof module !== 'undefined' && module['exports']) {
        module['exports'] = Rx;
    } else if (typeof platform !== 'undefined') {
        platform['Rx'] = Rx;
    }
    //# sourceMappingURL=rx.umd.js.map
});