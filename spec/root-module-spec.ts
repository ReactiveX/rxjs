import * as Rx from '../dist/cjs/Rx';
import {it} from './helpers/test-helper';

describe('Root Module', () => {
  it('should contain exports from commonjs modules', () => {
    expect(typeof Rx.Observable).toBe('function');
  });
});
