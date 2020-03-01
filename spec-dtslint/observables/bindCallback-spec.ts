import { bindCallback } from 'rxjs';
import { a,  b,  c,  d,  e,  f,  g, A, B, C, D, E, F, G } from '../helpers';
import { SchedulerLike } from '../../src';

describe('callbackFunc', () => {
  const f0 = (cb: () => any) => {
    cb();
  };

  const f1 = (cb: (res1: A) => any) => {
    cb(a);
  };

  const f2 = (cb: (res1: A, res2: B) => any) => {
    cb(a, b);
  };

  const f3 = (cb: (res1: A, res2: B, res3: C) => any) => {
    cb(a, b, c);
  };

  const f4 = (cb: (res1: A, res2: B, res3: C, res4: D) => any) => {
    cb(a, b, c, d);
  };

  it('should enforce function parameter', () => {
    const o = bindCallback() // $ExpectError
  });

  it('should accept cb 0 param', () => {
    const o = bindCallback(f0) // $ExpectType () => Observable<void>
  });

  it('should accept cb 1 param', () => {
    const o = bindCallback<A>(f1) // $ExpectType () => Observable<A>
  });

  it('should accept cb 2 params', () => {
    const o = bindCallback<A, B>(f2) // $ExpectType () => Observable<[A, B]>
  });

  it('should accept cb 3 params', () => {
    const o = bindCallback<A, B, C>(f3) // $ExpectType () => Observable<[A, B, C]>
  });

  it('should accept cb 4 params', () => {
    const o = bindCallback<A, B, C, D>(f4) // $ExpectType () => Observable<any[]>
  });
});

describe('callbackFunc and 1 args', () => {
  const fa1cb0 = (e: E, cb: () => any) => {
    cb();
  };

  const fa1cb1 = (e: E, cb: (res1: A) => any) => {
    cb(a);
  };

  const fa1cb2 = (e: E, cb: (res1: A, res2: B) => any) => {
    cb(a, b);
  };

  const fa1cb3 = (e: E, cb: (res1: A, res2: B, res3: C) => any) => {
    cb(a, b, c);
  };

  const fa1cb4 = (e: E, cb: (res1: A, res2: B, res3: C, res4: D) => any) => {
    cb(a, b, c, d);
  };

  it('should accept cb 0 param', () => {
    const o = bindCallback<E>(fa1cb0) // $ExpectType (arg1: E) => Observable<void>
  });

  it('should accept cb 1 param', () => {
    const o = bindCallback<E, A>(fa1cb1) // $ExpectType (arg1: E) => Observable<A>
  });

  it('should accept cb 2 param', () => {
    const o = bindCallback<E, A, B>(fa1cb2) // $ExpectType (arg1: E) => Observable<[A, B]>
  });

  it('should accept cb 3 param', () => {
    const o = bindCallback<E, A, B, C>(fa1cb3) // $ExpectType (arg1: E) => Observable<[A, B, C]>
  });

  it('should accept cb 4 param', () => {
    const o = bindCallback<E, A, B, C, D>(fa1cb4) // $ExpectType (arg1: E) => Observable<any[]>
  });
});

describe('callbackFunc and 2 args' , () => {
  const fa2cb0 = (e: E , f: F, cb: () => any) => {
    cb();
  };

  const fa2cb1 = (e: E , f: F, cb: (res1: A) => any) => {
    cb(a);
  };

  const fa2cb2 = (e: E , f: F, cb: (res1: A, res2: B) => any) => {
    cb(a, b);
  };

  const fa2cb3 = (e: E , f: F, cb: (res1: A, res2: B, res3: C) => any) => {
    cb(a, b, c);
  };

  const fa2cb4 = (e: E , f: F, cb: (res1: A, res2: B, res3: C, res4: D) => any) => {
    cb(a, b, c, d);
  };

  it('should accept cb 0 param', () => {
    const o = bindCallback<E, F>(fa2cb0) // $ExpectType (arg1: E, arg2: F) => Observable<void>
  });

  it('should accept cb 1 param', () => {
    const o = bindCallback<E, F, A>(fa2cb1) // $ExpectType (arg1: E, arg2: F) => Observable<A>
  });

  it('should accept cb 2 param', () => {
    const o = bindCallback<E, F, A, B>(fa2cb2) // $ExpectType (arg1: E, arg2: F) => Observable<[A, B]>
  });

  it('should accept cb 3 param', () => {
    const o = bindCallback<E, F, A, B, C>(fa2cb3) // $ExpectType (arg1: E, arg2: F) => Observable<[A, B, C]>
  });

  it('should accept cb 4 param', () => {
    const o = bindCallback<E, F, A, B, C, D>(fa2cb4) // $ExpectType (arg1: E, arg2: F) => Observable<any[]>
  });
});

