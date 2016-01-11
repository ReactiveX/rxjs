import {Observable} from './Observable';
import {Scheduler} from './Scheduler';

/* tslint:disable:class-name *//* tslint:disable:max-line-length */
/* ||| MARKER ||| */
export module observable {
  export module create {
    export interface bindCallback {
      <TResult>( callbackFunc: (callback: (result: TResult) => any) => any ): () => Observable<TResult>;
      <T, TResult>( callbackFunc: (x1: T, callback: (result: TResult) => any) => any ): (x1: T) => Observable<TResult>;
      <T, T2, TResult>( callbackFunc: (x1: T, x2: T2, callback: (result: TResult) => any) => any ): (x1: T, x2: T2) => Observable<TResult>;
      <T, T2, T3, TResult>( callbackFunc: (x1: T, x2: T2, x3: T3, callback: (result: TResult) => any) => any ): (x1: T, x2: T2, x3: T3) => Observable<TResult>;
      <T, T2, T3, T4, TResult>( callbackFunc: (x1: T, x2: T2, x3: T3, x4: T4, callback: (result: TResult) => any) => any ): (x1: T, x2: T2, x3: T3, x4: T4) => Observable<TResult>;
      <T, T2, T3, T4, T5, TResult>( callbackFunc: (x1: T, x2: T2, x3: T3, x4: T4, x5: T5, callback: (result: TResult) => any) => any ): (x1: T, x2: T2, x3: T3, x4: T4, x5: T5) => Observable<TResult>;
      <T, T2, T3, T4, T5, T6, TResult>( callbackFunc: (x1: T, x2: T2, x3: T3, x4: T4, x5: T5, x6: T6, callback: (result: TResult) => any) => any ): (x1: T, x2: T2, x3: T3, x4: T4, x5: T5, x6: T6) => Observable<TResult>;
      <TResult>(callbackFunc: (callback: (result: TResult) => any) => any, selector: any, scheduler: Scheduler): () => Observable<TResult>;
      <T, TResult>(callbackFunc: (x1: T, callback: (result: TResult) => any) => any, selector: any, scheduler: Scheduler): (x1: T) => Observable<TResult>;
      <T, T2, TResult>(callbackFunc: (x1: T, x2: T2, callback: (result: TResult) => any) => any, selector: any, scheduler: Scheduler): (x1: T, x2: T2) => Observable<TResult>;
      <T, T2, T3, TResult>(callbackFunc: (x1: T, x2: T2, x3: T3, callback: (result: TResult) => any) => any, selector: any, scheduler: Scheduler): (x1: T, x2: T2, x3: T3) => Observable<TResult>;
      <T, T2, T3, T4, TResult>(callbackFunc: (x1: T, x2: T2, x3: T3, x4: T4, callback: (result: TResult) => any) => any, selector: any, scheduler: Scheduler): (x1: T, x2: T2, x3: T3, x4: T4) => Observable<TResult>;
      <T, T2, T3, T4, T5, TResult>(callbackFunc: (x1: T, x2: T2, x3: T3, x4: T4, x5: T5, callback: (result: TResult) => any) => any, selector: any, scheduler: Scheduler): (x1: T, x2: T2, x3: T3, x4: T4, x5: T5) => Observable<TResult>;
      <T, T2, T3, T4, T5, T6, TResult>(callbackFunc: (x1: T, x2: T2, x3: T3, x4: T4, x5: T5, x6: T6, callback: (result: TResult) => any) => any, selector: any, scheduler: Scheduler): (x1: T, x2: T2, x3: T3, x4: T4, x5: T5, x6: T6) => Observable<TResult>;
      (callbackFunc: ( callback: (...args: any[]) => any) => any): () => Observable<any[]>;
      <T>(callbackFunc: (x1: T, callback: (...args: any[]) => any) => any): (x1: T) => Observable<any[]>;
      <T, T2>(callbackFunc: (x1: T, x2: T2, callback: (...args: any[]) => any) => any): (x1: T, x2: T2) => Observable<any[]>;
      <T, T2, T3>(callbackFunc: (x1: T, x2: T2, x3: T3, callback: (...args: any[]) => any) => any): (x1: T, x2: T2, x3: T3) => Observable<any[]>;
      <T, T2, T3, T4>(callbackFunc: (x1: T, x2: T2, x3: T3, x4: T4, callback: (...args: any[]) => any) => any): (x1: T, x2: T2, x3: T3, x4: T4) => Observable<any[]>;
      <T, T2, T3, T4, T5>(callbackFunc: (x1: T, x2: T2, x3: T3, x4: T4, x5: T5, callback: (...args: any[]) => any) => any): (x1: T, x2: T2, x3: T3, x4: T4, x5: T5) => Observable<any[]>;
      <T, T2, T3, T4, T5, T6>(callbackFunc: (x1: T, x2: T2, x3: T3, x4: T4, x5: T5, x6: T6, callback: (...args: any[]) => any) => any): (x1: T, x2: T2, x3: T3, x4: T4, x5: T5, x6: T6) => Observable<any[]>;
      <TResult>(callbackFunc: (callback: (...args: any[]) => any) => any, selector: (...args: any[]) => TResult, scheduler?: Scheduler): () => Observable<TResult>;
      <T, TResult>(callbackFunc: (x1: T, callback: (...args: any[]) => any) => any, selector: (...args: any[]) => TResult, scheduler?: Scheduler): (x1: T) => Observable<TResult>;
      <T, T2, TResult>(callbackFunc: (x1: T, x2: T2, callback: (...args: any[]) => any) => any, selector: (...args: any[]) => TResult, scheduler?: Scheduler): (x1: T, x2: T2) => Observable<TResult>;
      <T, T2, T3, TResult>(callbackFunc: (x1: T, x2: T2, x3: T3, callback: (...args: any[]) => any) => any, selector: (...args: any[]) => TResult, scheduler?: Scheduler): (x1: T, x2: T2, x3: T3) => Observable<TResult>;
      <T, T2, T3, T4, TResult>(callbackFunc: (x1: T, x2: T2, x3: T3, x4: T4, callback: (...args: any[]) => any) => any, selector: (...args: any[]) => TResult, scheduler?: Scheduler): (x1: T, x2: T2, x3: T3, x4: T4) => Observable<TResult>;
      <T, T2, T3, T4, T5, TResult>(callbackFunc: (x1: T, x2: T2, x3: T3, x4: T4, x5: T5, callback: (...args: any[]) => any) => any, selector: (...args: any[]) => TResult, scheduler?: Scheduler): (x1: T, x2: T2, x3: T3, x4: T4, x5: T5) => Observable<TResult>;
      <T, T2, T3, T4, T5, T6, TResult>(callbackFunc: (x1: T, x2: T2, x3: T3, x4: T4, x5: T5, x6: T6, callback: (...args: any[]) => any) => any, selector: (...args: any[]) => TResult, scheduler?: Scheduler): (x1: T, x2: T2, x3: T3, x4: T4, x5: T5, x6: T6) => Observable<TResult>;
      <T>(callbackFunc: Function): (...args: any[]) => Observable<T>;
      <T>(callbackFunc: Function, selector: void, scheduler: Scheduler): (...args: any[]) => Observable<T>;
      <T>(callbackFunc: Function, selector?: (...args: any[]) => T, scheduler?: Scheduler): (...args: any[]) => Observable<T>;
    }
  }
}
export module operator {
}
/* ||| MARKER ||| */