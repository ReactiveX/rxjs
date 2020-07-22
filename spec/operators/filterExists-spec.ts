import { filterExists } from 'rxjs/operators';

import { cold, expectObservable } from '../helpers/marble-testing';

/** @test {filterExists} */
describe('filterExists operator', () => {
  it('should works for NaN', () => {
    const values = {
      a: NaN,
    };
    const e1 =  cold('--a---|', values);
    const expected = '------|';

    const result = e1.pipe(filterExists());
    expectObservable(result).toBe(expected)
  });

  it('should works for undefined', () => {
    const values = {
      a: undefined,
    };
    const e1 =  cold('--a---|', values);
    const expected = '------|';

    const result = e1.pipe(filterExists());
    expectObservable(result).toBe(expected)
  });
  
  it('should works for null', () => {
    const values = {
      a: null,
    };
    const e1 =  cold('--a---|', values);
    const expected = '------|';

    const result = e1.pipe(filterExists());
    expectObservable(result).toBe(expected)
  });

  it('should works for boolean', () => {
    const values = {
      a: false,
      b: true,
      c: false,
    };
    const e1 =  cold('--a--b--c---|', values);
    const expected = '-----x------|';

    const result = e1.pipe(filterExists());
    expectObservable(result).toBe(expected, {x: true})
  });

  it('should works for string', () => {
    const values = {
      a: 'value',
      b: '',
      c: '    ',
      d: '1'
    };
    const e1 =  cold('--a--b--c--d---|', values);
    const expected = '--x--------y---|';

    const result = e1.pipe(filterExists());
    expectObservable(result).toBe(expected, {x: values.a, y: values.d})
  });

  it('should works for Array', () => {
    const values = {
      a: [1, 3, 2, 4],
      b: [],
      c: [],
      d: [1]
    };
    const e1 =  cold('--a--b--c--d---|', values);
    const expected = '--x--------y---|';

    const result = e1.pipe(filterExists());
    expectObservable(result).toBe(expected, {x: values.a, y: values.d})
  });
  
  it('should works for Object', () => {
    const values = {
      a: {a: 1, b:2},
      b: {},
      c: {},
      d: {a: undefined, b: null, c: NaN},
    };
    const e1 =  cold('--a--b--c--d---|', values);
    const expected = '--x--------y---|';

    const result = e1.pipe(filterExists());
    expectObservable(result).toBe(expected, {x: values.a, y: values.d})
  });
});
