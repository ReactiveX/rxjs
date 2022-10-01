/** @prettier */
import { createErrorClass } from 'rxjs/internal/util/createErrorClass';
import { expect } from 'chai';

describe('createErrorClass', () => {
  it('should create a class that subclasses error and has the right properties', () => {
    const MySpecialError: any = createErrorClass(
      (_super) =>
        function MySpecialError(this: any, arg1: number, arg2: string) {
          _super(this);
          this.message = 'Super special error!';
          this.arg1 = arg1;
          this.arg2 = arg2;
        }
    );

    expect(MySpecialError).to.be.a('function');
    const err = new MySpecialError(123, 'Test');
    expect(err).to.be.an.instanceOf(Error);
    expect(err).to.be.an.instanceOf(MySpecialError);
    expect(err.constructor).to.equal(MySpecialError);
    expect(err.stack).to.be.a('string');
    expect(err.message).to.equal('Super special error!');
    expect(err.arg1).to.equal(123);
    expect(err.arg2).to.equal('Test');
  });
});
