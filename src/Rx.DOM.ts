export * from './Rx';

import './add/observable/dom/ajax';
import './add/observable/dom/webSocket';

export {AjaxRequest, AjaxResponse, AjaxError, AjaxTimeoutError} from './observable/dom/AjaxObservable';

// Rebuild `Scheduler` for Rx.DOM
import {asap} from './scheduler/asap';
import {async} from './scheduler/async';
import {queue} from './scheduler/queue';
import {animationFrame} from './scheduler/animationFrame';
/* tslint:disable:no-unused-variable */
import {AsapScheduler} from './scheduler/AsapScheduler';
import {AsyncScheduler} from './scheduler/AsyncScheduler';
import {QueueScheduler} from './scheduler/QueueScheduler';
import {AnimationFrameScheduler} from './scheduler/AnimationFrameScheduler';
/* tslint:enable:no-unused-variable */

export var Scheduler = {
  asap,
  async,
  queue,
  animationFrame
};