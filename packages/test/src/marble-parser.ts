/**
 * Pure marble and duration parsing. This module has no virtual-clock, host,
 * Observable, or assertion dependencies so grammar behavior can be tested and
 * evolved independently from the `rxTest` runtime.
 */

export type MarbleDuration = number | `${number}ms` | `${number}s` | `${number}m`;

export type MarbleTimingPlan = string | readonly number[];

export type MarbleValueLookup<T> = Readonly<Record<string, T>> | readonly T[];

export type MarbleNotification<T> =
  | { readonly kind: 'N'; readonly value: T }
  | { readonly kind: 'E'; readonly error: unknown }
  | { readonly kind: 'C' };

export interface MarbleMessage<T = unknown> {
  readonly frame: number;
  readonly notification: MarbleNotification<T>;
}

const durationPattern = /^(\d+(?:\.\d+)?)(ms|s|m)(?=\s|$)/;

export interface ParsedSubscription {
  readonly subscribedFrame: number;
  readonly unsubscribedFrame: number;
}

export function durationToMilliseconds(duration: MarbleDuration | undefined, defaultValue = 0): number {
  if (duration === undefined) {
    return defaultValue;
  }
  if (typeof duration === 'number') {
    return validateDuration(duration);
  }

  const match = /^(\d+(?:\.\d+)?)(ms|s|m)$/.exec(duration);
  if (!match) {
    throw new TypeError(`Invalid test duration: ${duration}`);
  }
  const value = match[1];
  const unit = match[2];
  if (value === undefined || unit === undefined) {
    throw new TypeError(`Invalid test duration: ${duration}`);
  }
  return durationPartsToMilliseconds(Number(value), unit);
}

export function parseMarbles<T>(
  marbles: string,
  values?: MarbleValueLookup<T>,
  error?: unknown,
  options: { hot?: boolean } = {}
): MarbleMessage<T>[] {
  const characters = [...marbles];
  const messages: MarbleMessage<T>[] = [];
  let frame = 0;
  let groupStart: number | undefined;
  let zeroFrame = 0;
  let hasZeroMarker = false;

  for (let index = 0; index < characters.length; index++) {
    const character = characters[index];
    if (character === undefined) {
      break;
    }
    if (isWhitespace(character)) {
      continue;
    }

    const duration = readDuration(characters, index);
    if (duration) {
      frame += duration.milliseconds;
      index += duration.length - 1;
      continue;
    }

    const messageFrame = groupStart ?? frame;
    switch (character) {
      case '-':
        frame += 1;
        break;
      case '(':
        if (groupStart !== undefined) {
          throw new Error('Nested marble groups are not supported.');
        }
        groupStart = frame;
        frame += 1;
        break;
      case ')':
        if (groupStart === undefined) {
          throw new Error('Found a closing marble group without an opening group.');
        }
        groupStart = undefined;
        frame += 1;
        break;
      case '|':
        messages.push({
          frame: messageFrame,
          notification: { kind: 'C' },
        });
        frame += 1;
        break;
      case '#':
        messages.push({
          frame: messageFrame,
          notification: {
            kind: 'E',
            error: error === undefined ? 'error' : error,
          },
        });
        frame += 1;
        break;
      case '^':
        if (!options.hot) {
          throw new Error('Only hot marble diagrams can contain "^".');
        }
        if (hasZeroMarker) {
          throw new Error('A hot marble diagram can contain only one "^".');
        }
        zeroFrame = messageFrame;
        hasZeroMarker = true;
        frame += 1;
        break;
      case '!':
        throw new Error('Observable marble diagrams cannot contain "!".');
      default:
        messages.push({
          frame: messageFrame,
          notification: {
            kind: 'N',
            value: readMarbleValue(character, values),
          },
        });
        frame += 1;
        break;
    }
  }

  if (groupStart !== undefined) {
    throw new Error('Marble diagram contains an unclosed group.');
  }

  if (zeroFrame !== 0) {
    return messages.map((message) => ({
      ...message,
      frame: message.frame - zeroFrame,
    }));
  }
  return messages;
}

