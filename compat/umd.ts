/*
  NOTE: This is the global export file for rxjs v6 and higher.
 */

/* rxjs */
export * from './Rx';

/* rxjs.operators */
import * as _operators from 'rxjs/operators';
export const operators = _operators;

/* rxjs.testing */
import * as _testing from 'rxjs/testing';
export const testing = _testing;

/* rxjs.ajax */
import * as _ajax from 'rxjs/ajax';
export const ajax = _ajax;

/* rxjs.webSocket */
import * as _webSocket from 'rxjs/webSocket';
export const webSocket = _webSocket;
