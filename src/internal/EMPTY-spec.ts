import { EMPTY } from "rxjs/internal/EMPTY";
import { expect } from "chai";

describe('EMPTY', () => {
  it('should complete and emit nothing', () => {
    let completed = false;
    EMPTY.subscribe({
      next() { throw new Error('this should not happen'); },
      error(err) { throw err; },
      complete() {
        completed = true;
      }
    });

    expect(completed).to.be.true;
  });
});
