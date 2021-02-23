/*
  NOTE: This is the global export file for rxjs v6 and higher.
 */

/* rxjs */
export * from '../index.js';

/* rxjs.operators */
import * as _operators from '../operators/index.js';
export const operators = _operators;

/* rxjs.testing */
import * as _testing from '../testing/index.js';
export const testing = _testing;

/* rxjs.ajax */
import * as _ajax from '../ajax/index.js';
export const ajax = _ajax;

/* rxjs.webSocket */
import * as _webSocket from '../webSocket/index.js';
export const webSocket = _webSocket;

/* rxjs.fetch */
import * as _fetch from '../fetch/index.js';
export const fetch = _fetch;
