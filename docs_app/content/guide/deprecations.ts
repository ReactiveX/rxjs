
/*
**Code MSG:**
@TODO => parse able message in code =>  @deprecated [breakingChange-in v8]: <>
Pattern: <GenericDeprecationError> <HumanReadableShortMessage> - see <LinkToDeprecationPage>
- GenericDeprecationError:
- HumanReadableShortMessage: headline of deprecation object
- LinkToDeprecationPage: Follows pattern of LinkName

Consider:
- how to structure rollback of a deprecation?
https://github.com/ReactiveX/rxjs/issues/5107
 */

// @TODO check all linkName
// @TODO check all version specifier => After Deprecation (>= 6.0.0-rc.0)


interface Deprecation {
  // Link to line of code in GitHub in version it got introduced
  sourceLink: string;
  /*
  # LinkName
  Pattern: deprecation-<type>-<type-name>-<action-name>
  - type: class, interface, operator, static, constant, enum
  - type-name: TestScheduler, of, NEVER, switchMap
  - action-name: to-constant, to string-literal, internal
  Examples:
  - deprecation-class-TestScheduler-index-to-private
  - deprecation-operator-switchMap-resultSelector-to-map-operator
 */
  linkName: string;
  type: 'deprecation';
  // semver n.n.n-s.n,
  breakingVersion: string;
  /*
  see Deprecation.linkName
  */
  breakingLink: string;
  headline: string;
  reason: string;
  implication: string;
  /*
  # exampleBefore
  Pattern:
  <imports>
  <code>
  Example:
  import {empty} from 'rxjs';
  empty();
  */
  exampleBefore: string;
  /*
  # exampleAfter
  Pattern:
  <imports>
  <code>
  Example:
  import {EMPTY} from 'rxjs';
  EMPTY;
  */
  exampleAfter: string;
}

interface BreakingChange {
  /*
 # LinkName
 Pattern: breakingChange-<type>-<type-name>-<action-name>
 - type: class, interface, operator, static, constant, enum
 - type-name: TestScheduler, of, NEVER, switchMap
 - action-name: to-constant, to string-literal, internal
 Examples:
 - breakingChange-operator-last-resultSelector-removed
 - breakingChange-enum-NotificationKind-removed
*/
  linkName: string;
  type: 'breakingChange';
  // semver n.n.n.s-n,
  deprecationVersion: string;
  /*
  see Deprecation.linkName
  */
  deprecationLink: string;
  headline: string;
}

interface Release {
  // semver n.n.n.s-n,
  version: string,
  // YYYY-MM-DD
  date: string;
  deprecations?: Deprecation[];
  breakingChanges?: BreakingChange[];
}

