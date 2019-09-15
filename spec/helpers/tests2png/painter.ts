/*eslint-disable no-param-reassign, no-use-before-define*/
import { cloneDeep, isEqual } from 'lodash';
// @ts-ignore
import { drawMarbleDiagram } from 'swirly';
// @ts-ignore
import { launch } from 'puppeteer';
import { writeFileSync } from 'fs';
import { TestMessage } from '../../../src/internal/testing/TestMessage';
import { MarbleContent, TestStream } from './types';

const CANVAS_WIDTH: number = 800;
const CANVAS_PADDING: number = 20;
const DEFAULT_MAX_FRAME: number = 10;
const SCALE: number = 2;

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

function stringifyContent(content: MarbleContent): string {
  let string = content;
  if (Array.isArray(content)) {
    string = '[' + content.join(',') + ']';
  } else if (typeof content === 'boolean') {
    return content ? 'true' : 'false';
  } else if (typeof content === 'object') {
    string = JSON.stringify(content).replace(/"/g, '');
  }
  return String(string);
}

function getDuration(maxFrame: number, streamData: TestStream): any {
  const { subscription: { start, end } } = streamData;
  if (typeof end === 'number') {
    maxFrame = Math.max(end, ...streamData.messages.map((message: TestMessage) => start + message.frame));
  }
  return maxFrame - start;
}

function drawObservable(maxFrame: number, streamData: TestStream, isSpecial: boolean): any {
  const { messages, subscription, isGhost } = streamData;
  const color = isGhost ? '#808080' : isSpecial ? '#4040FF' : '#000000';
  const styles = {
    color: color,
    stroke_color: color,
    value_color: color
  };
  return {
    kind: 'S',
    frame: subscription.start / 10,
    duration: getDuration(maxFrame, streamData) / 10,
    messages: messages
      .filter((message: TestMessage) => message.frame >= 0)
      .map((message: TestMessage) => {
        let value = null;
        const kind = message.notification.kind;
        if (kind === 'N') {
          if (isNestedStreamData(message)) {
            value = drawObservable(maxFrame, message.notification.value, false);
          } else {
            value = stringifyContent(message.notification.value);
          }
        }
        return {
          frame: message.frame / 10,
          notification: {
            kind,
            value
          },
          styles
        };
      }),
    styles
  };
}

function drawOperator(label: string) {
  return {
    kind: 'O',
    title: stringifyContent(label)
  };
}

// Remove cold inputStreams which are already nested in some higher order stream
function removeDuplicateInputs(inputStreams: TestStream[], outputStreams: TestStream[]): TestStream[] {
  return inputStreams.filter(function(inputStream) {
    return !inputStreams.concat(outputStreams).some(function(otherStream: TestStream) {
      return otherStream.messages.some(function(msg) {
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

function createHtml(svgXml: string, width: number, height: number): string {
  return `
    <!doctype html>
    <html>
      <head>
        <style>
          html, body { margin: 0; padding: 0; }
          svg { width: ${width}px; height: ${height}px; }
        </style>
      </head>
      <body>
        ${svgXml}
      </body>
    </html>
  `;
}

async function createImage(browser: any, xml: string, width: number, height: number): Promise<Buffer> {
  const page = await browser.newPage();
  const loading = page.waitForNavigation({ waitUntil: 'load' });
  const html = createHtml(xml, width, height);
  await page.setContent(html);
  await loading;
  const imageData = await page.screenshot({
    clip: {
      x: 0,
      y: 0,
      width,
      height
    }
  });
  await page.close();
  return imageData;
}

export async function init() {
  return await launch();
}

export async function dispose(browser: any) {
  await browser.close();
}

export async function paint(inputStreams: TestStream[], operatorLabel: string, outputStreams: TestStream[], filename: string, browser: any) {
  inputStreams = sanitizeHigherOrderInputStreams(inputStreams, outputStreams);

  const allStreams = inputStreams.concat(outputStreams);
  const maxFrame = getMaxFrame(allStreams) || DEFAULT_MAX_FRAME;

  const content: any[] = [
    ...inputStreams.map(streamData => drawObservable(maxFrame, streamData, false)),
    drawOperator(operatorLabel),
    ...outputStreams.map(streamData => {
      const isSpecial = inputStreams.length > 0 && areEqualStreamData(inputStreams[0], streamData);
      return drawObservable(maxFrame, streamData, isSpecial);
    })
  ];

  const { xml, width, height } = drawMarbleDiagram({
    styles: {
      canvas_padding: CANVAS_PADDING,
      frame_width: (CANVAS_WIDTH - CANVAS_PADDING * 2) / (maxFrame / 10)
    },
    content
  });

  const imageData = await createImage(browser, xml, width * SCALE, height * SCALE);
  writeFileSync(filename, imageData, 'utf8');
}
