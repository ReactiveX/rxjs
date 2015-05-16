define(['exports', 'module'], function (exports, module) {
    // portions of the following implementation are derived from the RSVP.js code base
    // Those portions are Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors
    // and licensed here: https://github.com/tildeio/rsvp.js/blob/32a94f91e8f408b1359f96f2cac9c8aed8d2f33a/LICENSE
    /* globals process, setImmediate */
    'use strict';

    module.exports = getBoundNext;
    var isNode = typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]';
    var browserWindow = typeof window !== 'undefined' ? window : undefined;
    var browserGlobal = browserWindow || {};
    var BrowserMutationObserver = browserGlobal.MutationObserver || browserGlobal.WebKitMutationObserver;
    // test for web worker but not in IE10
    var useMessageChannel = typeof Uint8ClampedArray !== 'undefined' && typeof importScripts !== 'undefined' && typeof MessageChannel !== 'undefined';

    function getBoundNext(callback) {
        if (isNode) {
            return nextTickMethod(callback);
        } else if (BrowserMutationObserver) {
            return mutationObserverMethod(callback);
        } else if (useMessageChannel) {
            return messageChannelMethod(callback);
        } else {
            return setTimeoutMethod(callback);
        }
    }

    function nextTickMethod(callback) {
        var nextTick = process.nextTick;
        // node version 0.10.x displays a deprecation warning when nextTick is used recursively
        // setImmediate should be used instead instead
        var version = process.versions.node.match(/^(?:(\d+)\.)?(?:(\d+)\.)?(\*|\d+)$/);
        if (Array.isArray(version) && version[1] === '0' && version[2] === '10') {
            nextTick = setImmediate;
        }
        return function () {
            nextTick(callback);
        };
    }
    function mutationObserverMethod(callback) {
        var iterations = 0;
        var observer = new BrowserMutationObserver(callback);
        var node = document.createTextNode('');
        observer.observe(node, { characterData: true });
        return function () {
            node.data = iterations = ++iterations % 2;
        };
    }
    function messageChannelMethod(callback) {
        var channel = new MessageChannel();
        channel.port1.onmessage = callback;
        return function () {
            channel.port2.postMessage(0);
        };
    }
    function setTimeoutMethod(callback) {
        return function () {
            setTimeout(callback, 1);
        };
    }
    //# sourceMappingURL=get-bound-next.js.map
});