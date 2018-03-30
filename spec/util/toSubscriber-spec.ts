import { expect } from 'chai';
import { toSubscriber } from 'rxjs/internal-compatibility';

describe('toSubscriber', () => {
  it('should not be closed when other subscriber created with no arguments completes', () => {
    let sub1 = toSubscriber();
    let sub2 = toSubscriber();

    sub2.complete();

    expect(sub1.closed).to.be.false;
    expect(sub2.closed).to.be.true;
  });

it('should not be closed when other subscriber created with same observer instance completes', () => {
    let observer = {
      next: function () { /*noop*/ }
    };

    let sub1 = toSubscriber(observer);
    let sub2 = toSubscriber(observer);

    sub2.complete();

    expect(sub1.closed).to.be.false;
    expect(sub2.closed).to.be.true;
  });
});
