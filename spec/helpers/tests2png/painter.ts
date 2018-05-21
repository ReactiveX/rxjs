/*eslint-disable no-param-reassign, no-use-before-define*/
// @ts-ignore
import * as gm from 'gm';
// @ts-ignore
import * as Color from 'color';
import { cloneDeep, isEqual} from 'lodash';
import { TestMessage } from '../../../src/internal/testing/TestMessage';
import { Observable } from 'rxjs';
import { GMObject, MarbleContent, TestStream } from './types';

let canvasHeight: number | undefined;
const CANVAS_WIDTH: number = 1280;
const CANVAS_PADDING: number = 20;
const OBSERVABLE_HEIGHT: number = 200;
const OPERATOR_HEIGHT: number = 140;
const ARROW_HEAD_SIZE: number = 18;
const DEFAULT_MAX_FRAME: number = 10;
const OBSERVABLE_END_PADDING: number = 5 * ARROW_HEAD_SIZE;
const MARBLE_RADIUS: number = 32;
const COMPLETE_HEIGHT: number = MARBLE_RADIUS;
const TALLER_COMPLETE_HEIGHT: number = 1.8 * MARBLE_RADIUS;
const SIN_45: number = 0.707106;
const NESTED_STREAM_ANGLE: number = 18; // degrees
const TO_RAD: number = (Math.PI / 180);
const MESSAGES_WIDTH: number = (CANVAS_WIDTH - 2 * CANVAS_PADDING - OBSERVABLE_END_PADDING);
const BLACK_COLOR: string = '#101010';
const COLORS: string[] = ['#3EA1CB', '#FFCB46', '#FF6946', '#82D736'];
const SPECIAL_COLOR: string = '#1010F0';
const MESSAGE_OVERLAP_HEIGHT: number = TALLER_COMPLETE_HEIGHT;

function colorToGhostColor(hex: string) {
  const c = Color(hex).mix(Color('white'));
  return c.toString(16);
}

function getMaxFrame(allStreams: TestStream[]): number {
  let allStreamsLen = allStreams.length;
  let max = 0;
  for (let i = 0; i < allStreamsLen; i++) {
    let messagesLen = allStreams[i].messages.length;
    for (let j = 0; j < messagesLen; j++) {
      if (allStreams[i].messages[j].frame > max) {
        max = allStreams[i].messages[j].frame;
      }
    }
  }
  return max;
}

function stringToColor(str: string) {
  let smallPrime1 = 59;
  let smallPrime2 = 97;
  let hash = str.split('')
    .map(function (x) { return x.charCodeAt(0); })
    .reduce(function (x, y) { return (x * smallPrime1) + (y * smallPrime2); }, 1);
  return COLORS[hash % COLORS.length];
}

function isNestedStreamData(message: TestMessage): boolean {
  return message.notification.kind === 'N' &&
    message.notification.value &&
    message.notification.value.messages;
}

function areEqualStreamData(leftStreamData: TestStream, rightStreamData: TestStream): boolean {
  if (leftStreamData.messages.length !== rightStreamData.messages.length) {
    return false;
  }
  for (let i = 0; i < leftStreamData.messages.length; i++) {
    let left = leftStreamData.messages[i];
    let right = rightStreamData.messages[i];
    if (left.frame !== right.frame) {
      return false;
    }
    if (left.notification.kind !== right.notification.kind) {
      return false;
    }
    if (left.notification.value !== right.notification.value) {
      return false;
    }
  }
  return true;
}

function measureObservableArrow(maxFrame: number, streamData: TestStream): { startX: number, endX: number } {
  let startX = CANVAS_PADDING +
    MESSAGES_WIDTH * (streamData.subscription.start / maxFrame);
  let MAX_MESSAGES_WIDTH = CANVAS_WIDTH - CANVAS_PADDING;
  let lastMessageFrame = streamData.messages
    .reduce(function (acc, msg) {
      let frame = msg.frame;
      return frame > acc ? frame : acc;
    }, 0);
  let subscriptionEndX = typeof streamData.subscription.end === 'number' ? CANVAS_PADDING +
      MESSAGES_WIDTH * (streamData.subscription.end / maxFrame) +
      OBSERVABLE_END_PADDING : undefined;
  let streamEndX = startX +
    MESSAGES_WIDTH * (lastMessageFrame / maxFrame) +
    OBSERVABLE_END_PADDING;
  let endX = (streamData.subscription.end === '100%') ?
    MAX_MESSAGES_WIDTH :
    Math.max(streamEndX, subscriptionEndX);

  return {startX: startX, endX: endX};
}