export function parseSubscriptionMarbles(marbles?: string | null): ParsedSubscription {
  if (marbles == null) {
    return {
      subscribedFrame: 0,
      unsubscribedFrame: Infinity,
    };
  }

  const characters = [...marbles];
  let frame = 0;
  let groupStart: number | undefined;
  let subscribedFrame = Infinity;
  let unsubscribedFrame = Infinity;

  for (let index = 0; index < characters.length; index++) {
    const character = characters[index];
    if (character === undefined) {
      break;
    }
    if (isWhitespace(character)) {
      continue;
    }

    const duration = readDuration(characters, index);
    if (duration) {
      frame += duration.milliseconds;
      index += duration.length - 1;
      continue;
    }

    switch (character) {
      case '-':
        frame += 1;
        break;
      case '(':
        if (groupStart !== undefined) {
          throw new Error('Nested subscription groups are not supported.');
        }
        groupStart = frame;
        frame += 1;
        break;
      case ')':
        if (groupStart === undefined) {
          throw new Error('Found a closing subscription group without an opening group.');
        }
        groupStart = undefined;
        frame += 1;
        break;
      case '^':
        if (subscribedFrame !== Infinity) {
          throw new Error('A subscription marble diagram can contain only one "^".');
        }
        subscribedFrame = groupStart ?? frame;
        frame += 1;
        break;
      case '!':
        if (unsubscribedFrame !== Infinity) {
          throw new Error('A subscription marble diagram can contain only one "!".');
        }
        unsubscribedFrame = groupStart ?? frame;
        break;
      default:
        throw new Error(`Subscription marble diagrams cannot contain "${character}".`);
    }
  }

  if (groupStart !== undefined) {
    throw new Error('Subscription marble diagram contains an unclosed group.');
  }
  return { subscribedFrame, unsubscribedFrame };
}

export function parseTimeMarbles(marbles: string): number {
  const characters = [...marbles];
  let frame = 0;
  let completionFrame: number | undefined;

  for (let index = 0; index < characters.length; index++) {
    const character = characters[index];
    if (character === undefined) {
      break;
    }
    if (isWhitespace(character)) {
      continue;
    }

    const duration = readDuration(characters, index);
    if (duration) {
      frame += duration.milliseconds;
      index += duration.length - 1;
      continue;
    }

    if (character === '-') {
      frame += 1;
      continue;
    }
    if (character === '|') {
      if (completionFrame !== undefined) {
        throw new Error('A time marble diagram must contain exactly one "|".');
      }
      completionFrame = frame;
      frame += 1;
      continue;
    }
    throw new Error(`Time marble diagrams cannot contain "${character}".`);
  }

  if (completionFrame === undefined) {
    throw new Error('A time marble diagram must contain exactly one "|".');
  }
  return completionFrame;
}

export function parseTimingPlan(plan: MarbleTimingPlan): number[] {
  if (typeof plan !== 'string') {
    let previous = -Infinity;
    return plan.map((time) => {
      const valid = validateDuration(time);
      if (valid <= previous) {
        throw new Error('Timing plan entries must be strictly increasing absolute times.');
      }
      previous = valid;
      return valid;
    });
  }

  const characters = [...plan];
  const opportunities: number[] = [];
  let frame = 0;

  for (let index = 0; index < characters.length; index++) {
    const character = characters[index];
    if (character === undefined) {
      break;
    }
    if (isWhitespace(character)) {
      continue;
    }

    const duration = readDuration(characters, index);
    if (duration) {
      frame += duration.milliseconds;
      index += duration.length - 1;
      continue;
    }

    if (character === '-') {
      frame += 1;
      continue;
    }
    if ('|#^!()'.includes(character)) {
      throw new Error(`Timing plans cannot contain the reserved marker "${character}".`);
    }
    opportunities.push(frame);
    frame += 1;
  }
  return opportunities;
}

export function toSubscriptionLog(subscription: ParsedSubscription): ParsedSubscription {
  return {
    subscribedFrame: subscription.subscribedFrame,
    unsubscribedFrame: subscription.unsubscribedFrame,
  };
}

function readDuration(characters: readonly string[], index: number): { length: number; milliseconds: number } | undefined {
  const character = characters[index];
  if (character === undefined) {
    return undefined;
  }
  if (!/\d/.test(character)) {
    return undefined;
  }
  const previous = characters[index - 1];
  if (index > 0 && (previous === undefined || !isWhitespace(previous))) {
    return undefined;
  }

  const remaining = characters.slice(index).join('');
  const match = durationPattern.exec(remaining);
  if (!match) {
    return undefined;
  }
  const value = match[1];
  const unit = match[2];
  if (value === undefined || unit === undefined) {
    return undefined;
  }
  return {
    length: [...match[0]].length,
    milliseconds: durationPartsToMilliseconds(Number(value), unit),
  };
}

function durationPartsToMilliseconds(value: number, unit: string): number {
  const multiplier = unit === 'ms' ? 1 : unit === 's' ? 1000 : 60_000;
  return validateDuration(value * multiplier);
}

function validateDuration(value: number): number {
  if (!Number.isFinite(value) || value < 0) {
    throw new TypeError(`Test durations must be finite and non-negative. Received ${value}.`);
  }
  return value;
}

function readMarbleValue<T>(character: string, values?: MarbleValueLookup<T>): T {
  if (values === undefined) {
    return character as T;
  }
  return (values as Readonly<Record<string, T>>)[character] as T;
}

function isWhitespace(character: string): boolean {
  return /\s/.test(character);
}
