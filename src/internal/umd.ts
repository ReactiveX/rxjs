/*
  NOTE: This is the global export file for rxjs v6 and higher.
 */

/* rxjs */
export * from '../';

/* rxjs.operators */
import * as _operators from '../operators';
export const operators = _operators;

/* rxjs.testing */
import * as _testing from '../testing';
export const testing = _testing;

/* rxjs.ajax */
import * as _ajax from '../ajax';
export const ajax = _ajax;

/* rxjs.websocket */
import * as _websocket from '../websocket';
export const websocket = _websocket;
