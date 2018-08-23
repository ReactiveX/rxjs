import { expect } from 'chai';
import { TestScheduler, parseMarbles, parseMarblesAsSubscriptions } from './TestScheduler';
import { Observable, NEVER, EMPTY, Subject, of, concat, merge, Notification } from 'rxjs';
import { concatMap } from 'rxjs/operators';
import { asapScheduler } from 'rxjs/internal/scheduler/asapScheduler';
import { asyncScheduler } from 'rxjs/internal/scheduler/asyncScheduler';
import { queueScheduler, QueueScheduler } from 'rxjs/internal/scheduler/QueueScheduler';

declare const rxTestScheduler: TestScheduler;

/** @test {TestScheduler} */
describe('TestScheduler', () => {
  it('should exist', () => {
    expect(TestScheduler).exist;
    expect(TestScheduler).to.be.a('function');
  });

  describe('parseMarbles()', () => {
    it('should parse a marble string into a series of notifications and types', () => {
      const result = parseMarbles('-------a---b---|', { a: 'A', b: 'B' });
      expect(result).deep.equal([
        { frame: 7, notification: { kind: 'N', value: 'A' } },
        { frame: 11, notification: { kind: 'N', value: 'B' } },
        { frame: 15, notification: { kind: 'C' } }
      ]);
    });

    it('should parse a marble string, allowing spaces too', () => {
      const result = parseMarbles('--a--b--|   ', { a: 'A', b: 'B' });
      expect(result).deep.equal([
        { frame: 2, notification: { kind: 'N', value: 'A' } },
        { frame: 5, notification: { kind: 'N', value: 'B' } },
        { frame: 8, notification: { kind: 'C' } }
      ]);
    });

    it('should parse a marble string with a subscription point', () => {
      const result = parseMarbles('---^---a---b---|', { a: 'A', b: 'B' });
      expect(result).deep.equal([
        { frame: 4, notification: { kind: 'N', value: 'A' } },
        { frame: 8, notification: { kind: 'N', value: 'B' } },
        { frame: 12, notification: { kind: 'C' } }
      ]);
    });

    it('should parse a marble string with an error', () => {
      const result = parseMarbles('-------a---b---#', { a: 'A', b: 'B' }, 'omg error!');
      expect(result).deep.equal([
        { frame: 7, notification: { kind: 'N', value: 'A' } },
        { frame: 11, notification: { kind: 'N', value: 'B' } },
        { frame: 15, notification: { kind: 'E', error: 'omg error!' } }
      ]);
    });

    it('should default in the letter for the value if no value hash was passed', () => {
      const result = parseMarbles('--a--b--c--');
      expect(result).deep.equal([
        { frame: 2, notification: { kind: 'N', value: 'a' } },
        { frame: 5, notification: { kind: 'N', value: 'b' } },
        { frame: 8, notification: { kind: 'N', value: 'c' } },
      ]);
    });

    it('should handle grouped values', () => {
      const result = parseMarbles('---(abc)---');
      expect(result).deep.equal([
        { frame: 3, notification: { kind: 'N', value: 'a' } },
        { frame: 3, notification: { kind: 'N', value: 'b' } },
        { frame: 3, notification: { kind: 'N', value: 'c' } }
      ]);
    });

    it('should ignore whitespace when runMode=true', () => {
      const runMode = true;
      const result = parseMarbles('  -a - b -    c |       ', { a: 'A', b: 'B', c: 'C' }, undefined, undefined, runMode);
      expect(result).deep.equal([
        { frame: 1, notification: { kind: 'N', value: 'A' } },
        { frame: 3, notification: { kind: 'N', value: 'B' } },
        { frame: 5, notification: { kind: 'N', value: 'C' } },
        { frame: 6, notification: { kind: 'C' } }
      ]);
    });

    it('should support time progression syntax when runMode=true', () => {
      const runMode = true;
      const result = parseMarbles('10.2ms a 1.2s b 1m c|', { a: 'A', b: 'B', c: 'C' }, undefined, undefined, runMode);
      expect(result).deep.equal([
        { frame: 10.2, notification: { kind: 'N', value: 'A' } },
        { frame: 10.2 + 1 + (1.2 * 1000), notification: { kind: 'N', value: 'B' } },
        { frame: 10.2 + 1 + (1.2 * 1000) + 1 + (1000 * 60), notification: { kind: 'N', value: 'C' } },
        { frame: 10.2 + 1 + (1.2 * 1000) + 1 + (1000 * 60) + 1, notification: { kind: 'C' } }
      ]);
    });
  });

  describe('parseMarblesAsSubscriptions()', () => {
    it('should parse a subscription marble string into a subscriptionLog', () => {
      const result = parseMarblesAsSubscriptions('---^---!-');
      expect(result.subscribedFrame).to.equal(3);
      expect(result.unsubscribedFrame).to.equal(7);
    });

    it('should parse a subscription marble string with an unsubscription', () => {
      const result = parseMarblesAsSubscriptions('---^-');
      expect(result.subscribedFrame).to.equal(3);
      expect(result.unsubscribedFrame).to.equal(Number.POSITIVE_INFINITY);
    });

    it('should parse a subscription marble string with a synchronous unsubscription', () => {
      const result = parseMarblesAsSubscriptions('---(^!)-');
      expect(result.subscribedFrame).to.equal(3);
      expect(result.unsubscribedFrame).to.equal(3);
    });

    it('should ignore whitespace when runMode=true', () => {
      const runMode = true;
      const result = parseMarblesAsSubscriptions('  - -  - -  ^ -   - !  -- -      ', runMode);
      expect(result.subscribedFrame).to.equal(4);
      expect(result.unsubscribedFrame).to.equal(7);
    });

    it('should suppport time progression syntax when runMode=true', () => {
      const runMode = true;
      const result = parseMarblesAsSubscriptions('10.2ms ^ 1.2s - 1m !', runMode);
      expect(result.subscribedFrame).to.equal(10.2);
      expect(result.unsubscribedFrame).to.equal(10.2 + 1 + (1.2 * 1000) + 1 + (1000 * 60));
    });
  });

  describe('createTime()', () => {
    it('should parse a simple time marble string to a number', () => {
      const scheduler = new TestScheduler(null);
      const time = scheduler.createTime('-----|');
      expect(time).to.equal(5);
    });

    it('should throw if not given good marble input', () => {
      const scheduler = new TestScheduler(null);
      expect(() => {
        scheduler.createTime('-a-b-#');
      }).to.throw();
    });
  });

  describe('createColdObservable()', () => {
    it('should create a cold observable', () => {
      const expected = ['A', 'B'];
      const scheduler = new TestScheduler(null);
      const source = scheduler.createColdObservable('--a---b--|', { a: 'A', b: 'B' });
      source.subscribe(x => {
        expect(x).to.equal(expected.shift());
      });
      scheduler.flush();
      expect(expected.length).to.equal(0);
    });
  });

  describe('createHotObservable()', () => {
    it('should create a cold observable', () => {
      const expected = ['A', 'B'];
      const scheduler = new TestScheduler(null);
      const source = scheduler.createHotObservable('--a---b--|', { a: 'A', b: 'B' });
      source.subscribe(x => {
        expect(x).to.equal(expected.shift());
      });
      scheduler.flush();
      expect(expected.length).to.equal(0);
    });
  });

  describe('run()', () => {
    const assertDeepEquals = (actual: any, expected: any) => {
      expect(actual).deep.equal(expected);
    };

    describe('marble diagrams', () => {
      // it('should ignore whitespace', () => {
      //   const testScheduler = new TestScheduler(assertDeepEquals);

      //   testScheduler.run(({ cold, expectObservable, expectSubscriptionsTo }) => {
      //     const input = cold('  -a - b -    c |       ');
      //     const output = input.pipe(
      //       concatMap(d => of(d).pipe(
      //         delay(10)
      //       ))
      //     );
      //     const expected = '     -- 9ms a 9ms b 9ms (c|) ';

      //     expectObservable(output).toBe(expected);
      //     expectSubscriptionsTo(input).toBe('  ^- - - - - !');
      //   });
      // });

      it('should support time progression syntax', () => {
        const testScheduler = new TestScheduler(assertDeepEquals);

        testScheduler.run(({ cold, hot, flush, expectObservable, expectSubscriptionsTo }) => {
          const output = cold('10.2ms a 1.2s b 1m c|');
          const expected = '   10.2ms a 1.2s b 1m c|';

          expectObservable(output).toBe(expected);
        });
      });
    });

    it('should provide the correct helpers', () => {
      const testScheduler = new TestScheduler(assertDeepEquals);

      testScheduler.run(({ cold, hot, flush, expectObservable, expectSubscriptionsTo }) => {
        expect(cold).to.be.a('function');
        expect(hot).to.be.a('function');
        expect(flush).to.be.a('function');
        expect(expectObservable).to.be.a('function');
        expect(expectSubscriptionsTo).to.be.a('function');

        const obs1 = cold('-a-c-e|');
        const obs2 = hot(' ^-b-d-f|');
        const output = merge(obs1, obs2);
        const expected = ' -abcdef|';

        expectObservable(output).toBe(expected);
        expectSubscriptionsTo(obs1).toBe('^-----!');
        expectSubscriptionsTo(obs2).toBe('^------!');
      });
    });

    // it('should have each frame represent a single virtual millisecond', () => {
    //   const testScheduler = new TestScheduler(assertDeepEquals);

    //   testScheduler.run(({ cold, expectObservable }) => {
    //     const output = cold('-a-b-c--------|').pipe(
    //       debounceTime(5)
    //     );
    //     const expected = '   ------ 4ms c---|';
    //     expectObservable(output).toBe(expected);
    //   });
    // });

    // it('should have no maximum frame count', () => {
    //   const testScheduler = new TestScheduler(assertDeepEquals);

    //   testScheduler.run(({ cold, expectObservable }) => {
    //     const output = cold('-a|').pipe(
    //       delay(1000 * 10)
    //     );
    //     const expected = '   - 10s a|';
    //     expectObservable(output).toBe(expected);
    //   });
    // });

    // it('should make operators that use AsyncScheduler automatically use TestScheduler for actual scheduling', () => {
    //   const testScheduler = new TestScheduler(assertDeepEquals);

    //   testScheduler.run(({ cold, expectObservable }) => {
    //     const output = cold('-a-b-c--------|').pipe(
    //       debounceTime(5)
    //     );
    //     const expected = '   ----------c---|';
    //     expectObservable(output).toBe(expected);
    //   });
    // });

    // it('should flush automatically', () => {
    //   const testScheduler = new TestScheduler((actual, expected) => {
    //     expect(actual).deep.equal(expected);
    //   });
    //   testScheduler.run(({ cold, expectObservable }) => {
    //     const output = cold('-a-b-c|').pipe(
    //       concatMap(d => of(d).pipe(
    //         delay(10)
    //       ))
    //     );
    //     const expected = '   -- 9ms a 9ms b 9ms (c|)';
    //     expectObservable(output).toBe(expected);

    //     expect(testScheduler['flushTests'].length).to.equal(1);
    //     expect(testScheduler['actions'].length).to.equal(1);
    //   });

    //   expect(testScheduler['flushTests'].length).to.equal(0);
    //   expect(testScheduler['actions'].length).to.equal(0);
    // });

    // it('should support explicit flushing', () => {
    //   const testScheduler = new TestScheduler(assertDeepEquals);

    //   testScheduler.run(({ cold, expectObservable, flush }) => {
    //     const output = cold('-a-b-c|').pipe(
    //       concatMap(d => of(d).pipe(
    //         delay(10)
    //       ))
    //     );
    //     const expected = '   -- 9ms a 9ms b 9ms (c|)';
    //     expectObservable(output).toBe(expected);

    //     expect(testScheduler['flushTests'].length).to.equal(1);
    //     expect(testScheduler['actions'].length).to.equal(1);

    //     flush();

    //     expect(testScheduler['flushTests'].length).to.equal(0);
    //     expect(testScheduler['actions'].length).to.equal(0);
    //   });

    //   expect(testScheduler['flushTests'].length).to.equal(0);
    //   expect(testScheduler['actions'].length).to.equal(0);
    // });

    it('should pass-through return values, e.g. Promises', (done) => {
      const testScheduler = new TestScheduler(assertDeepEquals);

      testScheduler.run(() => {
        return Promise.resolve('foo');
      }).then(value => {
        expect(value).to.equal('foo');
        done();
      });
    });

    // it.skip('should restore changes upon thrown errors', () => {
    //   const testScheduler = new TestScheduler(assertDeepEquals);

    //   const frameTimeFactor = TestScheduler['frameTimeFactor'];
    //   const maxFrames = testScheduler.maxFrames;
    //   const runMode = testScheduler['runMode'];
    //   const delegate = AsyncScheduler.delegate;

    //   try {
    //     testScheduler.run(() => {
    //       throw new Error('kaboom!');
    //     });
    //   } catch { /* empty */ }

    //   expect(TestScheduler['frameTimeFactor']).to.equal(frameTimeFactor);
    //   expect(testScheduler.maxFrames).to.equal(maxFrames);
    //   expect(testScheduler['runMode']).to.equal(runMode);
    //   expect(AsyncScheduler.delegate).to.equal(delegate);
    // });

    it('should flush expectations correctly', () => {
      expect(() => {
        const testScheduler = new TestScheduler(assertDeepEquals);
        testScheduler.run(({ cold, expectObservable, flush }) => {
          expectObservable(cold('-x')).toBe('-x');
          expectObservable(cold('-y')).toBe('-y');
          const expectation = expectObservable(cold('-z'));
          flush();
          expectation.toBe('-q');
        });
      }).to.throw();
    });

    it('should patch asapScheduler', () => {
      const testScheduler = new TestScheduler(assertDeepEquals);
      let test: number;
      testScheduler.run(() => {
        asapScheduler.schedule(() => {
          test = asapScheduler.now();
        }, 10000);
      });
      expect(test).to.equal(10000);
    });

    it('should patch asyncScheduler', () => {
      const testScheduler = new TestScheduler(assertDeepEquals);
      let test: number;
      testScheduler.run(() => {
        asyncScheduler.schedule(() => {
          test = asyncScheduler.now();
        }, 10000);
      });
      expect(test).to.equal(10000);
    });

    it('should work with queueScheduler', () => {
      const testScheduler = new TestScheduler(assertDeepEquals);
      let log: number[] = [];
      testScheduler.run(() => {
        queueScheduler.schedule(() => {
          log.push(queueScheduler.now());
          queueScheduler.schedule(() => log.push(queueScheduler.now()));
          queueScheduler.schedule(() => {
            log.push(queueScheduler.now());
            queueScheduler.schedule(() => log.push(queueScheduler.now()));
          });
        }, 10000);
      });
      expect(log).to.deep.equal([10000, 10000, 10000, 10000]);
    });

    it('should work with new QueueScheduler', () => {
      const testScheduler = new TestScheduler(assertDeepEquals);
      let log: number[] = [];
      const queueScheduler = new QueueScheduler();
      testScheduler.run(() => {
        queueScheduler.schedule(() => {
          log.push(queueScheduler.now());
          queueScheduler.schedule(() => log.push(queueScheduler.now()));
          queueScheduler.schedule(() => {
            log.push(queueScheduler.now());
            queueScheduler.schedule(() => log.push(queueScheduler.now()));
          });
        }, 10000);
      });
      expect(log).to.deep.equal([10000, 10000, 10000, 10000]);
    });
  });
});