function measureInclination(startX: number, endX: number, angle: number): number {
  let length = endX - startX;
  let cotAngle = Math.cos(angle * TO_RAD) / Math.sin(angle * TO_RAD);
  return (length / cotAngle);
}

function measureNestedStreamHeight(maxFrame: number, streamData: TestStream): number {
  let measurements = measureObservableArrow(maxFrame, streamData);
  let startX = measurements.startX;
  let endX = measurements.endX;
  return measureInclination(startX, endX, NESTED_STREAM_ANGLE);
}

function amountPriorOverlaps(message: TestMessage, messageIndex: number, otherMessages: TestMessage[]): number {
  return otherMessages.reduce(function (acc: number, otherMessage: TestMessage, otherIndex) {
    if (otherIndex < messageIndex
    && otherMessage.frame === message.frame
    && message.notification.kind === 'N'
    && otherMessage.notification.kind === 'N') {
      return acc + 1;
    }
    return acc;
  }, 0);
}

function measureStreamHeight(maxFrame: number): (streamData: TestStream) => number {
  return function measureStreamHeightWithMaxFrame(streamData: TestStream): number {
    let messages = streamData.messages;
    let maxMessageHeight = messages
      .map(function (msg: TestMessage, index) {
        let height = isNestedStreamData(msg) ?
          measureNestedStreamHeight(maxFrame, msg.notification.value) + OBSERVABLE_HEIGHT * 0.25 :
          OBSERVABLE_HEIGHT * 0.5;
        let overlapHeightBonus = amountPriorOverlaps(msg, index, messages) * MESSAGE_OVERLAP_HEIGHT;
        return height + overlapHeightBonus;
      })
      .reduce(function (acc, curr) {
        return curr > acc ? curr : acc;
      }, 0);
    maxMessageHeight = Math.max(maxMessageHeight, OBSERVABLE_HEIGHT * 0.5); // to avoid zero
    return OBSERVABLE_HEIGHT * 0.5 + maxMessageHeight;
  };
}

