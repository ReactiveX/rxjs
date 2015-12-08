/*eslint-disable no-param-reassign, no-use-before-define*/
var gm = require('gm');
var _ = require('lodash');

var CANVAS_WIDTH = 1280;
var canvasHeight;
var CANVAS_PADDING = 20;
var OBSERVABLE_HEIGHT = 200;
var OPERATOR_HEIGHT = 140;
var ARROW_HEAD_SIZE = 18;
var OBSERVABLE_END_PADDING = 5 * ARROW_HEAD_SIZE;
var MARBLE_RADIUS = 32;
var SIN_45 = 0.707106;
var NESTED_STREAM_ANGLE = 18; // degrees
var TO_RAD = (Math.PI / 180);
var MESSAGES_WIDTH = (CANVAS_WIDTH - 2 * CANVAS_PADDING - OBSERVABLE_END_PADDING);
var COLORS = ['#3EA1CB', '#FFCB46', '#FF6946', '#82D736'];

function getMaxFrame(allStreams) {
  var allStreamsLen = allStreams.length;
  var max = 0;
  for (var i = 0; i < allStreamsLen; i++) {
    var messagesLen = allStreams[i].messages.length;
    for (var j = 0; j < messagesLen; j++) {
      if (allStreams[i].messages[j].frame > max) {
        max = allStreams[i].messages[j].frame;
      }
    }
  }
  return max;
}

function stringToColor(str) {
  var smallPrime1 = 59;
  var smallPrime2 = 97;
  var hash = str.split('')
    .map(function (x) { return x.charCodeAt(0); })
    .reduce(function (x, y) { return (x * smallPrime1) + (y * smallPrime2); }, 1);
  return COLORS[hash % COLORS.length];
}

function isNestedStreamData(message) {
  return message.notification.kind === 'N' &&
    message.notification.value &&
    message.notification.value.messages;
}

function measureObservableArrow(maxFrame, streamData) {
  var startX = CANVAS_PADDING +
    MESSAGES_WIDTH * (streamData.subscription.start / maxFrame);
  var MAX_MESSAGES_WIDTH = CANVAS_WIDTH - CANVAS_PADDING;
  var lastMessageFrame = streamData.messages
    .reduce(function (acc, msg) {
      var frame = msg.frame;
      return frame > acc ? frame : acc;
    }, 0);
  var subscriptionEndX = CANVAS_PADDING +
    MESSAGES_WIDTH * (streamData.subscription.end / maxFrame) +
    OBSERVABLE_END_PADDING;
  var streamEndX = startX +
    MESSAGES_WIDTH * (lastMessageFrame / maxFrame) +
    OBSERVABLE_END_PADDING;
  var endX = (streamData.subscription.end === '100%') ?
    MAX_MESSAGES_WIDTH :
    Math.max(streamEndX, subscriptionEndX);

  return {startX: startX, endX: endX};
}

function measureInclination(startX, endX, angle) {
  var length = endX - startX;
  var cotAngle = Math.cos(angle * TO_RAD) / Math.sin(angle * TO_RAD);
  return (length / cotAngle);
}

function measureNestedStreamHeight(maxFrame, streamData) {
  var measurements = measureObservableArrow(maxFrame, streamData);
  var startX = measurements.startX;
  var endX = measurements.endX;
  return measureInclination(startX, endX, NESTED_STREAM_ANGLE);
}

function measureStreamHeight(maxFrame) {
  return function measureStreamHeightWithMaxFrame(streamData) {
    var maxMessageHeight = streamData.messages
      .map(function (message) {
        return isNestedStreamData(message) ?
          measureNestedStreamHeight(maxFrame, message.notification.value) + OBSERVABLE_HEIGHT * 0.25 :
          OBSERVABLE_HEIGHT * 0.5;
      })
      .reduce(function (acc, curr) {
        return curr > acc ? curr : acc;
      }, 0);
    return OBSERVABLE_HEIGHT * 0.5 + maxMessageHeight;
  };
}

function drawObservableArrow(out, maxFrame, y, angle, streamData) {
  var measurements = measureObservableArrow(maxFrame, streamData);
  var startX = measurements.startX;
  var endX = measurements.endX;

  out = out.stroke('#000000', 3);
  var inclination = measureInclination(startX, endX, angle);
  out = out.drawLine(startX, y, endX, y + inclination);
  out = out.draw(
    'translate', String(endX) + ',' + String(y + inclination),
    'rotate ' + String(angle),
    'line',
      String(0) + ',' + String(0),
      String(-ARROW_HEAD_SIZE * 2) + ',' + String(-ARROW_HEAD_SIZE),
    'line',
      String(0) + ',' + String(0),
      String(-ARROW_HEAD_SIZE * 2) + ',' + String(+ARROW_HEAD_SIZE));
  return out;
}

function drawMarble(out, x, y, inclination, content) {
  out = out.stroke('#000000', 3);
  out = out.fill(stringToColor(String(content)));
  out = out.drawEllipse(x, y + inclination, MARBLE_RADIUS, MARBLE_RADIUS, 0, 360);

  out = out.strokeWidth(-1);
  out = out.fill('#000000');
  out = out.font('helvetica', 28);
  out = out.draw(
    'translate ' + (x - CANVAS_WIDTH * 0.5) + ',' + (y + inclination - canvasHeight * 0.5),
    'gravity Center',
    'text 0,0',
    String('"' + content + '"'));
  return out;
}

