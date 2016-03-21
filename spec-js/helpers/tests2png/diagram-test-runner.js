jasmine.DEFAULT_TIMEOUT_INTERVAL = 5000;
var root = require('../../../dist/cjs/util/root').root;
var Rx = require('../../../dist/cjs/Rx.KitchenSink');
var marbleHelpers = require('../marble-testing');
var painter = require('./painter');
global.rxTestScheduler = null;
global.cold = marbleHelpers.cold;
global.hot = marbleHelpers.hot;
global.time = marbleHelpers.time;
global.expectObservable = marbleHelpers.expectObservable;
global.expectSubscriptions = marbleHelpers.expectSubscriptions;
function getInputStreams(rxTestScheduler) {
    return Array.prototype.concat.call([], rxTestScheduler.hotObservables
        .map(function (hot) {
        return {
            messages: hot.messages,
            subscription: { start: 0, end: '100%' },
        };
    })
        .slice(), rxTestScheduler.coldObservables
        .map(function (cold) {
        return {
            messages: cold.messages,
            cold: cold,
        };
    })
        .slice());
}
function updateInputStreamsPostFlush(inputStreams, rxTestScheduler) {
    return inputStreams.map(function (singleInputStream) {
        if (singleInputStream.cold && singleInputStream.cold.subscriptions.length) {
            singleInputStream.subscription = {
                start: singleInputStream.cold.subscriptions[0].subscribedFrame,
                end: singleInputStream.cold.subscriptions[0].unsubscribedFrame,
            };
        }
        return singleInputStream;
    });
}
function postProcessOutputMessage(msg) {
    if (Array.isArray(msg.notification.value)
        && msg.notification.value.length
        && typeof msg.notification.value[0] === 'object') {
        msg.notification.value = {
            messages: msg.notification.value,
            subscription: { start: msg.frame, end: '100%' },
        };
        var completionFrame = msg.notification.value.messages
            .reduce(function (prev, x) {
            if (x.notification && x.notification.kind === 'C' && x.frame > prev) {
                return x.frame;
            }
            else {
                return prev;
            }
        }, -1);
        if (completionFrame > -1) {
            msg.notification.value.subscription.end = msg.frame + completionFrame;
        }
    }
    return msg;
}
function makeFilename(operatorLabel) {
    return /^(\w+)/.exec(operatorLabel)[1] + '.png';
}
var glit = global.it;
global.it = function (description, specFn, timeout) { };
global.asDiagram = function asDiagram(operatorLabel) {
    return function specFnWithPainter(description, specFn) {
        if (specFn.length === 0) {
            glit(description, function () {
                var outputStreams = [];
                global.rxTestScheduler = new Rx.TestScheduler(function (actual) {
                    if (Array.isArray(actual) && typeof actual[0].frame === 'number') {
                        outputStreams.push({
                            messages: actual.map(postProcessOutputMessage),
                            subscription: { start: 0, end: '100%' }
                        });
                    }
                    return true;
                });
                specFn();
                var inputStreams = getInputStreams(global.rxTestScheduler);
                global.rxTestScheduler.flush();
                inputStreams = updateInputStreamsPostFlush(inputStreams, rxTestScheduler);
                var filename = './tmp/docs/img/' + makeFilename(operatorLabel);
                painter(inputStreams, operatorLabel, outputStreams, filename);
                console.log('Painted ' + filename);
            });
        }
        else {
            throw new Error('Cannot generate PNG marble diagram for async test ' + description);
        }
    };
};
beforeEach(function () {
    jasmine.addMatchers({
        toDeepEqual: function (util, customEqualityTesters) {
            return {
                compare: function (actual, expected) {
                    return { pass: true };
                }
            };
        }
    });
});
afterEach(function () {
    global.rxTestScheduler = null;
});
(function () {
    Object.defineProperty(Error.prototype, 'toJSON', {
        value: function () {
            var alt = {};
            Object.getOwnPropertyNames(this).forEach(function (key) {
                if (key !== 'stack') {
                    alt[key] = this[key];
                }
            }, this);
            return alt;
        },
        configurable: true
    });
    global.__root__ = root;
})();
global.lowerCaseO = function lowerCaseO() {
    var values = [].slice.apply(arguments);
    var o = {
        subscribe: function (observer) {
            values.forEach(function (v) {
                observer.next(v);
            });
            observer.complete();
        }
    };
    o[Symbol.observable] = function () {
        return this;
    };
    return o;
};
//# sourceMappingURL=diagram-test-runner.js.map