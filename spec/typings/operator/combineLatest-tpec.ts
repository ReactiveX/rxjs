import {CombineLatestDeclaration} from '../../../src/operator/combineLatest';
import {Observable} from '../../../src/Observable';

interface Tester<T> extends Observable<T> {
  combineLatest: CombineLatestDeclaration<T>;
}

type t = { a: string };
type t2 = { b: string };
type t3 = { c: string };
type t4 = { d: string };
type t5 = { e: string };
type t6 = { f: string };

let observable: Tester<t>;
let observable2: Observable<t2>;
let observable3: Observable<t3>;
let observable4: Observable<t4>;
let observable5: Observable<t5>;
let observable6: Observable<t6>;

/* tslint:disable:no-unused-variable */
let result0: Observable<[t]> = observable.combineLatest();
let result1: Observable<[t, t2]> = observable.combineLatest(observable2);
let result2: Observable<[t, t2, t3]> = observable.combineLatest(observable2, observable3);
let result3: Observable<[t, t2, t3, t4]> = observable.combineLatest(observable2, observable3, observable4);
let result4: Observable<[t, t2, t3, t4, t5]> = observable.combineLatest(observable2, observable3, observable4, observable5);
let result5: Observable<[t, t2, t3, t4, t5, t6]> = observable.combineLatest(observable2, observable3, observable4, observable5, observable6);

let project1: Observable<number> = observable.combineLatest(observable2,
  (a, b) => a.a.length + b.b.length);
let project2: Observable<number> = observable.combineLatest(observable2, observable3,
  (a, b, c) => a.a.length + b.b.length + c.c.length);
let project3: Observable<number> = observable.combineLatest(observable2, observable3, observable4,
  (a, b, c, d) => a.a.length + b.b.length + c.c.length + d.d.length);
let project4: Observable<number> = observable.combineLatest(observable2, observable3, observable4, observable5,
  (a, b, c, d, e) => a.a.length + b.b.length + c.c.length + d.d.length + e.e.length);
let project5: Observable<number> = observable.combineLatest(observable2, observable3, observable4, observable5, observable6,
  (a, b, c, d, e, f) => a.a.length + b.b.length + c.c.length + d.d.length + e.e.length + f.f.length);

let array: Observable<[t, t2, t3]> = observable.combineLatest<[t, t2, t3]>([observable2, observable3]);
let arrayBool: Observable<boolean> = observable.combineLatest([observable2, observable3], (...args: any[]) => !!args.length);

let rest: Observable<[t, t2, t3]> = observable.combineLatest<[t, t2, t3]>(...[observable2, observable3]);
let restBool: Observable<boolean> = observable.combineLatest(...[observable2, observable3, (...args: any[]) => !!args.length]);
