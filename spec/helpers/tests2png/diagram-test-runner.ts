import { init, dispose, paint } from './painter';
import { Observable } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { TestMessage } from '../../../src/internal/testing/TestMessage';
import { ColdObservable } from '../../../src/internal/testing/ColdObservable';
import { HotObservable } from '../../../src/internal/testing/HotObservable';
import { TestStream } from './types';

declare const global: any;

export const rxTestScheduler: TestScheduler = global.rxTestScheduler;

function getInputStreams(rxTestScheduler: TestScheduler): TestStream[] {
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

function updateInputStreamsPostFlush(inputStreams: TestStream[]) {
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

function postProcessOutputMessage(msg: TestMessage) {
  if (Array.isArray(msg.notification.value)
  && msg.notification.value.length
  && typeof msg.notification.value[0] === 'object') {
    msg.notification.value = {
      messages: msg.notification.value,
      subscription: {start: msg.frame, end: '100%'},
    };
    let completionFrame = msg.notification.value.messages
      .reduce(function (prev: number, x: TestMessage) {
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

function makeFilename(operatorLabel: string) {
  return /^(\w+)/.exec(operatorLabel)[1] + '.png';
}

type glitFn = (description: string, fn: () => void ) => any;
type specFn = () => any;

const initializing = init();
let active = 0;

async function paintWhenReady(inputStreams: TestStream[], operatorLabel: string, outputStreams: TestStream[], filename: string) {
  let screenshotter: any;
  try {
    screenshotter = await initializing;
  } catch (err) {
    console.error(`Failed to initialize screenshotter: ${err}`);
    return;
  }
  ++active;
  try {
    await paint(inputStreams, operatorLabel, outputStreams, filename, screenshotter);
    console.info(`Painted ${filename}`);
  } catch (err) {
    console.error(`Failed to paint ${filename}: ${err}`);
  }
  if (--active === 0) {
    console.info('Disposing screenshotter');
    await dispose(screenshotter);
  }
}

global.asDiagram = function asDiagram(operatorLabel: string, glit: glitFn) {
  return function specFnWithPainter(description: string, specFn: specFn) {
    if (specFn.length === 0) {
      glit(description, function () {
        let outputStreams: TestStream[] = [];
        global.rxTestScheduler = new TestScheduler(function (actual: TestMessage[]) {
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
        let inputStreams = getInputStreams(global.rxTestScheduler);
        global.rxTestScheduler.flush();
        inputStreams = updateInputStreamsPostFlush(inputStreams);
        let filename = './docs_app/content/img/' + makeFilename(operatorLabel);
        paintWhenReady(inputStreams, operatorLabel, outputStreams, filename);
      });
    } else {
      throw new Error('cannot generate PNG marble diagram for async test ' + description);
    }
  };
};
