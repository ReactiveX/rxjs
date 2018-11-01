/*
  NOTE: This is the global export file for rxjs v6 and higher.
 */

/* rxjs and rxjs.operators */
export * from './Rx';

/* rxjs.testing */
import * as _testing from 'rxjs/testing';
export const testing = _testing;

/* rxjs.ajax */
import * as _ajax from 'rxjs/ajax';
export const ajax = _ajax;

/* rxjs.webSocket */
import * as _webSocket from 'rxjs/webSocket';
export const webSocket = _webSocket;