describe('callbackFunc and 3 args' , () => {
  const fa3cb0 = (e: E , f: F, g: G, cb: () => any) => {
    cb();
  };

  const fa3cb1 = (e: E , f: F, g: G, cb: (res1: A) => any) => {
    cb(a);
  };

  const fa3cb2 = (e: E , f: F, g: G, cb: (res1: A, res2: B) => any) => {
    cb(a, b);
  };

  const fa3cb3 = (e: E , f: F, g: G, cb: (res1: A, res2: B, res3: C) => any) => {
    cb(a, b, c);
  };

  const fa3cb4 = (e: E , f: F, g: G, cb: (res1: A, res2: B, res3: C, res4: D) => any) => {
    cb(a, b, c, d);
  };


  it('should accept cb 0 param', () => {
    const o = bindCallback<E, F, G>(fa3cb0) // $ExpectType (arg1: E, arg2: F, arg3: G) => Observable<void>
  });

  it('should accept cb 1 param', () => {
    const o = bindCallback<E, F, G, A>(fa3cb1) // $ExpectType (arg1: E, arg2: F, arg3: G) => Observable<A>
  });

  it('should accept cb 2 params', () => {
    const o = bindCallback<E, F, G, A, B>(fa3cb2) // $ExpectType (arg1: E, arg2: F, arg3: G) => Observable<[A, B]>
  });

  it('should accept cb 3 params', () => {
    const o = bindCallback<E, F, G, A, B, C>(fa3cb3) // $ExpectType (arg1: E, arg2: F, arg3: G) => Observable<[A, B, C]>
  });

  it('should accept cb 4 params', () => {
    const o = bindCallback<E, F, G, A, B, C, D>(fa3cb4) // $ExpectType (arg1: E, arg2: F, arg3: G) => Observable<any[]>
  });
});

describe('callbackFunc and 4 args' , () => {
  const fa4cb0 = (e: E , f: F, g: G, a: A, cb: () => any) => {
    cb();
  };

  const fa4cb1 = (e: E , f: F, g: G, a: A, cb: (res1: A) => any) => {
    cb(a);
  };

  const fa4cb2 = (e: E , f: F, g: G, a: A, cb: (res1: A, res2: B) => any) => {
    cb(a, b);
  };

  const fa4cb3 = (e: E , f: F, g: G, a: A, cb: (res1: A, res2: B, res3: C) => any) => {
    cb(a, b, c);
  };

  const fa4cb4 = (e: E , f: F, g: G, a: A, cb: (res1: A, res2: B, res3: C, res4: D) => any) => {
    cb(a, b, c, d);
  };


  it('should accept cb 0 param', () => {
    const o = bindCallback<E, F, G, A>(fa4cb0) // $ExpectType (arg1: E, arg2: F, arg3: G, arg4: A) => Observable<void>
  });

  it('should accept cb 0 param', () => {
    const o = bindCallback<E, F, G, A, A>(fa4cb1) // $ExpectType (arg1: E, arg2: F, arg3: G, arg4: A) => Observable<A>
  });

  it('should accept cb 2 params', () => {
    const o = bindCallback<E, F, G, A, A, B>(fa4cb2) // $ExpectType (arg1: E, arg2: F, arg3: G, arg4: A) => Observable<[A, B]>
  });

  it('should accept cb 3 params', () => {
    const o = bindCallback<E, F, G, A, A, B, C>(fa4cb3) // $ExpectType (arg1: E, arg2: F, arg3: G, arg4: A) => Observable<[A, B, C]>
  });

  it('should accept cb 4 params', () => {
    const o = bindCallback<E, F, G, A, A, B, C, D>(fa4cb4) // $ExpectType (arg1: E, arg2: F, arg3: G, arg4: A) => Observable<any[]>
  });
});

describe('callbackFunc and 5 args' , () => {
  const fa5cb0 = (e: E , f: F, g: G, a: A, b: B, cb: () => any) => {
    cb();
  };

  const fa5cb1 = (e: E , f: F, g: G, a: A, b: B, cb: (res1: A) => any) => {
    cb(a);
  };

  const fa5cb2 = (e: E , f: F, g: G, a: A, b: B, cb: (res1: A, res2: B) => any) => {
    cb(a, b);
  };

  const fa5cb3 = (e: E , f: F, g: G, a: A, b: B, cb: (res1: A, res2: B, res3: C) => any) => {
    cb(a, b, c);
  };

  const fa5cb4 = (e: E , f: F, g: G, a: A, b: B, cb: (res1: A, res2: B, res3: C, res4: D) => any) => {
    cb(a, b, c, d);
  };


  it('should accept cb 0 param', () => {
    const o = bindCallback<E, F, G, A, B>(fa5cb0) // $ExpectType (arg1: E, arg2: F, arg3: G, arg4: A, arg5: B) => Observable<void>
  });

  it('should accept cb 0 param', () => {
    const o = bindCallback<E, F, G, A, B, A>(fa5cb1) // $ExpectType (arg1: E, arg2: F, arg3: G, arg4: A, arg5: B) => Observable<A>
  });

  it('should accept cb 2 params', () => {
    const o = bindCallback<E, F, G, A, B, A, B>(fa5cb2) // $ExpectType (arg1: E, arg2: F, arg3: G, arg4: A, arg5: B) => Observable<[A, B]>
  });

  it('should accept cb 3 params', () => {
    const o = bindCallback<E, F, G, A, B, A, B, C>(fa5cb3) // $ExpectType (arg1: E, arg2: F, arg3: G, arg4: A, arg5: B) => Observable<[A, B, C]>
  });

  it('should accept cb 4 params', () => {
    const o = bindCallback<E, F, G, A, B, A, B, C, D>(fa5cb4) // $ExpectType (arg1: E, arg2: F, arg3: G, arg4: A, arg5: B) => Observable<any[]>
  });
});

describe('callbackFunc: Function type', () => {
  const fn: Function = () => {};

  it('should accept Function', () => {
    const o = bindCallback(fn); // $ExpectType (...args: any[]) => Observable<any>
  });

});
