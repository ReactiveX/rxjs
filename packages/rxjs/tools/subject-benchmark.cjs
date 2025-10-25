// @ts-check
const { Bench } = require('tinybench');
const { Subject: SubjectMaster } = require('../dist-master/cjs');
const { Subject: SubjectPr } = require('../dist/cjs');

async function run() {
  const numIterations = 10_000;
  const bench = new Bench({ warmupIterations: Math.ceil(numIterations / 20), iterations: numIterations });

  //   bench.add('[master] Creating Subject', () => {
  //     new SubjectMaster();
  //   });
  //   bench.add('[pr] Creating Subject', () => {
  //     new SubjectPr();
  //   });

  //   bench.add('[master] 0 subscribed, 1 next', () => {
  //     const source = new SubjectMaster();
  //     source.next(1);
  //   });
  //   bench.add('[pr] 0 subscribed, 1 next', () => {
  //     const source = new SubjectPr();
  //     source.next(1);
  //   });

  //   bench.add('[master] 0 subscribed, 100 next', () => {
  //     const source = new SubjectMaster();
  //     for (let i = 0; i !== 100; ++i) {
  //       source.next(i);
  //     }
  //   });
  //   bench.add('[pr] 0 subscribed, 100 next', () => {
  //     const source = new SubjectPr();
  //     for (let i = 0; i !== 100; ++i) {
  //       source.next(i);
  //     }
  //   });

  //   bench.add('[master] 1 subscribed, 1 next', () => {
  //     const source = new SubjectMaster();
  //     const subscription = source.asObservable().subscribe();
  //     source.next(1);
  //     subscription.unsubscribe();
  //   });
  //   bench.add('[pr] 1 subscribed, 1 next', () => {
  //     const source = new SubjectPr();
  //     const subscription = source.asObservable().subscribe();
  //     source.next(1);
  //     subscription.unsubscribe();
  //   });

  //   bench.add('[master] 1 subscribed, 100 next', () => {
  //     const source = new SubjectMaster();
  //     const subscription = source.asObservable().subscribe();
  //     for (let i = 0; i !== 100; ++i) {
  //       source.next(i);
  //     }
  //     subscription.unsubscribe();
  //   });
  //   bench.add('[pr] 1 subscribed, 100 next', () => {
  //     const source = new SubjectPr();
  //     const subscription = source.asObservable().subscribe();
  //     for (let i = 0; i !== 100; ++i) {
  //       source.next(i);
  //     }
  //     subscription.unsubscribe();
  //   });

  //   bench.add('[master] 3 subscribed, 1 next', () => {
  //     const source = new SubjectMaster();
  //     const s1 = source.asObservable().subscribe();
  //     const s2 = source.asObservable().subscribe();
  //     const s3 = source.asObservable().subscribe();
  //     source.next(1);
  //     s1.unsubscribe();
  //     s2.unsubscribe();
  //     s3.unsubscribe();
  //   });
  //   bench.add('[pr] 3 subscribed, 1 next', () => {
  //     const source = new SubjectPr();
  //     const s1 = source.asObservable().subscribe();
  //     const s2 = source.asObservable().subscribe();
  //     const s3 = source.asObservable().subscribe();
  //     source.next(1);
  //     s1.unsubscribe();
  //     s2.unsubscribe();
  //     s3.unsubscribe();
  //   });

  //   bench.add('[master] 3 subscribed, 100 next', () => {
  //     const source = new SubjectMaster();
  //     const s1 = source.asObservable().subscribe();
  //     const s2 = source.asObservable().subscribe();
  //     const s3 = source.asObservable().subscribe();
  //     for (let i = 0; i !== 100; ++i) {
  //       source.next(i);
  //     }
  //     s1.unsubscribe();
  //     s2.unsubscribe();
  //     s3.unsubscribe();
  //   });
  //   bench.add('[pr] 3 subscribed, 100 next', () => {
  //     const source = new SubjectPr();
  //     const s1 = source.asObservable().subscribe();
  //     const s2 = source.asObservable().subscribe();
  //     const s3 = source.asObservable().subscribe();
  //     for (let i = 0; i !== 100; ++i) {
  //       source.next(i);
  //     }
  //     s1.unsubscribe();
  //     s2.unsubscribe();
  //     s3.unsubscribe();
  //   });

  //   bench.add('[master] 10 subscribed, 1 next', () => {
  //     const source = new SubjectMaster();
  //     const s = [];
  //     for (let i = 0; i !== 10; ++i) {
  //       s.push(source.asObservable().subscribe());
  //     }
  //     source.next(1);
  //     for (const e of s) {
  //       e.unsubscribe();
  //     }
  //   });
  //   bench.add('[pr] 10 subscribed, 1 next', () => {
  //     const source = new SubjectPr();
  //     const s = [];
  //     for (let i = 0; i !== 10; ++i) {
  //       s.push(source.asObservable().subscribe());
  //     }
  //     source.next(1);
  //     for (const e of s) {
  //       e.unsubscribe();
  //     }
  //   });

  //   bench.add('[master] 10 subscribed, 100 next', () => {
  //     const source = new SubjectMaster();
  //     const s = [];
  //     for (let i = 0; i !== 10; ++i) {
  //       s.push(source.asObservable().subscribe());
  //     }
  //     for (let i = 0; i !== 100; ++i) {
  //       source.next(i);
  //     }
  //     for (const e of s) {
  //       e.unsubscribe();
  //     }
  //   });
  //   bench.add('[pr] 10 subscribed, 100 next', () => {
  //     const source = new SubjectPr();
  //     const s = [];
  //     for (let i = 0; i !== 10; ++i) {
  //       s.push(source.asObservable().subscribe());
  //     }
  //     for (let i = 0; i !== 100; ++i) {
  //       source.next(i);
  //     }
  //     for (const e of s) {
  //       e.unsubscribe();
  //     }
  //   });

  //   bench.add('[master] 100 subscribed, 1 next', () => {
  //     const source = new SubjectMaster();
  //     const s = [];
  //     for (let i = 0; i !== 100; ++i) {
  //       s.push(source.asObservable().subscribe());
  //     }
  //     source.next(1);
  //     for (const e of s) {
  //       e.unsubscribe();
  //     }
  //   });
  //   bench.add('[pr] 100 subscribed, 1 next', () => {
  //     const source = new SubjectPr();
  //     const s = [];
  //     for (let i = 0; i !== 100; ++i) {
  //       s.push(source.asObservable().subscribe());
  //     }
  //     source.next(1);
  //     for (const e of s) {
  //       e.unsubscribe();
  //     }
  //   });

  //   bench.add('[master] 100 subscribed, 100 next', () => {
  //     const source = new SubjectMaster();
  //     const s = [];
  //     for (let i = 0; i !== 100; ++i) {
  //       s.push(source.asObservable().subscribe());
  //     }
  //     for (let i = 0; i !== 100; ++i) {
  //       source.next(i);
  //     }
  //     for (const e of s) {
  //       e.unsubscribe();
  //     }
  //   });
  //   bench.add('[pr] 100 subscribed, 100 next', () => {
  //     const source = new SubjectPr();
  //     const s = [];
  //     for (let i = 0; i !== 100; ++i) {
  //       s.push(source.asObservable().subscribe());
  //     }
  //     for (let i = 0; i !== 100; ++i) {
  //       source.next(i);
  //     }
  //     for (const e of s) {
  //       e.unsubscribe();
  //     }
  //   });

  //   bench.add('[master] 1000 subscribed, 1 next', () => {
  //     const source = new SubjectMaster();
  //     const s = [];
  //     for (let i = 0; i !== 1000; ++i) {
  //       s.push(source.asObservable().subscribe());
  //     }
  //     source.next(1);
  //     for (const e of s) {
  //       e.unsubscribe();
  //     }
  //   });
  //   bench.add('[pr] 1000 subscribed, 1 next', () => {
  //     const source = new SubjectPr();
  //     const s = [];
  //     for (let i = 0; i !== 1000; ++i) {
  //       s.push(source.asObservable().subscribe());
  //     }
  //     source.next(1);
  //     for (const e of s) {
  //       e.unsubscribe();
  //     }
  //   });

  bench.add('[master] 1 subscribed, 10,000 next', () => {
    const source = new SubjectMaster();
    const s = [];
    for (let i = 0; i !== 1; ++i) {
      s.push(source.asObservable().subscribe());
    }
    for (let i = 0; i !== 10000; ++i) {
      source.next(i);
    }
    for (const e of s) {
      e.unsubscribe();
    }
  });

  bench.add('[pr]  1 subscribed, 10,000 next', () => {
    const source = new SubjectPr();
    const s = [];
    for (let i = 0; i !== 1; ++i) {
      s.push(source.asObservable().subscribe());
    }
    for (let i = 0; i !== 10000; ++i) {
      source.next(i);
    }
    for (const e of s) {
      e.unsubscribe();
    }
  });

  await bench.warmup();
  await bench.run();

  console.table(
    bench.tasks.map(({ name, result }) => {
      return {
        Name: name,
        Mean: result?.mean,
        P75: result?.p75,
        P99: result?.p99,
        RME: result?.rme,
      };
    })
  );
}
run();
