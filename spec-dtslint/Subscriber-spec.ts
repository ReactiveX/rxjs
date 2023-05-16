import { Subscriber } from "rxjs";

describe("Subscriber", () => {
  it('should have deprecated and internal constructors', () => {
    const s1 = new Subscriber(); // $ExpectDeprecation
    const s2 = new Subscriber(() => {}); // $ExpectDeprecation
    const s3 = new Subscriber({}); // $ExpectDeprecation
    const s4 = new Subscriber({ next: () => {}}); // $ExpectDeprecation
    const s5 = new Subscriber({ }, { next: () => {} }); // $ExpectError
  });
});