import {BoundCallbackObservable} from '../../../src/observable/bindCallback';
import {Observable} from '../../../src/Observable';
import {asap} from '../../../src/scheduler/asap';

type t = { a: string };
type t2 = { b: string };
type t3 = { c: string };
type t4 = { d: string };
type t5 = { e: string };
type t6 = { f: string };

let observable: Observable<t>;
let observable2: Observable<t2>;
let observable3: Observable<t3>;
let observable4: Observable<t4>;
let observable5: Observable<t5>;
let observable6: Observable<t6>;
let numberObservable: Observable<number>;
let booleanObservable: Observable<boolean>;

/* tslint:disable:no-unused-variable *//* tslint:disable:max-line-length */
observable = BoundCallbackObservable.create((callback: (a: t) => void) => { /* */ })();
observable2 = BoundCallbackObservable.create((a: string, callback: (a: t2) => void) => { /* */ })('a');
observable3 = BoundCallbackObservable.create((a: string, b: number, callback: (r: t3) => void) => { /* */ })('a', 2);
observable4 = BoundCallbackObservable.create((a: string, b: number, c: boolean, callback: (r: t4) => void) => { /* */ })('a', 2, false);
observable5 = BoundCallbackObservable.create((a: string, b: number, c: boolean, d: number, callback: (r: t5) => void) => { /* */ })('a', 2, false, 4);
observable6 = BoundCallbackObservable.create((a: string, b: number, c: boolean, d: number, e: string, callback: (r: t6) => void) => { /* */ })('a', 2, false, 4, 'e');
numberObservable = BoundCallbackObservable.create((a: string, b: number, c: boolean, d: number, e: string, f: boolean, callback: (r: number) => void) => { /* */ })('a', 2, false, 4, 'e', true);

observable = BoundCallbackObservable.create((callback: (a: t) => void) => { /* */ }, null, asap)();
observable2 = BoundCallbackObservable.create((a: string, callback: (a: t2) => void) => { /* */ }, null, asap)('a');
observable3 = BoundCallbackObservable.create((a: string, b: number, callback: (r: t3) => void) => { /* */ }, null, asap)('a', 2);
observable4 = BoundCallbackObservable.create((a: string, b: number, c: boolean, callback: (r: t4) => void) => { /* */ }, null, asap)('a', 2, false);
observable5 = BoundCallbackObservable.create((a: string, b: number, c: boolean, d: number, callback: (r: t5) => void) => { /* */ }, null, asap)('a', 2, false, 4);
observable6 = BoundCallbackObservable.create((a: string, b: number, c: boolean, d: number, e: string, callback: (r: t6) => void) => { /* */ }, null, asap)('a', 2, false, 4, 'e');
numberObservable = BoundCallbackObservable.create((a: string, b: number, c: boolean, d: number, e: string, f: boolean, callback: (r: number) => void) => { /* */ }, null, asap)('a', 2, false, 4, 'e', true);

let observableArr: Observable<t[]>;
observableArr = BoundCallbackObservable.create<t[]>((callback: (...args: t2[]) => void) => { /* */ })();

observable6 = BoundCallbackObservable.create((callback: (a: t, b: t2, c: t3) => void) => { /* */ }, (a: t, b: t2, c: t3) => <t6>{}, asap)();
observable = BoundCallbackObservable.create((a: string, callback: (a: t2, b: t3, c: t4) => void) => { /* */ }, (a: t, b: t2, c: t3) => <t>{}, asap)('a');
observable2 = BoundCallbackObservable.create((a: string, b: number, callback: (r: t3, b: t4, c: t5) => void) => { /* */ }, (a: t, b: t2, c: t3) => <t2>{}, asap)('a', 2);
observable3 = BoundCallbackObservable.create((a: string, b: number, c: boolean, callback: (r: t4, b: t5, c: t6) => void) => { /* */ }, (a: t, b: t2, c: t3) => <t3>{}, asap)('a', 2, false);
observable4 = BoundCallbackObservable.create((a: string, b: number, c: boolean, d: number, callback: (r: t5, b: t5, c: t) => void) => { /* */ }, (a: t, b: t2, c: t3) => <t4>{}, asap)('a', 2, false, 4);
observable5 = BoundCallbackObservable.create((a: string, b: number, c: boolean, d: number, e: string, callback: (r: t6, b: t, c: t2) => void) => { /* */ }, (a: t, b: t2, c: t3) => <t5>{}, asap)('a', 2, false, 4, 'e');
booleanObservable = BoundCallbackObservable.create((a: string, b: number, c: boolean, d: number, e: string, f: boolean, callback: (r: number) => void) => { /* */ }, (a: t, b: t2, c: t3) => false, asap)('a', 2, false, 4, 'e', true);
