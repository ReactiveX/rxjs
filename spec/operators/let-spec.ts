import { expect } from 'chai';
import * as Rx from '../../dist/cjs/Rx';

declare const { type };

/** @test {let} */
describe('Observable.prototype.let', () => {
  it('should be able to compose with let', (done: MochaDone) => {
    const expected = ['aa', 'bb'];
    let i = 0;

    const foo = (observable: Rx.Observable<string>) => observable.map((x) => x + x);

    Rx.Observable
      .from(['a', 'b'])
      .let(foo)
      .subscribe(function (x) {
        expect(x).to.equal(expected[i++]);
      }, (x) => {
        done(new Error('should not be called'));
      }, () => {
        done();
      });
  });

  it('should flow types through with 0 arguments', () => {
    const o1: Rx.Observable<number> = Rx.Observable
      .of(1, 2, 3);
    const o2 = o1
      .let();
    expect(o2).to.equal(o1);
  });

  it('should flow types through with 1 argument', () => {
    // tslint:disable-next-line:no-unused-variable
    const o: Rx.Observable<{ a: string }> = Rx.Observable
      .of(1, 2, 3)
      .let(x => x.map(z => ({ a: x.toString() })));
  });

  it('should flow types through with 2 arguments', () => {
    // tslint:disable-next-line:no-unused-variable
    const o: Rx.Observable<{ a: string }> = Rx.Observable
      .of(1, 2, 3)
      .let(
        x => x.map(z => ({ z })),
        x => x.map(z => ({ a: z.z.toString() })),
      );
  });

  it('should flow types through with 3 arguments', () => {
    // tslint:disable-next-line:no-unused-variable
    const o: Rx.Observable<{ a: number }> = Rx.Observable
      .of(1, 2, 3)
      .let(
        x => x.map(z => ({ z })),
        x => x.map(z => ({ a: z.z })),
        x => x.map(z => ({ a: z.a })),
      );
  });

  it('should flow types through with 4 arguments', () => {
    // tslint:disable-next-line:no-unused-variable
    const o: Rx.Observable<{ a: number }> = Rx.Observable
      .of(1, 2, 3)
      .let(
        x => x.map(z => ({ x: z })),
        x => x.map(z => ({ z: z.x })),
        x => x.map(z => ({ a: z.z })),
        x => x.map(z => ({ a: z.a })),
      );
  });

  it('should flow types through with 5 arguments', () => {
    // tslint:disable-next-line:no-unused-variable
    const o: Rx.Observable<{ a: string }> = Rx.Observable
      .of(1, 2, 3)
      .let(
        x => x.map(z => ({ v: z.toString() })),
        x => x.map(z => ({ x: z.v })),
        x => x.map(z => ({ z: z.x })),
        x => x.map(z => ({ a: z.z })),
        x => x.map(z => ({ a: z.a })),
      );
  });

  it('should flow types through with 6 arguments', () => {
    // tslint:disable-next-line:no-unused-variable
    const o: Rx.Observable<{ a: string }> = Rx.Observable
      .of(1, 2, 3)
      .let(
        x => x.map(z => ({ f: z.toString() })),
        x => x.map(z => ({ v: z.f })),
        x => x.map(z => ({ x: z.v })),
        x => x.map(z => ({ z: z.x })),
        x => x.map(z => ({ a: z.z })),
        x => x.map(z => ({ a: z.a })),
      );
  });

  it('should flow types through with 7 arguments', () => {
    // tslint:disable-next-line:no-unused-variable
    const o: Rx.Observable<{ a: number }> = Rx.Observable
      .of(1, 2, 3)
      .let(
        x => x.map(z => ({ f: z })),
        x => x.map(z => ({ c: z.f })),
        x => x.map(z => ({ v: z.c })),
        x => x.map(z => ({ x: z.v })),
        x => x.map(z => ({ z: z.x })),
        x => x.map(z => ({ a: z.z })),
        x => x.map(z => ({ a: z.a })),
      );
  });

  it('should flow types through with 8 arguments', () => {
    // tslint:disable-next-line:no-unused-variable
    const o: Rx.Observable<{ a: string }> = Rx.Observable
      .of(1, 2, 3)
      .let(
        x => x.map(z => ({ f: z.toString() })),
        x => x.map(z => ({ d: z.f })),
        x => x.map(z => ({ c: z.d })),
        x => x.map(z => ({ v: z.c })),
        x => x.map(z => ({ x: z.v })),
        x => x.map(z => ({ z: z.x })),
        x => x.map(z => ({ a: z.z })),
        x => x.map(z => ({ a: z.a })),
      );
  });

  it('should flow types through with 9 arguments', () => {
    // tslint:disable-next-line:no-unused-variable
    const o: Rx.Observable<{ a: number }> = Rx.Observable
      .of(1, 2, 3)
      .let(
        x => x.map(z => ({ f: z })),
        x => x.map(z => ({ e: z.f })),
        x => x.map(z => ({ d: z.e })),
        x => x.map(z => ({ c: z.d })),
        x => x.map(z => ({ v: z.c })),
        x => x.map(z => ({ x: z.v })),
        x => x.map(z => ({ z: z.x })),
        x => x.map(z => ({ a: z.z })),
        x => x.map(z => ({ a: z.a })),
      );
  });

  it('should flow types through with 10 arguments', () => {
    // tslint:disable-next-line:no-unused-variable
    const o: Rx.Observable<{ a: string }> = Rx.Observable
      .of(1, 2, 3)
      .let(
        x => x.map(z => ({ f: z.toString() })),
        x => x.map(z => ({ b: z.f })),
        x => x.map(z => ({ e: z.b })),
        x => x.map(z => ({ d: z.e })),
        x => x.map(z => ({ c: z.d })),
        x => x.map(z => ({ v: z.c })),
        x => x.map(z => ({ x: z.v })),
        x => x.map(z => ({ z: z.x })),
        x => x.map(z => ({ a: z.z })),
        x => x.map(z => ({ a: z.a })),
      );
  });
});
