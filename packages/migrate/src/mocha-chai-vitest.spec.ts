import { describe, expect, it } from 'vitest';
import { migrateMochaChaiToVitest } from './mocha-chai-vitest.js';

describe('migrateMochaChaiToVitest', () => {
  it('converts supported assertions and spies to ordinary Vitest APIs', () => {
    const source = `
      import { expect } from 'chai';
      import sinon from 'sinon';
      describe('value', () => {
        it('asserts', () => {
          const spy = sinon.spy();
          const stub = sinon.stub().callsFake(() => 1);
          expect(1).to.equal(1);
          expect(true).to.be.true;
          expect([]).to.be.empty;
          expect({ a: 1 }).to.deep.equal({ a: 1 });
          expect({ a: 1 }).to.have.property('a', 1);
          expect('abc').to.match(/a/);
          expect(() => { throw new Error('x'); }).to.throw();
          expect(spy).to.have.callCount(0);
        });
      });
    `;
    const result = migrateMochaChaiToVitest(source);
    expect(result.code).toContain("from \"vitest\"");
    expect(result.code).toContain('vi.fn()');
    expect(result.code).toContain('vi.fn(() => 1)');
    expect(result.code).toContain('expect(1).toBe(1)');
    expect(result.code).toContain('expect(true).toBe(true)');
    expect(result.code).toContain('expect([]).toHaveLength(0)');
    expect(result.code).toContain('toEqual({ a: 1 })');
    expect(result.code).toContain("toHaveProperty('a', 1)");
    expect(result.code).toContain('toMatch(/a/)');
    expect(result.code).toContain('toThrow()');
    expect(result.code).toContain('toHaveBeenCalledTimes(0)');
    expect(result.code).not.toContain("from 'chai'");
  });

  it('reports unsupported Chai assertions instead of inventing helpers', () => {
    const result = migrateMochaChaiToVitest(`import { expect, assert } from 'chai'; expect(value).to.have.keys('a'); assert.ok(value);`);
    expect(result.code).toContain("expect(value).to.have.keys('a')");
    expect(result.code).toContain('import { assert } from \'chai\'');
    expect(result.diagnostics).toContainEqual(expect.objectContaining({ code: 'unsupported-framework-feature' }));
  });
});
