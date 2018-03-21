import { Observable } from '../Observable';
import {  EmptyObservable } from './EmptyObservable';

/**
 * Observable instance always typed to `never` to be forward compatible with RxJS v6. Simlar
 * to calling {@link empty} without a {@link Scheduler}. It is preferrable to use this over
 * `empty()`.
 */
export const EMPTY = new Observable<never>();

export const empty = EmptyObservable.create;