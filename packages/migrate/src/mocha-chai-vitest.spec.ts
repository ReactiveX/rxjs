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
    const source = `import { expect, assert } from 'chai'; expect(value).to.have.keys('a'); assert.ok(value);`;
    const result = migrateMochaChaiToVitest(source);
    expect(result.status).toBe('refused');
    expect(result.code).toBe(source);
    expect(result.code).toContain("expect(value).to.have.keys('a')");
    expect(result.diagnostics).toContainEqual(expect.objectContaining({ code: 'unsupported-framework-feature' }));
  });

  it('supports an aliased Chai expect binding', () => {
    const result = migrateMochaChaiToVitest(`import { expect as chaiExpect } from 'chai'; chaiExpect(1).to.equal(1);`);
    expect(result.status).toBe('changed');
    expect(result.code).toContain('expect(1).toBe(1)');
    expect(result.code).not.toContain('chaiExpect');
  });

  it('supports an aliased Sinon default import', () => {
    const result = migrateMochaChaiToVitest(`import s from 'sinon'; const spy = s.spy();`);
    expect(result.status).toBe('changed');
    expect(result.code).toContain('vi.fn()');
    expect(result.code).not.toContain('s.spy()');
  });

  it('refuses a shadowed Chai expect binding', () => {
    const source = `import { expect } from 'chai'; function check(expect: unknown) { return expect; } expect(1).to.equal(1);`;
    const result = migrateMochaChaiToVitest(source);
    expect(result).toMatchObject({ status: 'refused', code: source });
    expect(result.diagnostics).toContainEqual(expect.objectContaining({ code: 'unsafe-binding' }));
  });

  it('leaves an already migrated file byte-identical', () => {
    const source = `import { expect } from 'vitest';\nexpect(1).toBe(1);\n`;
    expect(migrateMochaChaiToVitest(source)).toEqual({ status: 'unchanged', code: source, diagnostics: [], imports: [] });
  });

  it('refuses unsupported terminal property assertions before changing imports', () => {
    const source = `import { expect } from 'chai'; expect(value).to.be.ok;`;
    const result = migrateMochaChaiToVitest(source);
    expect(result).toMatchObject({ status: 'refused', code: source });
    expect(result.diagnostics).toContainEqual(expect.objectContaining({ code: 'unsupported-framework-feature' }));
  });

  it('does not rewrite an unrelated local named sinon', () => {
    const source = `import 'mocha'; const sinon = { spy: () => 1 }; const value = sinon.spy();`;
    const result = migrateMochaChaiToVitest(source);
    expect(result.code).toContain('sinon.spy()');
    expect(result.code).not.toContain('vi.fn()');
  });
});
