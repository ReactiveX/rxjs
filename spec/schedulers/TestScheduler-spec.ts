import { expect } from 'chai';
import { hot, cold, expectObservable, expectSubscriptions, time } from '../helpers/marble-testing';
import { AsyncScheduler } from 'rxjs/internal/scheduler/AsyncScheduler';
import { TestScheduler } from 'rxjs/testing';
import { Observable, NEVER, EMPTY, Subject, of, concat, merge, Notification } from 'rxjs';
import { delay, debounceTime, concatMap } from 'rxjs/operators';

declare const rxTestScheduler: TestScheduler;

/** @test {TestScheduler} */
describe('TestScheduler', () => {
  it('should exist', () => {
    expect(TestScheduler).exist;
    expect(TestScheduler).to.be.a('function');
  });

  describe('parseMarbles()', () => {
    it('should parse a marble string into a series of notifications and types', () => {
      const result = TestScheduler.parseMarbles('-------a---b---|', { a: 'A', b: 'B' });
      expect(result).deep.equal([
        { frame: 70, notification: Notification.createNext('A') },
        { frame: 110, notification: Notification.createNext('B') },
        { frame: 150, notification: Notification.createComplete() }
      ]);
    });

    it('should parse a marble string, allowing spaces too', () => {
      const result = TestScheduler.parseMarbles('--a--b--|   ', { a: 'A', b: 'B' });
      expect(result).deep.equal([
        { frame: 20, notification: Notification.createNext('A') },
        { frame: 50, notification: Notification.createNext('B') },
        { frame: 80, notification: Notification.createComplete() }
      ]);
    });

    it('should parse a marble string with a subscription point', () => {
      const result = TestScheduler.parseMarbles('---^---a---b---|', { a: 'A', b: 'B' });
      expect(result).deep.equal([
        { frame: 40, notification: Notification.createNext('A') },
        { frame: 80, notification: Notification.createNext('B') },
        { frame: 120, notification: Notification.createComplete() }
      ]);
    });

    it('should parse a marble string with an error', () => {
      const result = TestScheduler.parseMarbles('-------a---b---#', { a: 'A', b: 'B' }, 'omg error!');
      expect(result).deep.equal([
        { frame: 70, notification: Notification.createNext('A') },
        { frame: 110, notification: Notification.createNext('B') },
        { frame: 150, notification: Notification.createError('omg error!') }
      ]);
    });

    it('should default in the letter for the value if no value hash was passed', () => {
      const result = TestScheduler.parseMarbles('--a--b--c--');
      expect(result).deep.equal([
        { frame: 20, notification: Notification.createNext('a') },
        { frame: 50, notification: Notification.createNext('b') },
        { frame: 80, notification: Notification.createNext('c') },
      ]);
    });

    it('should handle grouped values', () => {
      const result = TestScheduler.parseMarbles('---(abc)---');
      expect(result).deep.equal([
        { frame: 30, notification: Notification.createNext('a') },
        { frame: 30, notification: Notification.createNext('b') },
        { frame: 30, notification: Notification.createNext('c') }
      ]);
    });

    it('should ignore whitespace when runMode=true', () => {
      const runMode = true;
      const result = TestScheduler.parseMarbles('  -a - b -    c |       ', { a: 'A', b: 'B', c: 'C' }, undefined, undefined, runMode);
      expect(result).deep.equal([
        { frame: 10, notification: Notification.createNext('A') },
        { frame: 30, notification: Notification.createNext('B') },
        { frame: 50, notification: Notification.createNext('C') },
        { frame: 60, notification: Notification.createComplete() }
      ]);
    });

    it('should suppport time progression syntax when runMode=true', () => {
      const runMode = true;
      const result = TestScheduler.parseMarbles('10.2ms a 1.2s b 1m c|', { a: 'A', b: 'B', c: 'C' }, undefined, undefined, runMode);
      expect(result).deep.equal([
        { frame: 10.2, notification: Notification.createNext('A') },
        { frame: 10.2 + 10 + (1.2 * 1000), notification: Notification.createNext('B') },
        { frame: 10.2 + 10 + (1.2 * 1000) + 10 + (1000 * 60), notification: Notification.createNext('C') },
        { frame: 10.2 + 10 + (1.2 * 1000) + 10 + (1000 * 60) + 10, notification: Notification.createComplete() }
      ]);
    });
  });

  describe('parseMarblesAsSubscriptions()', () => {
    it('should parse a subscription marble string into a subscriptionLog', () => {
      const result = TestScheduler.parseMarblesAsSubscriptions('---^---!-');
      expect(result.subscribedFrame).to.equal(30);
      expect(result.unsubscribedFrame).to.equal(70);
    });

    it('should parse a subscription marble string with an unsubscription', () => {
      const result = TestScheduler.parseMarblesAsSubscriptions('---^-');
      expect(result.subscribedFrame).to.equal(30);
      expect(result.unsubscribedFrame).to.equal(Number.POSITIVE_INFINITY);
    });

    it('should parse a subscription marble string with a synchronous unsubscription', () => {
      const result = TestScheduler.parseMarblesAsSubscriptions('---(^!)-');
      expect(result.subscribedFrame).to.equal(30);
      expect(result.unsubscribedFrame).to.equal(30);
    });

    it('should ignore whitespace when runMode=true', () => {
      const runMode = true;
      const result = TestScheduler.parseMarblesAsSubscriptions('  - -  - -  ^ -   - !  -- -      ', runMode);
      expect(result.subscribedFrame).to.equal(40);
      expect(result.unsubscribedFrame).to.equal(70);
    });

    it('should suppport time progression syntax when runMode=true', () => {
      const runMode = true;
      const result = TestScheduler.parseMarblesAsSubscriptions('10.2ms ^ 1.2s - 1m !', runMode);
      expect(result.subscribedFrame).to.equal(10.2);
      expect(result.unsubscribedFrame).to.equal(10.2 + 10 + (1.2 * 1000) + 10 + (1000 * 60));
    });
  });

  describe('createTime()', () => {
    it('should parse a simple time marble string to a number', () => {
      const scheduler = new TestScheduler(null);
      const time = scheduler.createTime('-----|');
      expect(time).to.equal(50);
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
      expect(source).to.be.an.instanceOf(Observable);
      source.subscribe(x => {
        expect(x).to.equal(expected.shift());
      });
      scheduler.flush();
      expect(expected.length).to.equal(0);
    });
  });

  describe('createHotObservable()', () => {
    it('should create a hot observable', () => {
      const expected = ['A', 'B'];
      const scheduler = new TestScheduler(null);
      const source = scheduler.createHotObservable('--a---b--|', { a: 'A', b: 'B' });
      expect(source).to.be.an.instanceof(Subject);
      source.subscribe(x => {
        expect(x).to.equal(expected.shift());
      });
      scheduler.flush();
      expect(expected.length).to.equal(0);
    });
  });

  describe('jasmine helpers', () => {
    describe('rxTestScheduler', () => {
      it('should exist', () => {
        expect(rxTestScheduler).to.be.an.instanceof(TestScheduler);
      });
    });

    describe('cold()', () => {
      it('should exist', () => {
        expect(cold).to.exist;
        expect(cold).to.be.a('function');
      });

      it('should create a cold observable', () => {
        const expected = [1, 2];
        const source = cold('-a-b-|', { a: 1, b: 2 });
        source.subscribe((x: number) => {
          expect(x).to.equal(expected.shift());
        }, null, () => {
          expect(expected.length).to.equal(0);
        });
        expectObservable(source).toBe('-a-b-|', { a: 1, b: 2 });
      });
    });

    describe('hot()', () => {
      it('should exist', () => {
        expect(hot).to.exist;
        expect(hot).to.be.a('function');
      });

      it('should create a hot observable', () => {
        const source = hot('---^-a-b-|', { a: 1, b: 2 });
        expect(source).to.be.an.instanceOf(Subject);
        expectObservable(source).toBe('--a-b-|', { a: 1, b: 2 });
      });
    });

    describe('time()', () => {
      it('should exist', () => {
        expect(time).to.exist;
        expect(time).to.be.a('function');
      });

      it('should parse a simple time marble string to a number', () => {
        expect(time('-----|')).to.equal(50);
      });
    });

    describe('expectObservable()', () => {
      it('should exist', () => {
        expect(expectObservable).to.exist;
        expect(expectObservable).to.be.a('function');
      });

      it('should return an object with a toBe function', () => {
        expect(expectObservable(of(1)).toBe).to.be.a('function');
      });

      it('should append to flushTests array', () => {
        expectObservable(EMPTY);
        expect((<any>rxTestScheduler).flushTests.length).to.equal(1);
      });

      it('should handle empty', () => {
        expectObservable(EMPTY).toBe('|', {});
      });

      it('should handle never', () => {
        expectObservable(NEVER).toBe('-', {});
        expectObservable(NEVER).toBe('---', {});
      });

      it('should accept an unsubscription marble diagram', () => {
        const source = hot('---^-a-b-|');
        const unsubscribe  =  '---!';
        const expected =      '--a';
        expectObservable(source, unsubscribe).toBe(expected);
      });

      it('should accept a subscription marble diagram', () => {
        const source = hot('-a-b-c|');
        const subscribe =  '---^';
        const expected =   '---b-c|';
        expectObservable(source, subscribe).toBe(expected);
      });
    });

    describe('expectSubscriptions()', () => {
      it('should exist', () => {
        expect(expectSubscriptions).to.exist;
        expect(expectSubscriptions).to.be.a('function');
      });

      it('should return an object with a toBe function', () => {
        expect(expectSubscriptions([]).toBe).to.be.a('function');
      });

      it('should append to flushTests array', () => {
        expectSubscriptions([]);
        expect((<any>rxTestScheduler).flushTests.length).to.equal(1);
      });

      it('should assert subscriptions of a cold observable', () => {
        const source = cold('---a---b-|');
        const subs =        '^--------!';
        expectSubscriptions(source.subscriptions).toBe(subs);
        source.subscribe();
      });
    });

    describe('end-to-end helper tests', () => {
      it('should be awesome', () => {
        const values = { a: 1, b: 2 };
        const myObservable = cold('---a---b--|', values);
        const subs =              '^---------!';
        expectObservable(myObservable).toBe('---a---b--|', values);
        expectSubscriptions(myObservable.subscriptions).toBe(subs);
      });

      it('should support testing metastreams', () => {
        const x = cold('-a-b|');
        const y = cold('-c-d|');
        const myObservable = hot('---x---y----|', { x: x, y: y });
        const expected =         '---x---y----|';
        const expectedx = cold('-a-b|');
        const expectedy = cold('-c-d|');
        expectObservable(myObservable).toBe(expected, { x: expectedx, y: expectedy });
      });
    });
  });

  describe('TestScheduler.run()', () => {
    const assertDeepEquals = (actual: any, expected: any) => {
      expect(actual).deep.equal(expected);
    };

    describe('marble diagrams', () => {
      it('should ignore whitespace', () => {
        const testScheduler = new TestScheduler(assertDeepEquals);

        testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
          const input = cold('  -a - b -    c |       ');
          const output = input.pipe(
            concatMap(d => of(d).pipe(
              delay(10)
            ))
          );
          const expected = '     -- 9ms a 9ms b 9ms (c|) ';

          expectObservable(output).toBe(expected);
          expectSubscriptions(input.subscriptions).toBe('  ^- - - - - !');
        });
      });

      it('should support time progression syntax', () => {
        const testScheduler = new TestScheduler(assertDeepEquals);

        testScheduler.run(({ cold, hot, flush, expectObservable, expectSubscriptions }) => {
          const output = cold('10.2ms a 1.2s b 1m c|');
          const expected = '   10.2ms a 1.2s b 1m c|';

          expectObservable(output).toBe(expected);
        });
      });
    });

    it('should provide the correct helpers', () => {
      const testScheduler = new TestScheduler(assertDeepEquals);

      testScheduler.run(({ cold, hot, flush, expectObservable, expectSubscriptions }) => {
        expect(cold).to.be.a('function');
        expect(hot).to.be.a('function');
        expect(flush).to.be.a('function');
        expect(expectObservable).to.be.a('function');
        expect(expectSubscriptions).to.be.a('function');

        const obs1 = cold('-a-c-e|');
        const obs2 = hot(' ^-b-d-f|');
        const output = merge(obs1, obs2);
        const expected = ' -abcdef|';

        expectObservable(output).toBe(expected);
        expectSubscriptions(obs1.subscriptions).toBe('^-----!');
        expectSubscriptions(obs2.subscriptions).toBe('^------!');
      });
    });

    it('should have each frame represent a single virtual millisecond', () => {
      const testScheduler = new TestScheduler(assertDeepEquals);

      testScheduler.run(({ cold, expectObservable }) => {
        const output = cold('-a-b-c--------|').pipe(
          debounceTime(5)
        );
        const expected = '   ------ 4ms c---|';
        expectObservable(output).toBe(expected);
      });
    });

    it('should have no maximum frame count', () => {
      const testScheduler = new TestScheduler(assertDeepEquals);

      testScheduler.run(({ cold, expectObservable }) => {
        const output = cold('-a|').pipe(
          delay(1000 * 10)
        );
        const expected = '   - 10s a|';
        expectObservable(output).toBe(expected);
      });
    });

    it('should make operators that use AsyncScheduler automatically use TestScheduler for actual scheduling', () => {
      const testScheduler = new TestScheduler(assertDeepEquals);

      testScheduler.run(({ cold, expectObservable }) => {
        const output = cold('-a-b-c--------|').pipe(
          debounceTime(5)
        );
        const expected = '   ----------c---|';
        expectObservable(output).toBe(expected);
      });
    });

    it('should flush automatically', () => {
      const testScheduler = new TestScheduler((actual, expected) => {
        expect(actual).deep.equal(expected);
      });
      testScheduler.run(({ cold, expectObservable }) => {
        const output = cold('-a-b-c|').pipe(
          concatMap(d => of(d).pipe(
            delay(10)
          ))
        );
        const expected = '   -- 9ms a 9ms b 9ms (c|)';
        expectObservable(output).toBe(expected);

        expect(testScheduler['flushTests'].length).to.equal(1);
        expect(testScheduler['actions'].length).to.equal(1);
      });

      expect(testScheduler['flushTests'].length).to.equal(0);
      expect(testScheduler['actions'].length).to.equal(0);
    });

    it('should support explicit flushing', () => {
      const testScheduler = new TestScheduler(assertDeepEquals);

      testScheduler.run(({ cold, expectObservable, flush }) => {
        const output = cold('-a-b-c|').pipe(
          concatMap(d => of(d).pipe(
            delay(10)
          ))
        );
        const expected = '   -- 9ms a 9ms b 9ms (c|)';
        expectObservable(output).toBe(expected);

        expect(testScheduler['flushTests'].length).to.equal(1);
        expect(testScheduler['actions'].length).to.equal(1);

        flush();

        expect(testScheduler['flushTests'].length).to.equal(0);
        expect(testScheduler['actions'].length).to.equal(0);
      });

      expect(testScheduler['flushTests'].length).to.equal(0);
      expect(testScheduler['actions'].length).to.equal(0);
    });

    it('should pass-through return values, e.g. Promises', (done) => {
      const testScheduler = new TestScheduler(assertDeepEquals);

      testScheduler.run(() => {
        return Promise.resolve('foo');
      }).then(value => {
        expect(value).to.equal('foo');
        done();
      });
    });

    it('should restore changes upon thrown errors', () => {
      const testScheduler = new TestScheduler(assertDeepEquals);

      const frameTimeFactor = TestScheduler['frameTimeFactor'];
      const maxFrames = testScheduler.maxFrames;
      const runMode = testScheduler['runMode'];
      const delegate = AsyncScheduler.delegate;

      try {
        testScheduler.run(() => {
          throw new Error('kaboom!');
        });
      } catch { /* empty */ }

      expect(TestScheduler['frameTimeFactor']).to.equal(frameTimeFactor);
      expect(testScheduler.maxFrames).to.equal(maxFrames);
      expect(testScheduler['runMode']).to.equal(runMode);
      expect(AsyncScheduler.delegate).to.equal(delegate);
    });

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
  });
});
