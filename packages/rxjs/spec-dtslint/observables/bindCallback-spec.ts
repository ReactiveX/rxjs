import { bindCallback } from 'rxjs';
import { a,  b,  c,  d,  e,  f,  g, A, B, C, D, E, F, G } from '../helpers';

describe('callbackFunc', () => {
  const f0 = (cb: () => void) => {
    cb();
  };

  const f1 = (cb: (res1: A) => void) => {
    cb(a);
  };

  const f2 = (cb: (res1: A, res2: B) => void) => {
    cb(a, b);
  };

  const f3 = (cb: (res1: A, res2: B, res3: C) => void) => {
    cb(a, b, c);
  };

  const f4 = (cb: (res1: A, res2: B, res3: C, res4: D) => void) => {
    cb(a, b, c, d);
  };

  it('should enforce function parameter', () => {
    const o = bindCallback() // $ExpectError
  });

  it('should accept cb 0 param', () => {
    const o = bindCallback(f0) // $ExpectType () => Observable<void>
  });

  it('should accept cb 1 param', () => {
    const o = bindCallback(f1) // $ExpectType () => Observable<A>
  });

  it('should accept cb 2 params', () => {
    const o = bindCallback(f2) // $ExpectType () => Observable<[res1: A, res2: B]>
  });

  it('should accept cb 3 params', () => {
    const o = bindCallback(f3) // $ExpectType () => Observable<[res1: A, res2: B, res3: C]>
  });

  it('should accept cb 4 params', () => {
    const o = bindCallback(f4) // $ExpectType () => Observable<[res1: A, res2: B, res3: C, res4: D]>
  });
});

describe('callbackFunc and 1 args', () => {
  const fa1cb0 = (e: E, cb: () => void) => {
    cb();
  };

  const fa1cb1 = (e: E, cb: (res1: A) => void) => {
    cb(a);
  };

  const fa1cb2 = (e: E, cb: (res1: A, res2: B) => void) => {
    cb(a, b);
  };

  const fa1cb3 = (e: E, cb: (res1: A, res2: B, res3: C) => void) => {
    cb(a, b, c);
  };

  const fa1cb4 = (e: E, cb: (res1: A, res2: B, res3: C, res4: D) => void) => {
    cb(a, b, c, d);
  };

  it('should accept cb 0 param', () => {
    const o = bindCallback(fa1cb0) // $ExpectType (e: E) => Observable<void>
  });

  it('should accept cb 1 param', () => {
    const o = bindCallback(fa1cb1) // $ExpectType (e: E) => Observable<A>
  });

  it('should accept cb 2 param', () => {
    const o = bindCallback(fa1cb2) // $ExpectType (e: E) => Observable<[res1: A, res2: B]>
  });

  it('should accept cb 3 param', () => {
    const o = bindCallback(fa1cb3) // $ExpectType (e: E) => Observable<[res1: A, res2: B, res3: C]>
  });

  it('should accept cb 4 param', () => {
    const o = bindCallback(fa1cb4) // $ExpectType (e: E) => Observable<[res1: A, res2: B, res3: C, res4: D]>
  });
});

describe('callbackFunc and 2 args' , () => {
  const fa2cb0 = (e: E , f: F, cb: () => void) => {
    cb();
  };

  const fa2cb1 = (e: E , f: F, cb: (res1: A) => void) => {
    cb(a);
  };

  const fa2cb2 = (e: E , f: F, cb: (res1: A, res2: B) => void) => {
    cb(a, b);
  };

  const fa2cb3 = (e: E , f: F, cb: (res1: A, res2: B, res3: C) => void) => {
    cb(a, b, c);
  };

  const fa2cb4 = (e: E , f: F, cb: (res1: A, res2: B, res3: C, res4: D) => void) => {
    cb(a, b, c, d);
  };

  it('should accept cb 0 param', () => {
    const o = bindCallback(fa2cb0) // $ExpectType (e: E, f: F) => Observable<void>
  });

  it('should accept cb 1 param', () => {
    const o = bindCallback(fa2cb1) // $ExpectType (e: E, f: F) => Observable<A>
  });

  it('should accept cb 2 param', () => {
    const o = bindCallback(fa2cb2) // $ExpectType (e: E, f: F) => Observable<[res1: A, res2: B]>
  });

  it('should accept cb 3 param', () => {
    const o = bindCallback(fa2cb3) // $ExpectType (e: E, f: F) => Observable<[res1: A, res2: B, res3: C]>
  });

  it('should accept cb 4 param', () => {
    const o = bindCallback(fa2cb4) // $ExpectType (e: E, f: F) => Observable<[res1: A, res2: B, res3: C, res4: D]>
  });
});

