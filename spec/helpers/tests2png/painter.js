var gm = require('gm');

var CANVAS_WIDTH = 1280;
var canvasHeight;
var CANVAS_PADDING = 20;
var OBSERVABLE_HEIGHT = 200;
var OPERATOR_HEIGHT = 140;
var ARROW_HEAD_SIZE = 18;
var OBSERVABLE_END_PADDING = 4 * ARROW_HEAD_SIZE;
var MARBLE_RADIUS = 32;
var SIN_45 = 0.707106;
var MESSAGES_WIDTH = (CANVAS_WIDTH - 2 * CANVAS_PADDING - OBSERVABLE_END_PADDING);

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

function drawObservableArrow(out, maxFrame, y, streamData) {
  var startX = CANVAS_PADDING +
    MESSAGES_WIDTH * (streamData.subscription.start / maxFrame);
  var endX = (streamData.subscription.end === '100%') ?
    CANVAS_WIDTH - CANVAS_PADDING :
    CANVAS_PADDING + MESSAGES_WIDTH * (streamData.subscription.end / maxFrame) + OBSERVABLE_END_PADDING;

  out = out.stroke('#000000', 3);
  out = out.drawLine(startX, y, endX, y);
  out = out.drawLine(endX, y, endX - ARROW_HEAD_SIZE * 2, y - ARROW_HEAD_SIZE);
  out = out.drawLine(endX, y, endX - ARROW_HEAD_SIZE * 2, y + ARROW_HEAD_SIZE);
  return out;
}

function drawMarble(out, x, y, content) {
  out = out.stroke('#000000', 3);
  out = out.fill('#82D736');
  out = out.drawEllipse(x, y, MARBLE_RADIUS, MARBLE_RADIUS, 0, 360);

  out = out.strokeWidth(-1);
  out = out.fill('#000000');
  out = out.font('helvetica', 28);
  out = out.draw(
    'translate ' + (x - CANVAS_WIDTH * 0.5) + ',' + (y - canvasHeight * 0.5),
    'gravity Center',
    'text 0,0',
    String('"' + content + '"'));
  return out;
}

function drawError(out, x, y) {
  out = out.stroke('#000000', 3);
  out = out.drawLine(
    x - MARBLE_RADIUS * SIN_45, y - MARBLE_RADIUS * SIN_45,
    x + MARBLE_RADIUS * SIN_45, y + MARBLE_RADIUS * SIN_45);
  out = out.drawLine(
    x + MARBLE_RADIUS * SIN_45, y - MARBLE_RADIUS * SIN_45,
    x - MARBLE_RADIUS * SIN_45, y + MARBLE_RADIUS * SIN_45);
  return out;
}

function drawComplete(out, x, y, maxFrame, streamData) {
  var startX = CANVAS_PADDING +
    MESSAGES_WIDTH * (streamData.subscription.start / maxFrame);
  var isOverlapping = streamData.messages.some(function (msg) {
    if (msg.notification.kind !== 'N') { return false; }
    var msgX = startX + MESSAGES_WIDTH * (msg.frame / maxFrame);
    return Math.abs(msgX - x) < MARBLE_RADIUS;
  });
  var radius = isOverlapping ? 1.8 * MARBLE_RADIUS : MARBLE_RADIUS;
  out = out.stroke('#000000', 3);
  out = out.drawLine(
    x, y - radius,
    x, y + radius);
  return out;
}

function drawObservableMessages(out, maxFrame, y, streamData) {
  var startX = CANVAS_PADDING +
    MESSAGES_WIDTH * (streamData.subscription.start / maxFrame);

  streamData.messages.slice().reverse().forEach(function (message) {
    var x = startX + MESSAGES_WIDTH * (message.frame / maxFrame);
    switch (message.notification.kind) {
    case 'N': out = drawMarble(out, x, y, message.notification.value); break;
    case 'E': out = drawError(out, x, y); break;
    case 'C': out = drawComplete(out, x, y, maxFrame, streamData); break;
    default: break;
    }
  });
  return out;
}

function drawInputObservable(out, maxFrame, index, streamData) {
  var y = OBSERVABLE_HEIGHT * (index + 0.5);
  out = drawObservableArrow(out, maxFrame, y, streamData);
  out = drawObservableMessages(out, maxFrame, y, streamData);
  return out;
}

function drawOutputObservable(out, maxFrame, numInputs, streamData) {
  var y = (numInputs + 0.5) * OBSERVABLE_HEIGHT + OPERATOR_HEIGHT;
  out = drawObservableArrow(out, maxFrame, y, streamData);
  out = drawObservableMessages(out, maxFrame, y, streamData);
  return out;
}

function drawOperator(out, label, numInputs) {
  var y = numInputs * OBSERVABLE_HEIGHT + OPERATOR_HEIGHT * 0.5;
  out = out.stroke('#000000', 3);
  out = out.fill('#FFFFFF00');
  out = out.drawRectangle(
    CANVAS_PADDING, y - OPERATOR_HEIGHT * 0.5,
    CANVAS_WIDTH - CANVAS_PADDING, y + OPERATOR_HEIGHT * 0.5);
  out = out.strokeWidth(-1);
  out = out.fill('#000000');
  out = out.font('helvetica', 54);
  out = out.draw(
    'translate 0,' + (y - canvasHeight * 0.5),
    'gravity Center',
    'text 0,0',
    String('"' + label + '"'));
  return out;
}

module.exports = function painter(inputStreams, operatorLabel, outputStream) {
  var maxFrame = getMaxFrame(inputStreams.concat(outputStream));
  canvasHeight =
    inputStreams.length * OBSERVABLE_HEIGHT +
    OPERATOR_HEIGHT +
    OBSERVABLE_HEIGHT;

  var out;
  out = gm(CANVAS_WIDTH, canvasHeight, '#ffffff');
  inputStreams.forEach(function (inputTestMessages, index) {
    out = drawInputObservable(out, maxFrame, index, inputTestMessages);
  });
  out = drawOperator(out, operatorLabel, inputStreams.length);
  out = drawOutputObservable(out, maxFrame, inputStreams.length, outputStream);

  out.write('./img/' + operatorLabel + '.png', function (err) {
    if (err) {
      return console.error(arguments);
    }
    //console.log(this.outname + ' created  :: ' + arguments[3]);
  });
};
