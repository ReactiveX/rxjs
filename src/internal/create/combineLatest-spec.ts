import { expect } from 'chai';
import { queueScheduler, combineLatest, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { assertDeepEquals } from 'rxjs/internal/test_helpers/assertDeepEquals';

/** @test {combineLatest} */
describe('static combineLatest', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler(assertDeepEquals);
  });

  it('should combineLatest the provided observables', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const firstSource =  hot('----a----b----c----|');
      const secondSource = hot('--d--e--f--g--|');
      const expected =         '----uv--wx-y--z----|';

      const combined = combineLatest(firstSource, secondSource);

      expectObservable(combined).toBe(expected, {u: ['a', 'd'], v: ['a', 'e'], w: ['a', 'f'], x: ['b', 'f'], y: ['b', 'g'], z: ['c', 'g']});
    });
  });

  // TODO(benlesh): deprecate passing scheduler to combineLatest

  // it('should combine an immediately-scheduled source with an immediately-scheduled second', (done) => {
  //   const a = of<number>(1, 2, 3, queueScheduler);
  //   const b = of<number>(4, 5, 6, 7, 8, queueScheduler);
  //   const r = [[1, 4], [2, 4], [2, 5], [3, 5], [3, 6], [3, 7], [3, 8]];

  //   //type definition need to be updated
  //   combineLatest(a, b, queueScheduler).subscribe((vals) => {
  //     expect(vals).to.deep.equal(r.shift());
  //   }, (x) => {
  //     done(new Error('should not be called'));
  //   }, () => {
  //     expect(r.length).to.equal(0);
  //     done();
  //   });
  // });

  it('should accept array of observables', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const firstSource =  hot('----a----b----c----|');
      const secondSource = hot('--d--e--f--g--|');
      const expected =         '----uv--wx-y--z----|';

      const combined = combineLatest([firstSource, secondSource]);

      expectObservable(combined).toBe(expected, {u: ['a', 'd'], v: ['a', 'e'], w: ['a', 'f'], x: ['b', 'f'], y: ['b', 'g'], z: ['c', 'g']});
    });
  });

  it('should work with two nevers', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = cold( '-');
      const e1subs =   '^';
      const e2 = cold( '-');
      const e2subs =   '^';
      const expected = '-';

      const result = combineLatest(e1, e2);

      expectObservable(result).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
      expectSubscriptionsTo(e2).toBe(e2subs);
    });
  });

  it('should work with never and empty', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = cold( '-');
      const e1subs =   '^';
      const e2 = cold( '|');
      const e2subs =   '(^!)';
      const expected = '-';

      const result = combineLatest(e1, e2);

      expectObservable(result).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
      expectSubscriptionsTo(e2).toBe(e2subs);
    });
  });

  it('should work with empty and never', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = cold( '|');
      const e1subs =   '(^!)';
      const e2 = cold( '-');
      const e2subs =   '^';
      const expected = '-';

      const result = combineLatest(e1, e2);

      expectObservable(result).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
      expectSubscriptionsTo(e2).toBe(e2subs);
    });
  });

  it('should work with empty and empty', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = cold('|');
      const e1subs =  '(^!)';
      const e2 = cold('|');
      const e2subs =  '(^!)';
      const expected = '|';

      const result = combineLatest(e1, e2);

      expectObservable(result).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
      expectSubscriptionsTo(e2).toBe(e2subs);
    });
  });

  it('should work with hot-empty and hot-single', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =        hot('-a-^-|');
      const e1subs =           '^ !';
      const e2 =        hot('-b-^-c-|');
      const e2subs =           '^   !';
      const expected =         '----|';

      const result = combineLatest(e1, e2);

      expectObservable(result).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
      expectSubscriptionsTo(e2).toBe(e2subs);
    });
  });

  it('should work with hot-single and hot-empty', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =        hot('-a-^-|');
      const e1subs =           '^ !';
      const e2 =        hot('-b-^-c-|');
      const e2subs =           '^   !';
      const expected =         '----|';

      const result = combineLatest(e2, e1);

      expectObservable(result).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
      expectSubscriptionsTo(e2).toBe(e2subs);
    });
  });

  it('should work with hot-single and never', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =        hot('-a-^-|');
      const e1subs =           '^ !';
      const e2 =        hot('------'); //never
      const e2subs =           '^  ';
      const expected =         '-'; //never

      const result = combineLatest(e1, e2);

      expectObservable(result).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
      expectSubscriptionsTo(e2).toBe(e2subs);
    });
  });

  it('should work with never and hot-single', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =        hot('--------'); //never
      const e1subs =           '^    ';
      const e2 =        hot('-a-^-b-|');
      const e2subs =           '^   !';
      const expected =         '-----'; //never

      const result = combineLatest(e1, e2);

      expectObservable(result).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
      expectSubscriptionsTo(e2).toBe(e2subs);
    });
  });

  it('should work with hot and hot', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =   hot('--a--^--b--c--|');
      const e1subs =        '^        !';
      const e2 =   hot('---e-^---f--g--|');
      const e2subs =        '^         !';
      const expected =      '----x-yz--|';

      const result = combineLatest(e1, e2);

      expectObservable(result).toBe(expected, { x: ['b', 'f'], y: ['c', 'f'], z: ['c', 'g'] });
      expectSubscriptionsTo(e1).toBe(e1subs);
      expectSubscriptionsTo(e2).toBe(e2subs);
    });
  });

  it('should work with empty and error', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =   hot('----------|'); //empty
      const e1subs =   '^     !';
      const e2 =   hot('------#', null, 'shazbot!'); //error
      const e2subs =   '^     !';
      const expected = '------#';

      const result = combineLatest(e1, e2);

      expectObservable(result).toBe(expected, null, 'shazbot!');
      expectSubscriptionsTo(e1).toBe(e1subs);
      expectSubscriptionsTo(e2).toBe(e2subs);
    });
  });

  it('should work with error and empty', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =   hot('--^---#', null, 'too bad, honk'); //error
      const e1subs =     '^   !';
      const e2 =   hot('--^--------|'); //empty
      const e2subs =     '^   !';
      const expected =   '----#';

      const result = combineLatest(e1, e2);

      expectObservable(result).toBe(expected, null, 'too bad, honk');
      expectSubscriptionsTo(e1).toBe(e1subs);
      expectSubscriptionsTo(e2).toBe(e2subs);
    });
  });

  it('should work with hot and throw', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =    hot('-a-^--b--c--|');
      const e1subs =       '^ !';
      const e2 =    hot('---^-#', null, 'bazinga');
      const e2subs =       '^ !';
      const expected =     '--#';

      const result = combineLatest(e1, e2);

      expectObservable(result).toBe(expected, null, 'bazinga');
      expectSubscriptionsTo(e1).toBe(e1subs);
      expectSubscriptionsTo(e2).toBe(e2subs);
    });
  });

  it('should work with throw and hot', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =    hot('---^-#', null, 'bazinga');
      const e1subs =       '^ !';
      const e2 =    hot('-a-^--b--c--|');
      const e2subs =       '^ !';
      const expected =     '--#';

      const result = combineLatest(e1, e2);

      expectObservable(result).toBe(expected, null, 'bazinga');
      expectSubscriptionsTo(e1).toBe(e1subs);
      expectSubscriptionsTo(e2).toBe(e2subs);
    });
  });

  it('should work with throw and throw', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =    hot('---^----#', null, 'jenga');
      const e1subs =       '^ !';
      const e2 =    hot('---^-#', null, 'bazinga');
      const e2subs =       '^ !';
      const expected =     '--#';

      const result = combineLatest(e1, e2);

      expectObservable(result).toBe(expected, null, 'bazinga');
      expectSubscriptionsTo(e1).toBe(e1subs);
      expectSubscriptionsTo(e2).toBe(e2subs);
    });
  });

  it('should work with error and throw', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =    hot('-a-^--b--#', null, 'wokka wokka');
      const e1subs =       '^ !';
      const e2 =    hot('---^-#', null, 'flurp');
      const e2subs =       '^ !';
      const expected =     '--#';

      const result = combineLatest(e1, e2);

      expectObservable(result).toBe(expected, null, 'flurp');
      expectSubscriptionsTo(e1).toBe(e1subs);
      expectSubscriptionsTo(e2).toBe(e2subs);
    });
  });

  it('should work with throw and error', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =    hot('---^-#', null, 'flurp');
      const e1subs =       '^ !';
      const e2 =    hot('-a-^--b--#', null, 'wokka wokka');
      const e2subs =       '^ !';
      const expected =     '--#';

      const result = combineLatest(e1, e2);

      expectObservable(result).toBe(expected, null, 'flurp');
      expectSubscriptionsTo(e1).toBe(e1subs);
      expectSubscriptionsTo(e2).toBe(e2subs);
    });
  });

  it('should work with never and throw', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =    hot('---^-----------');
      const e1subs =       '^     !';
      const e2 =    hot('---^-----#', null, 'wokka wokka');
      const e2subs =       '^     !';
      const expected =     '------#';

      const result = combineLatest(e1, e2);

      expectObservable(result).toBe(expected, null, 'wokka wokka');
      expectSubscriptionsTo(e1).toBe(e1subs);
      expectSubscriptionsTo(e2).toBe(e2subs);
    });
  });

  it('should work with throw and never', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =    hot('---^----#', null, 'wokka wokka');
      const e1subs =       '^    !';
      const e2 =    hot('---^-----------');
      const e2subs =       '^    !';
      const expected =     '-----#';

      const result = combineLatest(e1, e2);

      expectObservable(result).toBe(expected, null, 'wokka wokka');
      expectSubscriptionsTo(e1).toBe(e1subs);
      expectSubscriptionsTo(e2).toBe(e2subs);
    });
  });

  it('should work with some and throw', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =    hot('---^----a---b--|');
      const e1subs =       '^  !';
      const e2 =    hot('---^--#', null, 'wokka wokka');
      const e2subs =       '^  !';
      const expected =     '---#';

      const result = combineLatest(e1, e2);

      expectObservable(result).toBe(expected, { a: 1, b: 2}, 'wokka wokka');
      expectSubscriptionsTo(e1).toBe(e1subs);
      expectSubscriptionsTo(e2).toBe(e2subs);
    });
  });

  it('should work with throw and some', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =    hot('---^--#', null, 'wokka wokka');
      const e1subs =       '^  !';
      const e2 =    hot('---^----a---b--|');
      const e2subs =       '^  !';
      const expected =     '---#';

      const result = combineLatest(e1, e2);

      expectObservable(result).toBe(expected, null, 'wokka wokka');
      expectSubscriptionsTo(e1).toBe(e1subs);
      expectSubscriptionsTo(e2).toBe(e2subs);
    });
  });

  it('should handle throw after complete left', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const left =  hot('--a--^--b---|');
      const leftSubs =       '^      !';
      const right = hot('-----^--------#', null, 'bad things');
      const rightSubs =      '^        !';
      const expected =       '---------#';

      const result = combineLatest(left, right);

      expectObservable(result).toBe(expected, null, 'bad things');
      expectSubscriptionsTo(left).toBe(leftSubs);
      expectSubscriptionsTo(right).toBe(rightSubs);
    });
  });

  it('should handle throw after complete right', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const left =   hot('-----^--------#', null, 'bad things');
      const leftSubs =        '^        !';
      const right =  hot('--a--^--b---|', null);
      const rightSubs =       '^      !';
      const expected =        '---------#';

      const result = combineLatest(left, right);

      expectObservable(result).toBe(expected, null, 'bad things');
      expectSubscriptionsTo(left).toBe(leftSubs);
      expectSubscriptionsTo(right).toBe(rightSubs);
    });
  });

  it('should handle interleaved with tail', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = hot('-a--^--b---c---|');
      const e1subs =     '^          !';
      const e2 = hot('--d-^----e---f--|');
      const e2subs =     '^           !';
      const expected =   '-----x-y-z--|';

      const result = combineLatest(e1, e2);

      expectObservable(result).toBe(expected, { x: ['b', 'e'], y: ['c', 'e'], z: ['c', 'f'] });
      expectSubscriptionsTo(e1).toBe(e1subs);
      expectSubscriptionsTo(e2).toBe(e2subs);
    });
  });

  it('should handle two consecutive hot observables', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = hot('--a--^--b--c--|');
      const e1subs =      '^        !';
      const e2 = hot('-----^----------d--e--f--|');
      const e2subs =      '^                   !';
      const expected =    '-----------x--y--z--|';

      const result = combineLatest(e1, e2);

      expectObservable(result).toBe(expected, { x: ['c', 'd'], y: ['c', 'e'], z: ['c', 'f'] });
      expectSubscriptionsTo(e1).toBe(e1subs);
      expectSubscriptionsTo(e2).toBe(e2subs);
    });
  });

  it('should handle two consecutive hot observables with error left', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const left =  hot('--a--^--b--c--#', null, 'jenga');
      const leftSubs =       '^        !';
      const right = hot('-----^----------d--e--f--|');
      const rightSubs =      '^        !';
      const expected =       '---------#';

      const result = combineLatest(left, right);

      expectObservable(result).toBe(expected, null, 'jenga');
      expectSubscriptionsTo(left).toBe(leftSubs);
      expectSubscriptionsTo(right).toBe(rightSubs);
    });
  });

  it('should handle two consecutive hot observables with error right', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const left =  hot('--a--^--b--c--|');
      const leftSubs =       '^        !';
      const right = hot('-----^----------d--e--f--#', null, 'dun dun dun');
      const rightSubs =      '^                   !';
      const expected =       '-----------x--y--z--#';

      const result = combineLatest(left, right);

      expectObservable(result).toBe(expected, { x: ['c', 'd'], y: ['c', 'e'], z: ['c', 'f'] }, 'dun dun dun');
      expectSubscriptionsTo(left).toBe(leftSubs);
      expectSubscriptionsTo(right).toBe(rightSubs);
    });
  });

  it('should allow unsubscribing early and explicitly', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =   hot('--a--^--b--c---d-| ');
      const e1subs =        '^        !    ';
      const e2 =   hot('---e-^---f--g---h-|');
      const e2subs =        '^        !    ';
      const expected =      '----x-yz--    ';
      const unsub =         '^--------!    ';
      const values = { x: ['b', 'f'], y: ['c', 'f'], z: ['c', 'g'] };

      const result = combineLatest(e1, e2);

      expectObservable(result, unsub).toBe(expected, values);
      expectSubscriptionsTo(e1).toBe(e1subs);
      expectSubscriptionsTo(e2).toBe(e2subs);
    });
  });

  it('should not break unsubscription chains when unsubscribed explicitly', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =   hot('--a--^--b--c---d-| ');
      const e1subs =        '^        !    ';
      const e2 =   hot('---e-^---f--g---h-|');
      const e2subs =        '^        !    ';
      const expected =      '----x-yz--    ';
      const unsub =         '^--------!    ';
      const values = { x: ['b', 'f'], y: ['c', 'f'], z: ['c', 'g'] };

      const result = combineLatest(
          e1.pipe(mergeMap((x) => of(x))),
          e2.pipe(mergeMap((x) => of(x))),
      ).pipe(mergeMap((x) => of(x)));

      expectObservable(result, unsub).toBe(expected, values);
      expectSubscriptionsTo(e1).toBe(e1subs);
      expectSubscriptionsTo(e2).toBe(e2subs);
    });
  });
});