describe('callbackFunc and 3 args' , () => {
  const fa3cb0 = (e: E , f: F, g: G, cb: () => void) => {
    cb();
  };

  const fa3cb1 = (e: E , f: F, g: G, cb: (res1: A) => void) => {
    cb(a);
  };

  const fa3cb2 = (e: E , f: F, g: G, cb: (res1: A, res2: B) => void) => {
    cb(a, b);
  };

  const fa3cb3 = (e: E , f: F, g: G, cb: (res1: A, res2: B, res3: C) => void) => {
    cb(a, b, c);
  };

  const fa3cb4 = (e: E , f: F, g: G, cb: (res1: A, res2: B, res3: C, res4: D) => void) => {
    cb(a, b, c, d);
  };


  it('should accept cb 0 param', () => {
    const o = bindCallback(fa3cb0) // $ExpectType (e: E, f: F, g: G) => Observable<void>
  });

  it('should accept cb 1 param', () => {
    const o = bindCallback(fa3cb1) // $ExpectType (e: E, f: F, g: G) => Observable<A>
  });

  it('should accept cb 2 params', () => {
    const o = bindCallback(fa3cb2) // $ExpectType (e: E, f: F, g: G) => Observable<[res1: A, res2: B]>
  });

  it('should accept cb 3 params', () => {
    const o = bindCallback(fa3cb3) // $ExpectType (e: E, f: F, g: G) => Observable<[res1: A, res2: B, res3: C]>
  });

  it('should accept cb 4 params', () => {
    const o = bindCallback(fa3cb4) // $ExpectType (e: E, f: F, g: G) => Observable<[res1: A, res2: B, res3: C, res4: D]>
  });
});

describe('callbackFunc and 4 args' , () => {
  const fa4cb0 = (e: E , f: F, g: G, a: A, cb: () => void) => {
    cb();
  };

  const fa4cb1 = (e: E , f: F, g: G, a: A, cb: (res1: A) => void) => {
    cb(a);
  };

  const fa4cb2 = (e: E , f: F, g: G, a: A, cb: (res1: A, res2: B) => void) => {
    cb(a, b);
  };

  const fa4cb3 = (e: E , f: F, g: G, a: A, cb: (res1: A, res2: B, res3: C) => void) => {
    cb(a, b, c);
  };

  const fa4cb4 = (e: E , f: F, g: G, a: A, cb: (res1: A, res2: B, res3: C, res4: D) => void) => {
    cb(a, b, c, d);
  };


  it('should accept cb 0 param', () => {
    const o = bindCallback(fa4cb0) // $ExpectType (e: E, f: F, g: G, a: A) => Observable<void>
  });

  it('should accept cb 0 param', () => {
    const o = bindCallback(fa4cb1) // $ExpectType (e: E, f: F, g: G, a: A) => Observable<A>
  });

  it('should accept cb 2 params', () => {
    const o = bindCallback(fa4cb2) // $ExpectType (e: E, f: F, g: G, a: A) => Observable<[res1: A, res2: B]>
  });

  it('should accept cb 3 params', () => {
    const o = bindCallback(fa4cb3) // $ExpectType (e: E, f: F, g: G, a: A) => Observable<[res1: A, res2: B, res3: C]>
  });

  it('should accept cb 4 params', () => {
    const o = bindCallback(fa4cb4) // $ExpectType (e: E, f: F, g: G, a: A) => Observable<[res1: A, res2: B, res3: C, res4: D]>
  });
});

describe('callbackFunc and 5 args' , () => {
  const fa5cb0 = (e: E , f: F, g: G, a: A, b: B, cb: () => void) => {
    cb();
  };

  const fa5cb1 = (e: E , f: F, g: G, a: A, b: B, cb: (res1: A) => void) => {
    cb(a);
  };

  const fa5cb2 = (e: E , f: F, g: G, a: A, b: B, cb: (res1: A, res2: B) => void) => {
    cb(a, b);
  };

  const fa5cb3 = (e: E , f: F, g: G, a: A, b: B, cb: (res1: A, res2: B, res3: C) => void) => {
    cb(a, b, c);
  };

  const fa5cb4 = (e: E , f: F, g: G, a: A, b: B, cb: (res1: A, res2: B, res3: C, res4: D) => void) => {
    cb(a, b, c, d);
  };


  it('should accept cb 0 param', () => {
    const o = bindCallback(fa5cb0) // $ExpectType (e: E, f: F, g: G, a: A, b: B) => Observable<void>
  });

  it('should accept cb 0 param', () => {
    const o = bindCallback(fa5cb1) // $ExpectType (e: E, f: F, g: G, a: A, b: B) => Observable<A>
  });

  it('should accept cb 2 params', () => {
    const o = bindCallback(fa5cb2) // $ExpectType (e: E, f: F, g: G, a: A, b: B) => Observable<[res1: A, res2: B]>
  });

  it('should accept cb 3 params', () => {
    const o = bindCallback(fa5cb3) // $ExpectType (e: E, f: F, g: G, a: A, b: B) => Observable<[res1: A, res2: B, res3: C]>
  });

  it('should accept cb 4 params', () => {
    const o = bindCallback(fa5cb4) // $ExpectType (e: E, f: F, g: G, a: A, b: B) => Observable<[res1: A, res2: B, res3: C, res4: D]>
  });
});

describe('callbackFunc overkill' , () => {
  it('should accept 10 args and 5 params', () => {
    const fa10cb5 = (_1: 1 , _2: 2, _3: 3, _4: 4, _5: 5, _6: 6, _7: 7, _8: 8, _9: 9, _10: 10, cb: (_11: 11, _12: 12, _13: 13, _14: 14, _15: 15) => void) => {
      cb(11, 12, 13, 14, 15);
    };
    const o = bindCallback(fa10cb5) // $ExpectType (_1: 1, _2: 2, _3: 3, _4: 4, _5: 5, _6: 6, _7: 7, _8: 8, _9: 9, _10: 10) => Observable<[_11: 11, _12: 12, _13: 13, _14: 14, _15: 15]>
  });
});
