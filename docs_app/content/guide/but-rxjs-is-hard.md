# ???. But RxJS Is Hard

We understand. Believe me. But maybe you're not seeing the real value of what RxJS offers, which is the [`Observable`](API) type itself. There are many [benefits to using observables](1000-why-observables.md), and you don't have to use [operators](glossary-and-semantics#operator) at all to get those benefits.

## Solution 1: Just Use Observables Imperatively

There are "RxJS purists" in the world, I suppose. Those folks would tell you that you "should learn the operators". Maybe they're right, it's always beneficial to learn new things. But you don't have to know operators to enjoy the [benefits of observable](1000-why-observables.md).

Consider a simple component that will send an HTTP request when you click a button and display the results in a list. You _could_ use [`switchMap`](API) and [`map`](API) and [`takeUntil`](API) and a bunch of other operators to get this done... _OR_ you could just subscribe to the observable and manage the subscription yourself.

In the simplest case it could look like this:

**React (pseudo-code)**

```ts
export function SomeComponent() {
  const subscriptionRef = useRef(null);

  const clickHandler = () => {
    subscriptionRef.current?.unsubscribe();
    subscriptionRef.current = ajax.getJSON(url).subscribe((data) => {
      setData(data);
    });
  };

  useEffect(() => {
    return () => {
      subscriptionRef.current?.unsubscribe();
    };
  }, []);

  return (
    <>
      <button onClick={clickHandler}>Load</button>
      {data.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </>
  );
}
```

**Angular (pseudo-code)**

NOTE: In angular you may want to use the [async pipe](LINK_HERE).

```ts
@Component({
    template: `
        <button (click)="onClick()">Load</button>
        <ul><li *ngFor="let item of data">{{item}}<li></ul>
    `
})
const SomeComponent {
    data: string[] = null;

    constructor(private http: HttpClient) {
    }

    onClick() {
        this.subscription?.unsubscribe();
        this.subscription = this.http.get(url).subscribe(data => this.updateList(data));
    }

    updateList(data) {
        this.data = data;
    }

    ngOnDestroy() {
        this.subscription?.unsubscribe();
    }
}
```

**Plain DOM Manipulation**

Presented for those who don't quite follow the Angular or React examples above.

```ts
let subscription = null;

const list = document.createElement('ul');

const button = document.createElement('button');
button.textContent = 'Load';
button.onclick = () => {
  subscription?.unsubscribe();
  subscription = ajax.getJSON(url).subscribe((data) => {
    list.innerHTML = data.map((value) => `<li>${value}</li>`).join('');
  });
};

document.body.appendChild(button);
document.body.appendChild(list);
```

## Solution 2: Experiment And Learn Gradually

In some cases, you've inherited a codebase that is full of RxJS, and you're doomed into needing to maintain it, and you don't quite understand the operators. Maybe our documentation isn't really resonating with you, or maybe you're still uncertain of exactly what a specific operator does.

If this is the case, I'd recommend using an online playground/sandbox app like [Stackblitz](https://stackblitz.com), or [Codesandbox](https://codesandbox.io), et al, and importing `rxjs` and just playing with it.

### Recommendations for playing with operators:

1. Log results to `console` with [`console.log`](MDN).
2. Try it with an [`interval`](API) observable. Intervals are great for quickly creating streaming, asynchronous values with enough of a delay between them so you can see what's happening.
3. Use a [`timer`](API) and a [`map`](API) to simulate fetching data one time (like with HTTP). That looks like this: `timer(1000).pipe(map(() => ({ some: 'data' })))`. This is a quick and easy way to mimic a common behavior.
4. Are you dealing with synchronous observables? Sometimes they behave differently. Try the operators you're experimenting with with observables created with [`of`](API) or [`range`](API).
5. Put a [`tap`](API) in there somewhere. `tap` is used to execute [side effects](glossary-and-semantics#side-effect) and will not effect the values you're [streaming](glossary-and-semantics#stream). If you're not sure what part of your [chain](glossary-and-semantics#chaining) is getting, put a `tap(console.log)` in there, and see what it prints out.
6. Reconcile your findings with the documentation. Double check that it's doing what you think it's doing after your experimentation.
7. Try throwing errors in different parts of your code. What happens?

---

<a rel="license" href="http://creativecommons.org/licenses/by/4.0/"><img alt="Creative Commons License" style="border-width:0" src="https://licensebuttons.net/l/by/4.0/80x15.png" /></a>
This work is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by/4.0/">Creative Commons Attribution 4.0 International License</a>