function drawError(out, x, y, startX, angle) {
  var inclination = measureInclination(startX, x, angle);
  out = out.stroke('#000000', 3);
  out = out.draw(
    'translate', String(x) + ',' + String(y + inclination),
    'rotate ' + String(angle),
    'line',
      String(-MARBLE_RADIUS * SIN_45) + ',' + String(-MARBLE_RADIUS * SIN_45),
      String(+MARBLE_RADIUS * SIN_45) + ',' + String(+MARBLE_RADIUS * SIN_45),
    'line',
      String(+MARBLE_RADIUS * SIN_45) + ',' + String(-MARBLE_RADIUS * SIN_45),
      String(-MARBLE_RADIUS * SIN_45) + ',' + String(+MARBLE_RADIUS * SIN_45));
  return out;
}

function drawComplete(out, x, y, maxFrame, angle, streamData) {
  var startX = CANVAS_PADDING +
    MESSAGES_WIDTH * (streamData.subscription.start / maxFrame);
  var isOverlapping = streamData.messages.some(function (msg) {
    if (msg.notification.kind !== 'N') { return false; }
    var msgX = startX + MESSAGES_WIDTH * (msg.frame / maxFrame);
    return Math.abs(msgX - x) < MARBLE_RADIUS;
  });
  var inclination = measureInclination(startX, x, angle);
  var radius = isOverlapping ? 1.8 * MARBLE_RADIUS : MARBLE_RADIUS;
  out = out.stroke('#000000', 3);
  out = out.draw(
    'translate', String(x) + ',' + String(y + inclination),
    'rotate ' + String(angle),
    'line',
      String(0) + ',' + String(-radius),
      String(0) + ',' + String(+radius));
  return out;
}

function drawNestedObservable(out, maxFrame, y, streamData) {
  var angle = NESTED_STREAM_ANGLE;
  out = drawObservableArrow(out, maxFrame, y, angle, streamData);
  out = drawObservableMessages(out, maxFrame, y, angle, streamData);
  return out;
}

function drawObservableMessages(out, maxFrame, y, angle, streamData) {
  var startX = CANVAS_PADDING +
    MESSAGES_WIDTH * (streamData.subscription.start / maxFrame);

  streamData.messages.slice().reverse().forEach(function (message) {
    var x = startX + MESSAGES_WIDTH * (message.frame / maxFrame);
    var inclination = measureInclination(startX, x, angle);
    switch (message.notification.kind) {
    case 'N':
      if (isNestedStreamData(message)) {
        out = drawNestedObservable(out, maxFrame, y, message.notification.value);
      } else {
        out = drawMarble(out, x, y, inclination, message.notification.value);
      }
      break;
    case 'E': out = drawError(out, x, y, startX, angle); break;
    case 'C': out = drawComplete(out, x, y, maxFrame, angle, streamData); break;
    default: break;
    }
  });
  return out;
}

function drawObservable(out, maxFrame, y, streamData) {
  var offsetY = OBSERVABLE_HEIGHT * 0.5;
  var angle = 0;
  out = drawObservableArrow(out, maxFrame, y + offsetY, angle, streamData);
  out = drawObservableMessages(out, maxFrame, y + offsetY, angle, streamData);
  return out;
}

function drawOperator(out, label, y) {
  out = out.stroke('#000000', 3);
  out = out.fill('#FFFFFF00');
  out = out.drawRectangle(
    CANVAS_PADDING, y,
    CANVAS_WIDTH - CANVAS_PADDING, y + OPERATOR_HEIGHT);
  out = out.strokeWidth(-1);
  out = out.fill('#000000');
  out = out.font('helvetica', 54);
  out = out.draw(
    'translate 0,' + (y + OPERATOR_HEIGHT * 0.5 - canvasHeight * 0.5),
    'gravity Center',
    'text 0,0',
    String('"' + label + '"'));
  return out;
}

function sanitizeHigherOrderInputStreams(inputStreams, outputStream) {
  // Remove cold inputStreams which are already nested in some higher order stream
  return inputStreams.filter(function (inputStream) {
    return !inputStreams.concat([outputStream]).some(function (otherStream) {
      return otherStream.messages.some(function (msg) {
        var passes = isNestedStreamData(msg) &&
          inputStream.cold &&
          _.isEqual(msg.notification.value.messages, inputStream.cold.messages);
        if (passes) {
          if (inputStream.cold.subscriptions.length) {
            msg.notification.value.subscription = {
              start: inputStream.cold.subscriptions[0].subscribedFrame,
              end: inputStream.cold.subscriptions[0].unsubscribedFrame
            };
          }
        }
        return passes;
      });
    });
  });
}

module.exports = function painter(inputStreams, operatorLabel, outputStream, filename) {
  var maxFrame = getMaxFrame(inputStreams.concat(outputStream));
  inputStreams = sanitizeHigherOrderInputStreams(inputStreams, outputStream);
  var inputStreamsHeight = inputStreams
    .map(measureStreamHeight(maxFrame))
    .reduce(function (x, y) { return x + y; }, 0);
  canvasHeight = inputStreamsHeight + OPERATOR_HEIGHT + measureStreamHeight(maxFrame)(outputStream);

  var heightSoFar = 0;
  var out;
  out = gm(CANVAS_WIDTH, canvasHeight, '#ffffff');
  inputStreams.forEach(function (streamData) {
    out = drawObservable(out, maxFrame, heightSoFar, streamData);
    heightSoFar += measureStreamHeight(maxFrame)(streamData);
  });
  out = drawOperator(out, operatorLabel, heightSoFar);
  heightSoFar += OPERATOR_HEIGHT;
  out = drawObservable(out, maxFrame, heightSoFar, outputStream);

  out.write('./img/' + filename + '.png', function (err) {
    if (err) {
      return console.error(arguments);
    }
    console.log(this.outname + ' created :: ' + arguments[3]);
  });
};
