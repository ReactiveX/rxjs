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

  it('should ignore next messages after unsubscription', () => {
    let times = 0;

    const sub = new Subscriber({
      next() { times += 1; }
    });

    sub.next();
    sub.next();
    sub.unsubscribe();
    sub.next();

    expect(times).toBe(2);
  });

  it('should ignore error messages after unsubscription', () => {
    let times = 0;
    let errorCalled = false;

    const sub = new Subscriber({
      next() { times += 1; },
      error() { errorCalled = true; }
    });

    sub.next();
    sub.next();
    sub.unsubscribe();
    sub.next();
    sub.error();

    expect(times).toBe(2);
    expect(errorCalled).toBe(false);
  });

  it('should ignore complete messages after unsubscription', () => {
    let times = 0;
    let completeCalled = false;

    const sub = new Subscriber({
      next() { times += 1; },
      complete() { completeCalled = true; }
    });

    sub.next();
    sub.next();
    sub.unsubscribe();
    sub.next();
    sub.complete();

    expect(times).toBe(2);
    expect(completeCalled).toBe(false);
  });
});
