import { of } from 'rxjs';

export class A { a = 0; }
export class B { b = 0; }
export class C { c = 0; }
export class D { d = 0; }
export class E { e = 0; }
export class F { f = 0; }
export class G { g = 0; }
export class H { h = 0; }
export class I { i = 0; }
export class J { j = 0; }

export const a = new A();
export const b = new B();
export const c = new C();
export const d = new D();
export const e = new E();
export const f = new F();
export const g = new G();
export const h = new H();
export const i = new I();
export const j = new J();

export const a$ = of(new A());
export const b$ = of(new B());
export const c$ = of(new C());
export const d$ = of(new D());
export const e$ = of(new E());
export const f$ = of(new F());
export const g$ = of(new G());
export const h$ = of(new H());
export const i$ = of(new I());
export const j$ = of(new J());

interface Subscription {
  closed: boolean;
  unsubscribe(): void;
}
interface SubscriptionObserver<T> {
  closed: boolean;
  next(value: T): void;
  error(errorValue: any): void;
  complete(): void;
}
type Subscriber<T> = (observer: SubscriptionObserver<T>) => void | (() => void) | Subscription;

interface Observer<T> {
  start?(subscription: Subscription): any;
  next?(value: T): void;
  error?(errorValue: any): void;
  complete?(): void;
}

export declare class CompatObservable<T> {
  constructor(subscriber: Subscriber<T>);

  subscribe(observer: Observer<T>): Subscription;
  subscribe(
      onNext: (value: T) => void,
      onError?: (error: any) => void,
      onComplete?: () => void,
  ): Subscription;

  [Symbol.observable](): CompatObservable<T>;
}
