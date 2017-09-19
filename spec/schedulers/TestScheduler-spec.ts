import { expect } from 'chai';
import * as Rx from '../../dist/package/Rx';
import marbleTestingSignature = require('../helpers/marble-testing'); // tslint:disable-line:no-require-imports

declare const { time };
declare const hot: typeof marbleTestingSignature.hot;
declare const cold: typeof marbleTestingSignature.cold;
declare const expectObservable: typeof marbleTestingSignature.expectObservable;
declare const expectSubscriptions: typeof marbleTestingSignature.expectSubscriptions;

declare const rxTestScheduler: Rx.TestScheduler;
const Notification = Rx.Notification;
const TestScheduler = Rx.TestScheduler;

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
      expect(source instanceof Rx.Observable).to.be.true;
      source.subscribe((x: string) => {
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
      expect(source).to.be.an.instanceof(Rx.Subject);
      source.subscribe((x: string) => {
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
        expect(source instanceof Rx.Subject).to.be.true;
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
        expect(expectObservable(Rx.Observable.of(1)).toBe).to.be.a('function');
      });

      it('should append to flushTests array', () => {
        expectObservable(Rx.Observable.empty());
        expect((<any>rxTestScheduler).flushTests.length).to.equal(1);
      });

      it('should handle empty', () => {
        expectObservable(Rx.Observable.empty()).toBe('|', {});
      });

      it('should handle never', () => {
        expectObservable(Rx.Observable.never()).toBe('-', {});
        expectObservable(Rx.Observable.never()).toBe('---', {});
      });

      it('should accept an unsubscription marble diagram', () => {
        const source = hot('---^-a-b-|');
        const unsubscribe  =  '---!';
        const expected =      '--a';
        expectObservable(source, unsubscribe).toBe(expected);
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
});
