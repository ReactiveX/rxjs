import { root } from '../util/root';

const Symbol: any = root.Symbol;

export const $$rxSubscriber = (typeof Symbol === 'function' && typeof Symbol.for === 'function') ?
  Symbol.for('rxSubscriber') : '@@rxSubscriber';
