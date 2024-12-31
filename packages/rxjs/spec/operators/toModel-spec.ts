import { Observable, of } from 'rxjs';
import { toModel } from 'rxjs/operators';

// Mock class to be used for the test
class Person {
  firstName: string;
  constructor(data: Person) {
    this.firstName = data.firstName ?? 'Unknown';
  }
}

describe('toModel operator', () => {
  it('should map emitted values to instances of the specified model class', (done) => {
    // Create an observable that emits raw data
    const source$ = of({ firstName: 'Alice' }, { firstName: 'Bob' }) as any;

    // Apply the toModel operator to transform the emitted data to instances of Person
    const result$ = source$.pipe(toModel(Person));

    // Subscribe and test that the emitted values are instances of Person
    const expectedValues = [
      new Person({ firstName: 'Alice' }),
      new Person({ firstName: 'Bob' }),
    ];

    let index = 0;

    result$.subscribe({
      next: (value: any) => {
        // Check that each emitted value is an instance of Person
        expect(value).toBeInstanceOf(Person);
        // Check that the value inside the model matches the expected data
        expect(value).toEqual(expectedValues[index]);
        index++;
      },
      error: (err: string | Error | undefined) => {
        done.fail(err); // Fail the test if any error is thrown
      },
      complete: () => {
        console.log(index)
        expect(index).toBe(2); // Ensure two values were emitted
        done(); // Test is complete
      },
    });
  });

  it('should propagate errors from the source observable', (done) => {
    // Create an observable that emits an error
    const source$ = new Observable<any>((subscriber) => {
      subscriber.error('Test Error');
    });

    // Apply the toModel operator
    const result$ = source$.pipe(toModel(Person));

    // Subscribe and verify the error is propagated
    result$.subscribe({
      next: () => {
        done.fail('Expected an error, but got a value');
      },
      error: (err) => {
        expect(err).toBe('Test Error'); // Ensure the correct error is received
        done(); // Test is complete
      },
      complete: () => {
        done.fail('Expected an error, but got a complete signal');
      },
    });
  });

  it('should complete when the source observable completes', (done) => {
    // Create an observable that completes without errors
    const source$ = of();

    // Apply the toModel operator
    const result$ = source$.pipe(toModel(Person));

    // Subscribe and verify completion
    result$.subscribe({
      next: () => {
        done.fail('Expected no values, but got one');
      },
      error: () => {
        done.fail('Expected no errors');
      },
      complete: () => {
        done(); // Test is complete
      },
    });
  });
});