const deprecationAndBreakingChangeTimeline: Release[] = [
  {
    version: '6.0.0-beta.4',
    date: '2018-03-29',
    deprecations: [
      {
        linkName: 'deprecation-static-method-never-to-constant',
        type: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-beta.4/src/internal/observable/never.ts#L30',
        breakingVersion: '7.x.x',
        breakingLink: 'breakingChange-static-method-never-removed',
        headline: 'Static method `never` deprecated in favour of constant `NEVER`',
        reason: 'Deprecated because it is more efficient?',
        implication: 'Replacing `never` with `NEVER`',
        exampleBefore: `
          \`\`\`typescript
          import { never } from 'rxjs';
          never();
          \`\`\`
        `,
        exampleAfter: `
          \`\`\`typescript
          import { NEVER } from 'rxjs';
          NEVER;
          \`\`\`
        `
      },
      {
        linkName: 'deprecation-static-method-empty-to-constant',
        type: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-beta.4/src/internal/observable/empty.ts#L52',
        breakingVersion: '7.x.x',
        breakingLink: 'breakingChange-static-method-empty-removed',
        headline: 'Static method `empty` deprecated in favor of constant EMPTY',
        reason: 'Deprecated because it is more efficient? Some more text here... Some more text here... Some more text here...',
        implication: 'Replacing `empty` with `EMPTY`',
        exampleBefore: `
          import { empty } from 'rxjs';
          empty();
        `,
        exampleAfter: `
          import {EMPTY} from 'rxjs';
          EMPTY;
        `
      },
      {
        linkName: 'deprecation-class-WebSocketSubject-deserializer-to-resultSelector',
        type: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-beta.4/src/internal/observable/dom/WebSocketSubject.ts#L16',
        breakingVersion: '7.x.x',
        breakingLink: 'breakingChange-class-WebSocketSubject-deserializer-removed',
        headline: 'WebSocketSubject use `deserializer` in favour or `resultSelector`',
        reason: '@TODO',
        implication: '@TODO',
        exampleBefore: `
          import { WebSocketSubject } from 'rxjs/WebSocketSubject';

          const wsSubject = WebSocketSubject.create({
              url: 'ws://localhost:8081',
              resultSelector: ({data}) => data
          });

          wsSubject.subscribe(console.log);
        `,
        exampleAfter: `
        import { webSocket } from 'rxjs/webSocket';

        const wsSubject = webSocket({
          url: 'ws://localhost:8081',
          deserializer: ({data}) => data
        });

        wsSubject.subscribe(console.log);
        `
      }
    ]
  },
  {
    version: '6.0.0-alpha.3',
    date: '2018-02-09',
    deprecations: [
      {
        linkName: 'deprecation-operator-last-resultSelector',
        type: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-alpha.3/src/internal/operators/last.ts#L12',
        breakingVersion: '6.0.0-alpha.4',
        breakingLink: 'breakingChange-operator-last-resultSelector',
        headline: 'Operator `last` method deprecated the `resultSelector` argument',
        reason: `By removing the result selector from \`last\` we get a smaller bundle since of the operator.
        Further the resultSelector was not that often used and the
        refactoring to use and internal \`map\` operation instead is a minor code change.`,
        implication: '@TODO',
        exampleBefore: `
        import { last } from 'rxjs/operators';
        a$
        .pipe(
          last(1, (n, i) => n))
        )
          .subscribe({next: n => console.log(n)})
        `,
        exampleAfter: `
        import { last, map } from 'rxjs/operators';
        a$
        .pipe(
          last(1),
          map((n, i) => n))
        )
          .subscribe({next: n => console.log(n)});
        `
      }
    ],
  },
  {
    version: '6.0.0-alpha.4',
    date: '2018-03-13',
    breakingChanges: [
      {
        linkName: 'breakingChange-operator-last-resultSelector-remove',
        type: 'breakingChange',
        deprecationVersion: '6.0.0-alpha.3',
        deprecationLink: 'deprecation-operator-last-resultSelector',
        headline: 'Operator `last` method removed the `resultSelector` argument'
      }
    ]
  },
  {
    version: '6.0.0-rc.0',
    date: '2018-03-31',
    deprecations: [
      {
        linkName: 'deprecation-operator-combineLatest-to-static',
        type: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-rc.0/src/internal/operators/combineLatest.ts#L42',
        breakingVersion: '7.x.x',
        breakingLink: 'breakingChange-operator-combineLatest-removed',
        headline: 'Static `combineLatest` deprecated in favor of static function {@link combineLatest}',
        reason: `As \`combineLatest\` operator is a name duplicate of static the
         operators to \`combineLatest\`. @TODO wait for ben\`s or nicolas\`s answer`,
        implication: '@TODO',
        exampleBefore: `
        import { combineLatest } from 'rxjs/operators';
        a$.pipe(
            combineLatest(b$)
          )
          .subscribe({next: n => console.log(n)});
        `,
        exampleAfter: `
        import { combineLatest } from 'rxjs/operators';
        combineLatest(a$, b$)
          .subscribe({next: n => console.log(n)})
        `
      },
      {
        linkName: 'deprecation-operator-merge-to-static',
        type: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-rc.0/src/internal/operators/merge.ts#L37',
        breakingVersion: '7.x.x',
        breakingLink: 'breakingChange-operator-merge-removed',
        headline: 'Static `merge` deprecated in favor of static function {@link merge}',
        reason: 'As `merge` operator is a name duplicate of static the operators to `merge`. @TODO wait for ben`s or nicolas`s answer',
        implication: '@TODO',
        exampleBefore: `
        import { merge } from 'rxjs/operators';
        a$
          .pipe(
            merge(b$)
          )
          .subscribe({next: n => console.log(n)});
        `,
        exampleAfter: `
        import { merge } from 'rxjs/operators';
        merge(a$, b$)
          .subscribe({next: n => console.log(n)});
        `
      },
      {
        linkName: 'deprecation-operator-zip-to-static',
        type: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-rc.0/src/internal/operators/zip.ts#L37',
        breakingVersion: '7.x.x',
        breakingLink: 'breakingChange-operator-zip-removed',
        headline: 'Static `zip` deprecated in favor of static function {@link zip}',
        reason: 'As `zip` operator is a name duplicate of static the operators to `zip`. @TODO wait for ben`s or nicolas`s answer',
        implication: '@TODO',
        exampleBefore: `
        import { zip } from 'rxjs/operators';
        a$
          .pipe(
            zip(b$)
          )
          .subscribe({next: n => console.log(n)})
        `,
        exampleAfter: `
        import { zip } from 'rxjs/operators';
        zip(a$, b$)
          .subscribe({next: n => console.log(n)});
        `
      },
      {
        linkName: 'deprecation-operator-concat-to-static',
        type: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-rc.0/src/internal/operators/concat.ts#L25',
        breakingVersion: '7.x.x',
        breakingLink: 'breakingChange-operator-concat-removed',
        headline: 'Static `concat` deprecated in favor of static function {@link concat}',
        reason: 'As `concat` operator is a name duplicate of static the operators to `concat`. @TODO wait for ben`s or nicolas`s answer',
        implication: '@TODO',
        exampleBefore: `
        import { concat } from 'rxjs/operators';
        a$
          .pipe(
            concat(b$, )
          )
          .subscribe({next: n => console.log(n)});
        `,
        exampleAfter: `
        import { concat } from 'rxjs/operators';
        concat(a$, b$)
          .subscribe({next: n => console.log(n)});
        `
      },
      {
        linkName: 'deprecation-static-zip-resultSelector',
        type: 'deprecation',
        sourceLink: `https://github.com/ReactiveX/rxjs/blob/6.0.0-rc.0/src/internal/observable/zip.ts#L37`,
        breakingVersion: '7.x.x',
        breakingLink: 'breakingChange-static-zip-resultSelector-removed',
        headline: 'Static `zip` method deprecated the `resultSelector` argument',
        reason: getGeneralResultSelectorPhrase('zip'),
        implication: '@TODO',
        exampleBefore: `
        import { zip } from 'rxjs';
        zip(a$,b$, resultSelector)
          .subscribe({next: n => console.log(n)})
        `,
        exampleAfter: `
        import { zip, map } from 'rxjs';
        zip(a$,b$)
        .pipe(
          map(n => resultSelector(...n))
        )
          .subscribe({next: n => console.log(n)});
        `
      },
      {
        linkName: 'deprecation-static-fromEventPattern-resultSelector',
        type: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-rc.0/src/internal/observable/fromEventPattern.ts#L9',
        breakingVersion: '7.x.x',
        breakingLink: 'breakingChange-static-fromEventPattern-resultSelector-removed',
        headline: 'Static `fromEventPattern` method deprecated the `resultSelector` argument',
        reason: getGeneralResultSelectorPhrase('fromEventPattern'),
        implication: '@TODO',
        exampleBefore: `
        import { fromEventPattern } from 'rxjs';
        fromEventPattern(addHandler, removeHandler, resultSelector)
          .subscribe({next: n => console.log(n)});
        `,
        exampleAfter: `
        import { fromEventPattern } from 'rxjs';
        import { map } from 'rxjs/operators';
        fromEventPattern(addHandler, removeHandler)
        .pipe(
            map((event) => resultSelector(event))
        )
          .subscribe({next: n => console.log(n)});
        `
      },
      {
        linkName: 'deprecation-static-bindNodeCallback-resultSelector',
        type: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-rc.0/src/internal/observable/bindNodeCallback.ts#L10',
        breakingVersion: '7.x.x',
        breakingLink: 'breakingChange-static-bindNodeCallback-resultSelector-removed',
        headline: 'Static `bindNodeCallback` method deprecated the `resultSelector` argument',
        reason: getGeneralResultSelectorPhrase('bindNodeCallback'),
        implication: '@TODO',
        exampleBefore: `
        import { bindNodeCallback } from 'rxjs';
        bindNodeCallback(callBackFunc, resultSelector)
          .subscribe({next: n => console.log(n)});
        `,
        exampleAfter: `
                import { bindNodeCallback } from 'rxjs';
        import { map } from 'rxjs/operators';
        bindNodeCallback(callBackFunc, removeHandler)
        .pipe(
            map((event) => resultSelector(event))
        )
          .subscribe({next: n => console.log(n)});
        `
      },
      {
        linkName: 'deprecation-static-bindCallback-resultSelector',
        type: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-rc.0/src/internal/observable/bindCallback.ts#L10',
        breakingVersion: '7.x.x',
        breakingLink: 'breakingChange-static-bindCallback-resultSelector-removed',
        headline: 'Static `bindCallback` method deprecated the `resultSelector` argument',
        reason: getGeneralResultSelectorPhrase('bindCallback'),
        implication: '@TODO',
        exampleBefore: `
        import { bindCallback } from 'rxjs';
        bindCallback(callBackFunc, resultSelector)
          .subscribe({next: n => console.log(n)});
        `,
        exampleAfter: `
        import { bindCallback } from 'rxjs';
        import { map } from 'rxjs/operators';
        bindCallback(callBackFunc, removeHandler)
        .pipe(
            map((event) => resultSelector(event))
        )
          .subscribe({next: n => console.log(n)});
        `
      },
      {
        linkName: 'deprecation-static-forkJoin-resultSelector',
        type: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-rc.0/src/internal/observable/forkJoin.ts#L29',
        breakingVersion: '7.x.x',
        breakingLink: 'breakingChange-static-forkJoin-resultSelector-removed',
        headline: 'Static `forkJoin` method deprecated the `resultSelector` argument',
        reason: getGeneralResultSelectorPhrase('forkJoin'),
        implication: '@TODO',
        exampleBefore: `
        import { forkJoin } from 'rxjs';
        forkJoin(a$, b$, resultSelector)
          .subscribe({next: n => console.log(n)});
        // or
        forkJoin([a$, b$], resultSelector)
          .subscribe({next: n => console.log(n)})
        `,
        exampleAfter: `
        import { forkJoin } from 'rxjs';
        import { map } from 'rxjs/operators';
        forkJoin(a$, b$, removeHandler)
        .pipe(
            map((n) => resultSelector(...n))
        )
          .subscribe({next: n => console.log(n)});
        // or
        forkJoin([a$, b$], removeHandler)
        .pipe(
            map((n) => resultSelector(...n))
        )
          .subscribe({next: n => console.log(n)});
        `
      },
      {
        linkName: 'deprecation-static-fromEvent-resultSelector',
        type: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-rc.0/src/internal/observable/fromEvent.ts#L32',
        breakingVersion: '7.x.x',
        breakingLink: 'breakingChange-static-fromEvent-resultSelector-removed',
        headline: 'Static `fromEvent` method deprecated the `resultSelector` argument',
        reason: getGeneralResultSelectorPhrase('fromEvent'),
        implication: '@TODO',
        exampleBefore: `
        import { fromEvent } from 'rxjs';
        fromEvent(element, eventName, resultSelector)
          .subscribe({next: n => console.log(n)})
        `,
        exampleAfter: `
        import { fromEvent } from 'rxjs';
        import { map } from 'rxjs/operators';
        fromEvent(element, eventName)
        .pipe(
            map((event) => resultSelector(event))
        )
          .subscribe({next: n => console.log(n)})
        `
      },
      {
        linkName: 'deprecation-operator-switchMap-resultSelector',
        type: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-rc.0/src/internal/operators/switchMap.ts#L16',
        breakingVersion: '7.x.x',
        breakingLink: 'breakingChange-operator-switchMap-resultSelector-removed',
        headline: 'Operator `switchMap` method deprecated the `resultSelector` argument',
        reason: getGeneralResultSelectorPhrase('switchMap'),
        implication: '@TODO',
        exampleBefore: `
        import { switchMap } from 'rxjs/operators';
        a$
        .pipe(
          switchMap(projectionFn, resultSelector)
        )
          .subscribe({next: n => console.log(n)})
        `,
        exampleAfter: `
        import { switchMap, map } from 'rxjs/operators';
        a$
        .pipe(
          switchMap((a, i) => b$.pipe(
            map((b, ii) => resultSelector(a, b, i, ii))
          ))
        )
          .subscribe({next: n => console.log(n)});
        `
      },
      {
        linkName: 'deprecation-operator-switchMapTo-resultSelector',
        type: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-rc.0/src/internal/operators/switchMapTo.ts#L15',
        breakingVersion: '7.x.x',
        breakingLink: 'breakingChange-operator-switchMapTo-resultSelector-removed',
        headline: 'Operator `switchMapTo` method deprecated the `resultSelector` argument',
        reason: getGeneralResultSelectorPhrase('switchMap'),
        implication: '@TODO',
        exampleBefore: `
        import { switchMapTo } from 'rxjs/operators';
        a$
        .pipe(
          switchMapTo(b$, resultSelector)
        )
          .subscribe({next: n => console.log(n)})
        `,
        exampleAfter: `
        import { switchMapTo, map } from 'rxjs/operators';
        a$
        .pipe(
          switchMap((a, i) => b$.pipe(
            map((b, ii) => resultSelector(a, b, i, ii))
          ))
        )
          .subscribe({next: n => console.log(n)});
        `
      },
      {
        linkName: 'deprecation-operator-concatMap-resultSelector',
        type: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-rc.0/src/internal/operators/concatMap.ts#L8',
        breakingVersion: '7.x.x',
        breakingLink: 'breakingChange-operator-concatMap-resultSelector-removed',
        headline: 'Operator `concatMap` method deprecated the `resultSelector` argument',
        reason: getGeneralResultSelectorPhrase('concatMap'),
        implication: '@TODO',
        exampleBefore: `
        import { concatMap } from 'rxjs/operators';
        a$
        .pipe(
          concatMap(projectionFn, resultSelector)
        )
          .subscribe({next: n => console.log(n)});
        `,
        exampleAfter: `
        import { concatMap, map } from 'rxjs/operators';
        a$
        .pipe(
          concatMap((a, i) => b$.pipe(
            map((b, ii) => resultSelector(a, b, i, ii))
          ))
        )
          .subscribe({next: n => console.log(n)});
        `
      },
      {
        linkName: 'deprecation-operator-concatMapTo-resultSelector',
        type: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-rc.0/src/internal/operators/concatMapTo.ts#L8',
        breakingVersion: '7.x.x',
        breakingLink: 'breakingChange-operator-concatMapTo-resultSelector-removed',
        headline: 'Operator `concatMapTo` method deprecated the `resultSelector` argument',
        reason: getGeneralResultSelectorPhrase('concatMapTo'),
        implication: '@TODO',
        exampleBefore: `
        import { concatMapTo } from 'rxjs/operators';
        a$
        .pipe(
          concatMapTo(b$, (n, i) =>  v)
        )
          .subscribe({next: n => console.log(n)});
        `,
        exampleAfter: `
        import { concatMapTo, map } from 'rxjs/operators';
        a$
        .pipe(
          concatMapTo(b$.pipe(
            map((n, i) =>  v)
          ))
        )
          .subscribe({next: n => console.log(n)});
        `
      },
      {
        linkName: 'deprecation-operator-mergeMap-resultSelector',
        type: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-rc.0/src/internal/operators/mergeMap.ts#L16',
        breakingVersion: '7.x.x',
        breakingLink: 'breakingChange-operator-mergeMap-resultSelector-removed',
        headline: 'Operator `mergeMap` method deprecated the `resultSelector` argument',
        reason: getGeneralResultSelectorPhrase('mergeMap'),
        implication: '@TODO',
        exampleBefore: `
        import { mergeMap } from 'rxjs/operators';
        a$
        .pipe(
          mergeMap(projectionFn, resultSelector)
        )
          .subscribe({next: n => console.log(n)})
        `,
        exampleAfter: `
                import { mergeMap, map } from 'rxjs/operators';
        a$
        .pipe(
          mergeMap((a, i) => b$.pipe(
            map((b, ii) => resultSelector(a, b, i, ii))
          ))
        )
          .subscribe({next: n => console.log(n)});
      `
      },
      {
        linkName: 'deprecation-operator-mergeMapTo-resultSelector',
        type: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-rc.0/src/internal/operators/mergeMapTo.ts#L8',
        breakingVersion: '7.x.x',
        breakingLink: 'breakingChange-operator-mergeMapTo-resultSelector-removed',
        headline: `Operator \`mergeMapTo\` method deprecated the \`resultSelector\` argument`,
        reason: getGeneralResultSelectorPhrase('mergeMapTo'),
        implication: '@TODO',
        exampleBefore: `
        import { mergeMapTo } from 'rxjs/operators';
        a$
        .pipe(
          mergeMapTo(b$, (n, i) => n))
        )
          .subscribe({next: n => console.log(n)});
        `,
        exampleAfter: `
        import { mergeMapTo, map } from 'rxjs/operators';
        a$
        .pipe(
          mergeMapTo(b$.pipe(
            map((n, i) => n)
          ))
        )
          .subscribe({next: n => console.log(n)});
        `
      },
      {
        linkName: 'deprecation-operator-exhaustMap-resultSelector',
        type: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-rc.0/src/internal/operators/exhaustMap.ts#L16',
        breakingVersion: '7.x.x',
        breakingLink: 'breakingChange-operator-exhaustMap-resultSelector-removed',
        headline: 'Operator `exhaustMap` method deprecated the `resultSelector` argument',
        reason: getGeneralResultSelectorPhrase('exhaustMap'),
        implication: '@TODO',
        exampleBefore: `
        import { exhaustMap } from 'rxjs/operators';
        a$
        .pipe(
          exhaustMap(projectionFn, resultSelector)
        )
          .subscribe({next: n => console.log(n)})
        `,
        exampleAfter: `
        import { exhaustMap, map } from 'rxjs/operators';
        a$
        .pipe(
          exhaustMap((a, i) => b$.pipe(
            map((b, ii) => resultSelector(a, b, i, ii))
          ))
        )
          .subscribe({next: n => console.log(n)});
        `
      }
    ]
  },
  {
    version: '6.0.0-tactical-rc.1',
    date: '2018-04-07',
    deprecations: [
      {
        linkName: 'deprecation-class-Scheduler',
        type: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-tactical-rc.1/src/internal/Scheduler.ts#L20',
        breakingVersion: '7.x.x',
        breakingLink: 'breakingChange-class-Scheduler-removed',
        headline: 'Class `Scheduler` deprecated in favor of Interface {@link SchedulerLike}',
        reason: 'As `Scheduler` is an internal implementation detail of RxJS, and ' +
          'should not be used directly. Create your own class instead and implement the Interface {@link SchedulerLike}',
        implication: '@TODO',
        exampleBefore: `
        import { Scheduler } from 'rxjs';
        // @TODO
        `,
        exampleAfter: `
        import { SchedulerLike } from 'rxjs';
        // @TODO
        `
      }
    ]
  },
  {
    version: '6.0.0-rc.1',
    date: '2018-04-07',
    deprecations: [
      {
        linkName: 'deprecation-class-Observable-if-to-static',
        type: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-rc.1/src/internal/Observable.ts#L260',
        breakingVersion: '7.x.x',
        breakingLink: 'breakingChange-class-Observable-if-removed',
        headline: 'Observable static method `if` moved to static operator function {@link iif}',
        reason: 'As `if` was a prototype method there was no conflict. ' +
          'After moving to "pipeable" operators `if` now conflicts with reserved names of te language.' +
          'Therefore it is renamed to `iif` and exposed as static function',
        implication: '@TODO',
        exampleBefore: `
        import { Observable } from 'rxjs'
        Observable.if(conditionFunc, a$, b$)
          .subscribe({next: n => console.log(n)});
        `,
        exampleAfter: `
        import { iif } from 'rxjs'
        iif(conditionFunc, a$, b$)
          .subscribe({next: n => console.log(n)});
        `
      },
      {
        linkName: 'deprecation-class-Observable-throw-to-static',
        type: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-rc.1/src/internal/Observable.ts#L265',
        breakingVersion: '7.x.x',
        breakingLink: 'breakingChange-class-Observable-throw-removed',
        headline: 'Observable static method `throw` moved to static operator function {@link iif}',
        reason: 'As `if` was a prototype method there was no conflict. ' +
          'After moving to "pipeable" operators `throw` now conflicts with reserved names of te language.' +
          'Therefore it is renamed to `throwError` and exposed as static function',
        implication: '@TODO',
        exampleBefore: `
        import { Observable } from 'rxjs'
        Observable.throw(new Error('smooshMap does not exist'))
          .subscribe({next: n => console.log(n)});
        `,
        exampleAfter: `
        import { throwError } from 'rxjs'
        throwError(new Error('smooshMap does not exist'))
          .subscribe({next: n => console.log(n)});
        `
      }
    ]
  },
  {
    version: '6.2.0',
    date: '2018-05-22',
    deprecations: [
      {
        linkName: 'deprecation-race-operator-to-static',
        type: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.2.0/src/internal/operators/race.ts#L24',
        breakingVersion: '7.x.x',
        breakingLink: 'breakingChange-race-operator-removed',
        headline: 'Static `race` deprecated in favor of static function {@link race}',
        reason: 'As `race` operator is a name duplicate of static the operators to `race`.',
        implication: '@TODO',
        exampleBefore: `
        import { race } from 'rxjs/operators';
        a$
          .pipe(
            race(b$, c$)
          )
          .subscribe({next: n => console.log(n)});
        // or
        a$
        .pipe(
          race(b$, c$)
        )
        .subscribe({next: n => console.log(n)});
        `,
        exampleAfter: `
        import { race } from 'rxjs';
        race(a$, b$)
          .subscribe({next: n => console.log(n)});
        // or
        race(a$, b$)
        .subscribe({next: n => console.log(n)});
        `
      },
    ]
  },
  {
    version: '6.3.0',
    date: '2018-30-08',
    deprecations: [
      {
        linkName: 'interface-ObservableLike-deprecation-to-interopObservable ',
        type: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.3.0/src/internal/types.ts#L48',
        breakingVersion: '8.x.x',
        breakingLink: 'interface-ObservableLike-removed',
        headline: 'Interface `ObservableLike` deprecated. @TODO',
        reason: 'Interface `ObservableLike` in favour of `InteropObservable`. @TODO',
        implication: '@TODO',
        exampleBefore: `@TODO`,
        exampleAfter: `@TODO`
      }
    ]
  },
  {
    version: '6.4.0',
    date: '2019-01-30',
    deprecations: [
      {
        linkName: 'deprecation-class-Observable-subscribe-callback-argument-to-observer',
        type: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.4.0/src/internal/Observable.ts#L78',
        breakingVersion: '8.x.x',
        breakingLink: 'breakingChange-class-Observable-subscribe-callback-argument-removed',
        headline: 'The Observables `subscribe` method now takes an {@link Observer} object instead of callback',
        reason: 'The {@link Observer} object is way more explicit as the callbacks. We can avoid passing `null` for unused callbacks.' +
          'Also the typings are easier to implement.',
        implication: '@TODO',
        exampleBefore: `
        import { Observable } from 'rxjs';
        new Observable(subscriberFunc)
          .subscribe(
            (n) => console.log(n),
            (e) => console.log(e),
            ( ) => console.log('c')
          );
        `,
        exampleAfter: `
        import { Observable } from 'rxjs';
        new Observable(subscriberFunc)
          .subscribe({
            next:     (n) => console.log(n),
            error:    (e) => console.log(e),
            complete: ( ) => console.log('c')
          });
        `
      },
      {
        linkName: 'deprecation-operator-tap-callbacks-argument-to-observer',
        type: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.4.0/src/internal/operators/tap.ts#L13',
        breakingVersion: '8.x.x',
        breakingLink: 'breakingChange-operator-tap-callbacks-argument-removed',
        headline: 'Operator `tap` method now takes an {@link Observer} object instead of callback',
        reason: 'The {@link Observer} object is way more explicit as the callbacks. We can avoid passing `null` for unused callbacks.' +
          'Also the typings are easier to implement.',
        implication: '@TODO',
        exampleBefore: `
        import { tap } from 'rxjs/operators';
        a$
          .pipe(
            tap(
              (n) => console.log(n),
              (e) => console.log(e),
              ( ) => console.log('c')
            )
          )
          .subscribe();
        `,
        exampleAfter: `
        import { tap } from 'rxjs/operators';
        a$
          .pipe(
            tap({
              next:     (n) => console.log(n),
              error:    (e) => console.log(e),
              complete: ( ) => console.log('c')
            })
          )
          .subscribe();
        `
      },
      {
        linkName: 'deprecation-class-Observable-create',
        type: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.4.0/src/internal/Observable.ts#L53',
        breakingVersion: '8.x.x',
        breakingLink: 'breakingChange-class-Observable-create-removed',
        headline: 'Observable static method `create` deprecated in favour of normal instantiation over `new Observable()`',
        reason: `After moving to "pipeable" operators \`create\` static Observable method got deprecated.
        No new static method was created because \`new Observable() is more intuitive\`.`,
        implication: '@TODO',
        exampleBefore: `
        import { Observable } from 'rxjs';
        Observable.create(subscriberFunc)
          .subscribe({(n) => console.log(n)});
        `,
        exampleAfter: `
        import { Observable } from 'rxjs';
        new Observable(subscriberFunc)
          .subscribe({(n) => console.log(n)});
        `
      },
      {
        linkName: 'deprecation-class-TimeInterval-to-interface',
        type: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.4.0/src/internal/operators/timeInterval.ts#L69',
        breakingVersion: '8.x.x',
        breakingLink: 'breakingChange-class-TimeInterval-removed',
        headline: 'Class `TimeInterval` deprecated. As it is an internal implementation detail use it as Interface only.',
        reason: '@TODO',
        implication: '@TODO',
        exampleBefore: `@TODO`,
        exampleAfter: `@TODO`
      }
    ]
  },
  {
    version: '6.5.0',
    date: '2019-04-23',
    deprecations: [
      {
        linkName: 'deprecation-static-of-scheduler',
        type: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.5.0/src/internal/observable/of.ts#L29',
        breakingVersion: '8.x.x',
        breakingLink: 'breakingChange-static-of-scheduler-removed',
        headline: 'Static `of` deprecated the scheduler argument.',
        reason: 'The scheduling API is heavy and rarely used. Therefor it will get released as a separate package.' +
          'If you used `of` with a scheduler argument, you can use {@link scheduled} instead.',
        implication: '@TODO',
        exampleBefore: `
        import { of, asyncScheduler } from 'rxjs';
        of(777, asyncScheduler)
          .subscribe({next: (n) => { console.log(a); } });
        `,
        exampleAfter: `
        import { scheduled, asyncScheduler } from 'rxjs';
        scheduled([777], asyncScheduler)
          .subscribe({next: (n) => { console.log(a); } });
        `
      },
      {
        linkName: 'deprecation-static-combineLatest-scheduler',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.5.0/src/internal/observable/combineLatest.ts#L59',
        type: 'deprecation',
        breakingVersion: '8.x.x',
        breakingLink: 'breakingChange-static-combineLatest-scheduler-removed',
        headline: 'Static `combineLatest` deprecated the scheduler argument.',
        reason: 'The scheduling API is heavy and rarely used. Therefor it will get released as a separate package.' +
          'If you used `combineLatest` with a scheduler argument, you can use {@link scheduled} instead.',
        implication: '@TODO',
        exampleBefore: `
        import { combineLatest, asyncScheduler } from 'rxjs';
        combineLatest(a$, b$, asyncScheduler)
          .subscribe({next: (n) => { console.log(a); } });
        `,
        exampleAfter: `
        import { scheduled, asyncScheduler } from 'rxjs';
        scheduled([a$, b$], asyncScheduler)
          .subscribe({next: (n) => { console.log(a); } });
        `
      },
      {
        linkName: 'deprecation-static-combineLatest-resultSelector',
        type: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.5.0/src/internal/observable/combineLatest.ts#L43',
        breakingVersion: '8.x.x',
        breakingLink: 'breakingChange-static-combineLatest-resultSelector-removed',
        headline: 'Static `combineLatest` method deprecated the `resultSelector` argument',
        reason: 'By removing the resultSelector from `combineLatest` we get a smaller bundle since of the operator. ' +
          ' Further the resultSelector was not that often use and the refactoring to used `map` instead is a minor code change.',
        implication: '@TODO',
        exampleBefore: `
        import { combineLatest } from 'rxjs';
        combineLatest([a$,b$], resultSelector)
          .subscribe({next: n => console.log(n)});
        `,
        exampleAfter: `
        import { combineLatest, map } from 'rxjs';
        combineLatest([a$,b$])
        .pipe(
          map(n => resultSelector(...n))
        )
          .subscribe({next: n => console.log(n)});
        `
      },
      {
        linkName: 'deprecation-static-combineLatest-multiple-arguments',
        type: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.5.0/src/internal/observable/combineLatest.ts#L100',
        breakingVersion: '8.x.x',
        breakingLink: 'breakingChange-static-combineLatest-multiple-arguments-removed',
        headline: 'Static `combineLatest` method arguments in an array instead of single arguments.',
        reason: '@TODO',
        implication: '@TODO',
        exampleBefore: `
        import { combineLatest } from 'rxjs';
        combineLatest(a$,b$)
          .subscribe({next: n => console.log(n)});
        `,
        exampleAfter: `
        import { combineLatest } from 'rxjs';
        combineLatest([a$,b$])
          .subscribe({next: n => console.log(n)});
        `
      },
      {
        linkName: 'deprecation-static-forkJoin-deprecation-multiple-arguments',
        type: 'deprecation',
        breakingVersion: '8.x.x',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.5.0/src/internal/observable/forkJoin.ts#L22',
        breakingLink: 'breakingChange-static-forkJoin-multiple-arguments-removed',
        headline: 'Static `forkJoin` method arguments in an array instead of single arguments.',
        reason: 'It is easier to type and maintain @TODO needs check',
        implication: '@TODO',
        exampleBefore: `
        import { forkJoin } from 'rxjs';
        forkJoin(a$,b$)
          .subscribe({next: n => console.log(n)});
        `,
        exampleAfter: `
                import { forkJoin } from 'rxjs';
        forkJoin([a$,b$])
          .subscribe({next: n => console.log(n)})
        `
      },
      {
        linkName: 'deprecation-operator-partition-to-static',
        type: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.5.0/src/internal/operators/partition.ts#L54',
        breakingVersion: '8.x.x',
        breakingLink: 'breakingChange-operator-partition-removed',
        headline: 'Static `partition` deprecated in favor of static function {@link partition}',
        reason: 'As `partition` operator is not compose able and it can anyway only be used to create the array`.',
        implication: '@TODO',
        exampleBefore: `
        import { partition } from 'rxjs/operators';
        const p = interval$
        .pipe(
          partition((num, index: number) => !!(num % 2))
        );

        // odd
        p[0].subscribe(console.log);
        // even
        p[1].subscribe(console.log);
        `,
        exampleAfter: `
        import { partition } from 'rxjs';
        const p = partition(interval$, (num, index: number) => !!(num % 2))

        // odd
        p[0].subscribe(console.log);
        // even
        p[1].subscribe(console.log);
        `
      }
    ]
  },
  {
    version: '6.5.1',
    date: '2019-04-23',
    deprecations: [
      {
        linkName: 'deprecation-enum-NotificationKind-to-string-literal',
        type: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.5.1/src/internal/Notification.ts#L10',
        breakingVersion: '8.x.x',
        breakingLink: 'breakingChange-enum-NotificationKind-removed',
        headline: '`NotificationKind` is deprecated, use a string literal instead.',
        reason: 'NotificationKind is deprecated as const enums are not compatible with isolated modules. Use a string literal instead.',
        implication: '@TODO',
        exampleBefore: `
        import { NotificationKind } from 'rxjs';
        const next = NotificationKind.NEXT;
        `,
        exampleAfter: `
        import { NotificationKind } from 'rxjs';
        const next:NotificationKind = 'N';
        `
      }
    ]
  },
  {
    version: '7.0.0-alpha-0',
    date: '2019-09-18',
    deprecations: [
      {
        linkName: 'deprecation-operator-concat-scheduler',
        type: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/7.0.0-alpha.0/src/internal/observable/concat.ts#L17',
        breakingVersion: '8.x.x',
        breakingLink: 'breakingChange-operator-concat-scheduler-removed',
        headline: 'Static `concat` deprecate the scheduler argument',
        reason: 'Due to refactorings on scheduling in RxJS the scheduler argument of `concat` gets deprecated.',
        implication: '',
        exampleBefore: `
        import { concat, asyncScheduler } from 'rxjs';

        concat(a$, b$)
          .subscribe({ next: (n) => console.log(n) });
        `,
        exampleAfter: `
        import { scheduled, asyncScheduler } from 'rxjs';
        import { concatAll } from 'rxjs/operators';

        scheduled([a$, b$], asyncScheduler)
          .pipe(
            concatAll()
          )
          .subscribe({ next: (n) => console.log(n) });
        `
      },
      {
        linkName: 'deprecation-operator-of-deprecation-scheduler',
        type: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/7.0.0-alpha.0/src/internal/observable/of.ts#L29',
        breakingVersion: '8.x.x',
        breakingLink: 'breakingChange-static-of-scheduler-removed',
        headline: 'Static `of` deprecate the scheduler argument',
        reason: 'Due to refactorings on scheduling in RxJS the scheduler argument of `of` gets deprecated.',
        implication: '@TODO',
        exampleBefore: `
        import { of, asyncScheduler } from 'rxjs';
        of(1, asyncScheduler)
          .subscribe({ next: (n) => console.log(n) });
        `,
        exampleAfter: `
        import { scheduled, asyncScheduler } from 'rxjs';
        scheduled([1], scheduler)
          .subscribe({ next: (n) => console.log(n) });
        `
      },
      {
        linkName: 'deprecation-static-merge-deprecation-scheduler',
        type: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/7.0.0-alpha.0/src/internal/observable/merge.ts#L49',
        breakingVersion: '8.x.x',
        breakingLink: 'breakingChange-static-merge-scheduler-removed',
        headline: 'Static `merge` deprecate the scheduler argument',
        reason: 'Due to refactorings on scheduling in RxJS the scheduler argument of `merge` gets deprecated.',
        implication: '@TODO',
        exampleBefore: `
        import { merge, asyncScheduler } from 'rxjs';
        merge(a$, b$, asyncScheduler)
          .subscribe({ next: (n) => console.log(n) });
        import { scheduled, asyncScheduler } from 'rxjs';
        `,
        exampleAfter: `
        scheduled([a$, b$], scheduler)
          .pipe(
            mergeAll()
          )
          .subscribe({ next: (n) => console.log(n) });
        `
      },
      {
        linkName: 'deprecation-operator-startWith-scheduler',
        type: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/7.0.0-alpha.0/src/internal/operators/startWith.ts#L29',
        breakingVersion: '8.x.x',
        breakingLink: 'breakingChange-operator-startWith-scheduler-removed',
        headline: 'Operator `startWith` deprecate the scheduler argument',
        reason: 'Due to refactorings on scheduling in RxJS the scheduler argument of `startWith` gets deprecated.',
        implication: '@TODO',
        exampleBefore: `
        import { asyncScheduler } from 'rxjs';
        import { startWith, map } from 'rxjs/operators';

        a$
          .pipe(
            map(v => !!v),
            startsWith(false, asyncScheduler)
          )
          .subscribe({ next: (n) => console.log(n) });
`,
        exampleAfter: `
        import { asyncScheduler } from 'rxjs';
        import { scheduled, map } from 'rxjs/operators';

        scheduled([of(false), a$.pipe(map(v => !!v))], asyncScheduler]
          .pipe(
            mergeAll()
          )
          .subscribe({ next: (n) => console.log(n) });
        `
      },
      {
        linkName: 'deprecation-operator-endWith-scheduler',
        type: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/7.0.0-alpha.0/src/internal/operators/endWith.ts#L29',
        breakingVersion: '8.x.x',
        breakingLink: 'breakingChange-operator-endWith-scheduler-removed',
        headline: 'Operator `endWith` deprecate the scheduler argument',
        reason: 'Due to refactorings on scheduling in RxJS the scheduler argument of `endWith` gets deprecated.',
        implication: '@TODO',
        exampleBefore: `
        import { asyncScheduler } from 'rxjs';
        import { endWith, map } from 'rxjs/operators';

        a$
          .pipe(
            map(v => !!v),
            endWith(false, asyncScheduler)
          )
          .subscribe({ next: (n) => console.log(n) });
        `,
        exampleAfter: `        import { asyncScheduler } from 'rxjs';
        import { scheduled, map } from 'rxjs/operators';

        scheduled([a$.pipe(map(v => !!v)), of(false)], asyncScheduler]
          .pipe(
            mergeAll()
          )
          .subscribe({ next: (n) => console.log(n) });
        \`\`\`
        `
      },
      {
        linkName: 'deprecation-class-TestScheduler-hotObservables',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/7.0.0-alpha.0/src/internal/testing/TestScheduler.ts#L39',
        type: 'deprecation',
        breakingVersion: '8.x.x',
        breakingLink: 'breakingChange-class-TestScheduler-hotObservables-private',
        headline: 'Class `TestScheduler` deprecate the public property `hotObservables`',
        reason: '@TODO `TestScheduler` deprecates public `hotObservables` property and makes it protected as it is internal.',
        implication: '@TODO',
        exampleBefore: `@TODO`,
        exampleAfter: '@TODO'
      },
      {
        linkName: 'deprecation-class-TestScheduler-coldObservables',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/7.0.0-alpha.0/src/internal/testing/TestScheduler.ts#L44',
        type: 'deprecation',
        breakingVersion: '8.x.x',
        breakingLink: 'breakingChange-class-TestScheduler-coldObservables-private',
        headline: 'Class `TestScheduler` deprecate the public property `coldObservables`',
        reason: '@TODO `TestScheduler` deprecates public `coldObservables` property and makes it protected as it is and internal.',
        implication: '@TODO',
        exampleBefore: '@TODO',
        exampleAfter: '@TODO'
      },
      {
        linkName: 'deprecation-class-VirtualTimeScheduler-frameTimeFactor',
        type: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/7.0.0-alpha.0/src/internal/scheduler/VirtualTimeScheduler.ts#L8',
        breakingVersion: '8.x.x',
        breakingLink: 'breakingChange-class-VirtualTimeScheduler-breakingChange-frameTimeFactor',
        headline: 'Class `VirtualTimeScheduler` deprecates the static property `frameTimeFactor`.',
        reason: '`frameTimeFactor` is not used in `VirtualTimeScheduler` directly, therefore it does not belong here.',
        implication: '@TODO',
        exampleBefore: '@TODO',
        exampleAfter: '@TODO'
      },
      {
        linkName: 'class-VirtualTimeScheduler-index-to-private',
        type: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/7.0.0-alpha.0/src/internal/scheduler/VirtualTimeScheduler.ts#L23',
        breakingVersion: '8.x.x',
        breakingLink: 'breakingChange-class-VirtualTimeScheduler-index-private',
        headline: 'Class `VirtualTimeScheduler` deprecates the static property `index`.',
        reason: '`index` property of `VirtualTimeScheduler` is only used internally and should ot be used.',
        implication: '',
        exampleBefore: '@TODO',
        exampleAfter: '@TODO'
      }
    ]
  },
  {
    version: '8.0.0.alpha.0',
    date: '???????',
    breakingChanges: [
      {
        linkName: 'breakingChange-operator-concat-scheduler-removed',
        type: 'breakingChange',
        deprecationVersion: '7.0.0-alpha.0',
        deprecationLink: 'deprecation-operator-concat-scheduler',
        headline: 'Static `concat` method removed the `scheduler` argument'
      },
      {
        linkName: 'breakingChange-static-of-scheduler-removed',
        type: 'breakingChange',
        deprecationVersion: '7.0.0-alpha.0',
        deprecationLink: 'deprecation-operator-of-scheduler',
        headline: 'Static `of` method removed the `scheduler` argument'
      },
      {
        linkName: 'breakingChange-static-merge-scheduler-removed',
        type: 'breakingChange',
        deprecationVersion: '7.0.0-alpha.0',
        deprecationLink: 'deprecation-operator-merge-scheduler',
        headline: 'Static `merge` method removed the `scheduler` argument'
      },
      {
        linkName: 'breakingChange-operator-startWith-scheduler-removed',
        type: 'breakingChange',
        deprecationVersion: '7.0.0-alpha.0',
        deprecationLink: 'deprecation-operator-startWith-scheduler',
        headline: 'Static `startWith` method removed the `scheduler` argument'
      },
      {
        linkName: 'breakingChange-operator-endWith-scheduler-removed',
        type: 'breakingChange',
        deprecationVersion: '7.0.0-alpha.0',
        deprecationLink: 'deprecation-operator-endWith-scheduler',
        headline: 'Static `endWith` method removed the `scheduler` argument'
      },
      {
        linkName: 'breakingChange-class-TestScheduler-hotObservables',
        type: 'breakingChange',
        deprecationVersion: '7.0.0-alpha.0',
        deprecationLink: 'deprecation-class-TestScheduler-hotObservables-private',
        headline: 'Class `TestScheduler` method made the `hotObservables` property private'
      },
      {
        linkName: 'breakingChange-class-TestScheduler-coldObservables',
        type: 'breakingChange',
        deprecationVersion: '7.0.0-alpha.0',
        deprecationLink: 'deprecation-class-TestScheduler-coldObservables-private',
        headline: 'Class `TestScheduler` method made the `coldObservables` property private'
      },
      {
        linkName: 'breakingChange-class-VirtualTimeScheduler-breakingChange-frameTimeFactor',
        type: 'breakingChange',
        deprecationVersion: '7.0.0-alpha.0',
        deprecationLink: 'deprecation-class-VirtualTimeScheduler-breakingChange-frameTimeFactor',
        headline: 'Class `VirtualTimeScheduler` moved `frameTimeFactor` out of class.'
      },
      {
        linkName: 'breakingChange-class-VirtualTimeScheduler-index-private',
        type: 'breakingChange',
        deprecationVersion: '7.0.0-alpha.0',
        deprecationLink: 'deprecation-class-VirtualTimeScheduler-breakingChange-frameTimeFactor',
        headline: 'Class `VirtualTimeScheduler` made `index` property private.'
      }
    ]
  }

];

function getGeneralResultSelectorPhrase(operatorName: string): string {
  return `By removing the result selector from \`${operatorName}\` we get a smaller bundle since of the operator.
          Further the resultSelector was not that often used and the
          refactoring to use and internal \`map\` operation instead is a minor code change.`;
}

function toRefactoring(deprecation: Deprecation, version: string): string {
  return `
    Before Deprecation (< ${version})
    ${deprecation.exampleBefore}
    After Deprecation (>= ${version})
    ${deprecation.exampleBefore}
    `;
}

