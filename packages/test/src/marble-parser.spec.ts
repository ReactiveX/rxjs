import { describe, expect, it } from 'vitest';
import {
  durationToMilliseconds,
  parseMarbles,
  parseSubscriptionMarbles,
  parseTimeMarbles,
  parseTimingPlan,
  toSubscriptionLog,
} from './marble-parser.js';

describe('marble parser', () => {
  describe('durationToMilliseconds', () => {
    it('parses numeric and unit durations', () => {
      expect(durationToMilliseconds(12)).toBe(12);
      expect(durationToMilliseconds('12ms')).toBe(12);
      expect(durationToMilliseconds('1.5s')).toBe(1_500);
      expect(durationToMilliseconds('1.5m')).toBe(90_000);
      expect(durationToMilliseconds(undefined, 25)).toBe(25);
    });

    it.each([-1, Infinity, '-1ms', '1h', 'ms'])('rejects invalid duration %s', (duration) => {
      expect(() => durationToMilliseconds(duration as never)).toThrow();
    });
  });

  describe('parseMarbles', () => {
    it('ignores alignment whitespace without advancing virtual time', () => {
      const quotePositionedRight = '--^---a---b---c---|';
      const paddedInsideString = '  --^---a---b---c---|';
      const firstDeclaration = `const quotePositionedRight = '${quotePositionedRight}'`;
      const secondDeclaration = `const paddedInsideString = '${paddedInsideString}'`;

      expect(firstDeclaration.indexOf('^')).toBe(secondDeclaration.indexOf('^'));
      expect(parseMarbles(quotePositionedRight, undefined, undefined, { hot: true })).toEqual(
        parseMarbles(paddedInsideString, undefined, undefined, { hot: true })
      );
    });

    it('parses frames, values, durations, completion, and errors', () => {
      const failure = new Error('expected');

      expect(parseMarbles('2ms a-b#', { a: 1, b: 2 }, failure)).toEqual([
        { frame: 2, notification: { kind: 'N', value: 1 } },
        { frame: 4, notification: { kind: 'N', value: 2 } },
        { frame: 5, notification: { kind: 'E', error: failure } },
      ]);
      expect(parseMarbles('20s (a|)', { a: 'done' })).toEqual([
        { frame: 20_000, notification: { kind: 'N', value: 'done' } },
        { frame: 20_000, notification: { kind: 'C' } },
      ]);
    });

    it('preserves synchronous group timestamps while advancing by text width', () => {
      expect(parseMarbles('(ab)-c|')).toEqual([
        { frame: 0, notification: { kind: 'N', value: 'a' } },
        { frame: 0, notification: { kind: 'N', value: 'b' } },
        { frame: 5, notification: { kind: 'N', value: 'c' } },
        { frame: 6, notification: { kind: 'C' } },
      ]);
    });

    it('treats Unicode code points as one marker and recognizes durations only at boundaries', () => {
      expect(parseMarbles('🙂-🚀|')).toEqual([
        { frame: 0, notification: { kind: 'N', value: '🙂' } },
        { frame: 2, notification: { kind: 'N', value: '🚀' } },
        { frame: 3, notification: { kind: 'C' } },
      ]);

      expect(parseMarbles('a12msb').map(({ notification }) => (notification.kind === 'N' ? notification.value : undefined))).toEqual([
        'a',
        '1',
        '2',
        'm',
        's',
        'b',
      ]);
    });

    it('shifts hot messages around one caret and retains negative history', () => {
      expect(parseMarbles('a-^-b|', undefined, undefined, { hot: true })).toEqual([
        { frame: -2, notification: { kind: 'N', value: 'a' } },
        { frame: 2, notification: { kind: 'N', value: 'b' } },
        { frame: 3, notification: { kind: 'C' } },
      ]);
    });

    it.each([
      ['nested groups', '((a))', undefined],
      ['closing an unopened group', 'a)', undefined],
      ['an unclosed group', '(a', undefined],
      ['a caret in a cold diagram', '^a', undefined],
      ['multiple hot carets', '^a^', { hot: true }],
      ['an unsubscription marker', 'a!', undefined],
    ])('rejects %s', (_name, marbles, options) => {
      expect(() => parseMarbles(marbles, undefined, undefined, options)).toThrow();
    });
  });

  describe('parseSubscriptionMarbles', () => {
    it('parses default, explicit, grouped, and numeric subscriptions', () => {
      expect(parseSubscriptionMarbles()).toEqual({
        subscribedFrame: 0,
        unsubscribedFrame: Infinity,
      });
      expect(parseSubscriptionMarbles(null)).toEqual({
        subscribedFrame: 0,
        unsubscribedFrame: Infinity,
      });
      expect(parseSubscriptionMarbles('---^ 12ms !')).toEqual({
        subscribedFrame: 3,
        unsubscribedFrame: 16,
      });
      expect(parseSubscriptionMarbles('---(^!)')).toEqual({
        subscribedFrame: 3,
        unsubscribedFrame: 3,
      });
      expect(toSubscriptionLog(parseSubscriptionMarbles('^--!'))).toEqual({
        subscribedFrame: 0,
        unsubscribedFrame: 3,
      });
    });

    it('leaves the subscription frame unspecified when only unsubscription is marked', () => {
      expect(parseSubscriptionMarbles('----!')).toEqual({
        subscribedFrame: Infinity,
        unsubscribedFrame: 4,
      });
    });

    it.each(['^^', '^!!', '^a!', '(^^)', '(^!'])('rejects invalid subscription diagram %s', (marbles) => {
      expect(() => parseSubscriptionMarbles(marbles)).toThrow();
    });
  });

  describe('parseTimeMarbles', () => {
    it('returns the completion timestamp', () => {
      expect(parseTimeMarbles('12ms ---|')).toBe(15);
    });

    it.each(['---', '|--|', '--a|'])('rejects invalid time diagram %s', (marbles) => {
      expect(() => parseTimeMarbles(marbles)).toThrow();
    });
  });

  describe('parseTimingPlan', () => {
    it('parses marker diagrams and absolute timestamps', () => {
      expect(parseTimingPlan('--a 5ms b')).toEqual([2, 8]);
      expect(parseTimingPlan([0, 4, 9])).toEqual([0, 4, 9]);
    });

    it.each([[[2, 2]], [[2, 1]], [[-1, 2]], ['--|'], ['--(a)']])('rejects invalid timing plan %j', (plan) => {
      expect(() => parseTimingPlan(plan as never)).toThrow();
    });
  });
});
