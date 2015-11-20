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

function getMaxFrame() {
  var argsLength = arguments.length;
  var max = 0;
  for (var i = 0; i < argsLength; i++) {
    var messagesLen = arguments[i].length;
    for (var j = 0; j < messagesLen; j++) {
      if (arguments[i][j].frame > max) {
        max = arguments[i][j].frame;
      }
    }
  }
  return max;
}

function drawObservableArrow(out, y) {
  out = out.stroke('#000000', 3);
  out = out.drawLine(
    CANVAS_PADDING,
    y,
    CANVAS_WIDTH - CANVAS_PADDING,
    y);
  out = out.drawLine(
    CANVAS_WIDTH - CANVAS_PADDING,
    y,
    CANVAS_WIDTH - CANVAS_PADDING - ARROW_HEAD_SIZE * 2,
    y - ARROW_HEAD_SIZE);
  out = out.drawLine(
    CANVAS_WIDTH - CANVAS_PADDING,
    y,
    CANVAS_WIDTH - CANVAS_PADDING - ARROW_HEAD_SIZE * 2,
    y + ARROW_HEAD_SIZE);
  return out;
}

function drawObservableMessages(out, maxFrame, messages, y) {
  var messagesWidth = (CANVAS_WIDTH - 2 * CANVAS_PADDING - OBSERVABLE_END_PADDING);
  messages.forEach(function (message) {
    var x = messagesWidth * (message.frame / maxFrame);
    switch (message.notification.kind) {
      case 'N':
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
          String('"'+message.notification.value+'"'));
        break;

      case 'E':
        out = out.stroke('#000000', 3);
        out = out.drawLine(
          x - MARBLE_RADIUS * SIN_45, y - MARBLE_RADIUS * SIN_45,
          x + MARBLE_RADIUS * SIN_45, y + MARBLE_RADIUS * SIN_45);
        out = out.drawLine(
          x + MARBLE_RADIUS * SIN_45, y - MARBLE_RADIUS * SIN_45,
          x - MARBLE_RADIUS * SIN_45, y + MARBLE_RADIUS * SIN_45);
        break;

      case 'C':
        out = out.stroke('#000000', 3);
        out = out.drawLine(x, y - MARBLE_RADIUS, x, y + MARBLE_RADIUS);
        break;
    }
  });
  return out;
}

function drawInputObservable(out, testMessages, index, maxFrame) {
  var y = OBSERVABLE_HEIGHT * (index + 0.5);
  out = drawObservableArrow(out, y);
  out = drawObservableMessages(out, maxFrame, testMessages, y);
  return out;
}

function drawOutputObservable(out, testMessages, numInputs, maxFrame) {
  var y = (numInputs + 0.5) * OBSERVABLE_HEIGHT + OPERATOR_HEIGHT;
  out = drawObservableArrow(out, y);
  out = drawObservableMessages(out, maxFrame, testMessages, y);
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
  var maxFrame = getMaxFrame(inputStreams, outputStream);
  canvasHeight =
    inputStreams.length * OBSERVABLE_HEIGHT +
    OPERATOR_HEIGHT +
    OBSERVABLE_HEIGHT;

  var out;
  out = gm(CANVAS_WIDTH, canvasHeight, '#ffffff');
  inputStreams.forEach(function (inputTestMessages, index) {
    out = drawInputObservable(out, inputTestMessages, index, maxFrame);
  });
  out = drawOperator(out, operatorLabel, inputStreams.length);
  out = drawOutputObservable(out, outputStream, inputStreams.length, maxFrame);

  out.write('./img/' + operatorLabel + '.png', function (err) {
    if (err) {
      return console.error(arguments);
    }
    //console.log(this.outname + ' created  :: ' + arguments[3]);
  });
};
