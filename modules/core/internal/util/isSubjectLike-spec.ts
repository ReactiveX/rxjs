import { Subject } from "../Subject";
import { expect } from "chai";
import { isSubjectLike } from "./isSubjectLike";
import { Observable } from "../Observable";

describe('isSubjectLike', () => {
  it('should pass for Subjects', () => {
    const o = new Subject();
    expect(isSubjectLike(o)).to.be.true;
  });

  it('should pass for subject like objects', () => {
    const o = {
      next() { /* noop */ },
      error() { /* noop */ },
      complete() { /* noop */ },
      subscribe() { /* noop */ },
    };

    expect(isSubjectLike(o)).to.be.true;
  });

  it('should fail for nulls', () => {
    expect(isSubjectLike(null)).to.be.false;
  });

  it('should fail for non subscribable observers', () => {
    const o = {
      next() { /* noop */ },
      error() { /* noop */ },
      complete() { /* noop */ },
    };

    expect(isSubjectLike(o)).to.be.false;
  });

  it('should fail for plain Observables', () => {
    const o = new Observable();
    expect(isSubjectLike(o)).to.be.false;
  });
});