function drawObservableArrow(out: GMObject, maxFrame: number, y: number, angle: number, streamData: TestStream, isSpecial: boolean): GMObject {
  let measurements = measureObservableArrow(maxFrame, streamData);
  let startX = measurements.startX;
  let endX = measurements.endX;

  let outlineColor = BLACK_COLOR;
  if (isSpecial) {
    outlineColor = SPECIAL_COLOR;
  }
  if (streamData.isGhost) {
    outlineColor = colorToGhostColor(outlineColor);
  }
  out = out.stroke(outlineColor, 3);
  let inclination = measureInclination(startX, endX, angle);
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

function stringifyContent(content: MarbleContent): string {
  let string = content;
  if (Array.isArray(content)) {
    string = '[' + content.join(',') + ']';
  } else if (typeof content === 'boolean') {
    return content ? 'true' : 'false';
  } else if (typeof content === 'object') {
    string = JSON.stringify(content).replace(/"/g, '');
  }
  return String('"' + string + '"');
}

function drawMarble(out: GMObject, x: number, y: number, inclination: number, content: MarbleContent, isSpecial: boolean, isGhost: boolean) {
  let fillColor = stringToColor(stringifyContent(content));
  let outlineColor = BLACK_COLOR;
  if (isSpecial) {
    outlineColor = SPECIAL_COLOR;
  }
  if (isGhost) {
    outlineColor = colorToGhostColor(outlineColor);
    fillColor = colorToGhostColor(fillColor);
  }
  out = out.stroke(outlineColor, 3);
  out = out.fill(fillColor);
  out = out.drawEllipse(x, y + inclination, MARBLE_RADIUS, MARBLE_RADIUS, 0, 360);

  out = out.strokeWidth(-1);
  out = out.fill(outlineColor);
  out = out.font('helvetica', 28);
  out = out.draw(
    'translate ' + (x - CANVAS_WIDTH * 0.5) + ',' + (y + inclination - canvasHeight * 0.5),
    'gravity Center',
    'text 0,0',
    stringifyContent(content));
  return out;
}

function drawError(out: GMObject, x: number, y: number, startX: number, angle: number, isSpecial: boolean, isGhost: boolean) {
  let inclination = measureInclination(startX, x, angle);
  let outlineColor = BLACK_COLOR;
  if (isSpecial) {
    outlineColor = SPECIAL_COLOR;
  }
  if (isGhost) {
    outlineColor = colorToGhostColor(outlineColor);
  }
  out = out.stroke(outlineColor, 3);
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

function drawComplete(out: GMObject, x: number, y: number,
                      maxFrame: number, angle: number, streamData: TestStream,
                      isSpecial: boolean, isGhost: boolean) {
  let startX = CANVAS_PADDING +
    MESSAGES_WIDTH * (streamData.subscription.start / maxFrame);
  let isOverlapping = streamData.messages.some(function (msg) {
    if (msg.notification.kind !== 'N') { return false; }
    let msgX = startX + MESSAGES_WIDTH * (msg.frame / maxFrame);
    return Math.abs(msgX - x) < MARBLE_RADIUS;
  });
  let outlineColor = BLACK_COLOR;
  if (isSpecial) {
    outlineColor = SPECIAL_COLOR;
  }
  if (isGhost) {
    outlineColor = colorToGhostColor(outlineColor);
  }
  let inclination = measureInclination(startX, x, angle);
  let radius = isOverlapping ? TALLER_COMPLETE_HEIGHT : COMPLETE_HEIGHT;
  out = out.stroke(outlineColor, 3);
  out = out.draw(
    'translate', String(x) + ',' + String(y + inclination),
    'rotate ' + String(angle),
    'line',
      String(0) + ',' + String(-radius),
      String(0) + ',' + String(+radius));
  return out;
}

function drawNestedObservable(out: GMObject, maxFrame: number, y: number, streamData: TestStream): GMObject {
  let angle = NESTED_STREAM_ANGLE;
  out = drawObservableArrow(out, maxFrame, y, angle, streamData, false);
  out = drawObservableMessages(out, maxFrame, y, angle, streamData, false);
  return out;
}

function drawObservableMessages(out: GMObject, maxFrame: number, baseY: number, angle: number, streamData: TestStream, isSpecial: boolean): GMObject {
  let startX = CANVAS_PADDING +
    MESSAGES_WIDTH * (streamData.subscription.start / maxFrame);
  let messages = streamData.messages;

  messages.slice().reverse().forEach(function (message: TestMessage, reversedIndex: number) {
    if (message.frame < 0) { // ignore messages with negative frames
      return;
    }
    let index = messages.length - reversedIndex - 1;
    let x = startX + MESSAGES_WIDTH * (message.frame / maxFrame);
    if (x - MARBLE_RADIUS < 0) { // out of screen, on the left
      x += MARBLE_RADIUS;
    }
    let y = baseY + amountPriorOverlaps(message, index, messages) * MESSAGE_OVERLAP_HEIGHT;
    let inclination = measureInclination(startX, x, angle);
    switch (message.notification.kind) {
    case 'N':
      if (isNestedStreamData(message)) {
        out = drawNestedObservable(out, maxFrame, y, message.notification.value);
      } else {
        out = drawMarble(out, x, y, inclination, message.notification.value, isSpecial, streamData.isGhost);
      }
      break;
    case 'E': out = drawError(out, x, y, startX, angle, isSpecial, streamData.isGhost); break;
    case 'C': out = drawComplete(out, x, y, maxFrame, angle, streamData, isSpecial, streamData.isGhost); break;
    default: break;
    }
  });
  return out;
}

function drawObservable(out: GMObject, maxFrame: number, y: number, streamData: TestStream, isSpecial: boolean): GMObject {
  let offsetY = OBSERVABLE_HEIGHT * 0.5;
  let angle = 0;
  out = drawObservableArrow(out, maxFrame, y + offsetY, angle, streamData, isSpecial);
  out = drawObservableMessages(out, maxFrame, y + offsetY, angle, streamData, isSpecial);
  return out;
}

function drawOperator(out: GMObject, label: string, y: number): GMObject {
  out = out.stroke(BLACK_COLOR, 3);
  out = out.fill('#FFFFFF00');
  out = out.drawRectangle(
    CANVAS_PADDING, y,
    CANVAS_WIDTH - CANVAS_PADDING, y + OPERATOR_HEIGHT);
  out = out.strokeWidth(-1);
  out = out.fill(BLACK_COLOR);
  out = out.font('helvetica', 54);
  out = out.draw(
    'translate 0,' + (y + OPERATOR_HEIGHT * 0.5 - canvasHeight * 0.5),
    'gravity Center',
    'text 0,0',
    stringifyContent(label));
  return out;
}

// Remove cold inputStreams which are already nested in some higher order stream
function removeDuplicateInputs(inputStreams: TestStream[], outputStreams: TestStream[]): TestStream[] {
  return inputStreams.filter(function (inputStream) {
    return !inputStreams.concat(outputStreams).some(function (otherStream: TestStream) {
      return otherStream.messages.some(function (msg) {
        let passes = isNestedStreamData(msg) &&
          inputStream.cold &&
          isEqual(msg.notification.value.messages, inputStream.cold.messages);
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

// For every inner stream in a higher order stream, create its ghost version
// A ghost stream is a reference to an Observable that has not yet executed,
// and is painted as a semi-transparent stream.
function addGhostInnerInputs(inputStreams: TestStream[]): TestStream[] {
  for (let i = 0; i < inputStreams.length; i++) {
    let inputStream = inputStreams[i];
    for (let j = 0; j < inputStream.messages.length; j++) {
      let message = inputStream.messages[j];
      if (isNestedStreamData(message) && typeof message.isGhost !== 'boolean') {
        let referenceTime = message.frame;
        if (!message.notification.value.subscription) {
          // There was no subscription at all, so this nested Observable is ghost
          message.isGhost = true;
          message.notification.value.isGhost = true;
          message.frame = referenceTime;
          message.notification.value.subscription = { start: referenceTime, end: 0 };
          continue;
        }
        let subscriptionTime = message.notification.value.subscription.start;
        if (referenceTime !== subscriptionTime) {
          message.isGhost = false;
          message.notification.value.isGhost = false;
          message.frame = subscriptionTime;

          let ghost = cloneDeep(message);
          ghost.isGhost = true;
          ghost.notification.value.isGhost = true;
          ghost.frame = referenceTime;
          ghost.notification.value.subscription.start = referenceTime;
          ghost.notification.value.subscription.end -= subscriptionTime - referenceTime;
          inputStream.messages.push(ghost);
        }
      }
    }
  }
  return inputStreams;
}

function sanitizeHigherOrderInputStreams(inputStreams: TestStream[], outputStreams: TestStream[]): TestStream[] {
  let newInputStreams = removeDuplicateInputs(inputStreams, outputStreams);
  newInputStreams = addGhostInnerInputs(newInputStreams);
  return newInputStreams;
}

export function painter(inputStreams: TestStream[], operatorLabel: string, outputStreams: TestStream[], filename: string) {
  inputStreams = sanitizeHigherOrderInputStreams(inputStreams, outputStreams);
  const maxFrame = getMaxFrame(inputStreams.concat(outputStreams)) || DEFAULT_MAX_FRAME;
  let allStreamsHeight = inputStreams.concat(outputStreams)
    .map(measureStreamHeight(maxFrame))
    .reduce(function (x, y) { return x + y; }, 0);
  canvasHeight = allStreamsHeight + OPERATOR_HEIGHT;

  let heightSoFar = 0;
  let out: GMObject =  gm(CANVAS_WIDTH, canvasHeight, '#ffffff');
  inputStreams.forEach(function (streamData) {
    out = drawObservable(out, maxFrame, heightSoFar, streamData, false);
    heightSoFar += measureStreamHeight(maxFrame)(streamData);
  });
  out = drawOperator(out, operatorLabel, heightSoFar);
  heightSoFar += OPERATOR_HEIGHT;
  outputStreams.forEach(function (streamData) {
    let isSpecial = inputStreams.length > 0 && areEqualStreamData(inputStreams[0], streamData);
    out = drawObservable(out, maxFrame, heightSoFar, streamData, isSpecial);
    heightSoFar += measureStreamHeight(maxFrame)(streamData);
  });
  out.write(filename, function (err: Error) {
    if (err) {
      return console.error(arguments);
    }
  });
}
