var root = require('../../../dist/package/util/root').root;
var Rx = require('../../../dist/package/Rx');
var painter = require('./painter');

function getInputStreams(rxTestScheduler) {
  return Array.prototype.concat.call([],
    rxTestScheduler.hotObservables
      .map(function (hot) {
        return {
          messages: hot.messages,
          subscription: {start: 0, end: '100%'},
        };
      })
      .slice(),
    rxTestScheduler.coldObservables
      .map(function (cold) {
        return {
          messages: cold.messages,
          cold: cold,
        };
      })
      .slice()
  );
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
      subscription: {start: msg.frame, end: '100%'},
    };
    var completionFrame = msg.notification.value.messages
      .reduce(function (prev, x) {
        if (x.notification && x.notification.kind === 'C' && x.frame > prev) {
          return x.frame;
        } else {
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

global.asDiagram = function asDiagram(operatorLabel, glit) {
  return function specFnWithPainter(description, specFn) {
    if (specFn.length === 0) {
      glit(description, function () {
        var outputStreams = [];
        global.rxTestScheduler = new Rx.TestScheduler(function (actual) {
          if (Array.isArray(actual) && actual.length > 0 && typeof actual[0].frame === 'number') {
            outputStreams.push({
              messages: actual.map(postProcessOutputMessage),
              subscription: {start: 0, end: '100%'}
            });
          } else if (Array.isArray(actual) && actual.length === 0) { // is the never Observable
            outputStreams.push({
              messages: [],
              subscription: {start: 0, end: '100%'}
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
    } else {
      throw new Error('cannot generate PNG marble diagram for async test ' + description);
    }
  };
};
