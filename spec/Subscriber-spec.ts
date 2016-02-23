import * as Rx from '../dist/cjs/Rx';
const Subscriber = Rx.Subscriber;

/** @test {Subscriber} */
describe('Subscriber', () => {
  it('should have the rxSubscriber symbol', () => {
    const sub = new Subscriber();
    expect(sub[Rx.Symbol.rxSubscriber]()).toBe(sub);
  });

  describe('when created through create()', () => {
    it('should not call error() if next() handler throws an error', () => {
      const errorSpy = jasmine.createSpy('error');
      const completeSpy = jasmine.createSpy('complete');

      const subscriber = Subscriber.create(
        (value: any) => {
          if (value === 2) {
            throw 'error!';
          }
        },
        errorSpy,
        completeSpy
      );

      subscriber.next(1);
      expect(() => {
        subscriber.next(2);
      }).toThrow('error!');

      expect(errorSpy).not.toHaveBeenCalled();
      expect(completeSpy).not.toHaveBeenCalled();
    });
  });
});
