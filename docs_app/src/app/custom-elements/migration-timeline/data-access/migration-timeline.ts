import {ApiSymbols, Release} from './interfaces';

/*
**Code MSG:**
@TODO => parse able message in code =>  @deprecated [breakingChange-in v8]: <>
Pattern: <GenericDeprecationError> <HumanReadableShortMessage> - see <LinkToDeprecationPage>
- GenericDeprecationError:
- HumanReadableShortMessage: headline of deprecation object
- LinkToDeprecationPage: Follows pattern of LinkName

@TODO Consider:
- how to structure rollback of a deprecation?
https://github.com/ReactiveX/rxjs/issues/5107
 */

// @TODO => rxjs-compat intro and remove
export const deprecationAndBreakingChangeTimeline: Release[] = [
  {
    version: '6.0.0-beta.4',
    date: '2018-03-29',
    deprecations: [
      {
        subject: 'never',
        subjectApiSymbol: ApiSymbols.function,
        linkName: 'deprecation-static-method-never-to-constant',
        type: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-beta.4/src/internal/observable/never.ts#L30',
        breakingVersion: '7',
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
        subject: 'empty',
        subjectApiSymbol: ApiSymbols.function,
        linkName: 'deprecation-static-method-empty-to-constant',
        type: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-beta.4/src/internal/observable/empty.ts#L52',
        breakingVersion: '7',
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
        subject: 'WebSocketSubject',
        subjectApiSymbol: ApiSymbols.function,
        linkName: 'deprecation-class-WebSocketSubject-deserializer-to-resultSelector',
        type: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-beta.4/src/internal/observable/dom/WebSocketSubject.ts#L16',
        breakingVersion: '7',
        breakingLink: 'breakingChange-class-WebSocketSubject-deserializer-removed',
        headline: 'WebSocketSubject use `deserializer` in favour or `resultSelector`',
        reason: '@TODO',
        implication: '@!TODO',
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
    ],
    breakingChanges: []
  },
  {
    version: '6.0.0-alpha.3',
    date: '2018-02-09',
    deprecations: [
      {
        subject: 'last',
        subjectApiSymbol: ApiSymbols.function,
        linkName: 'deprecation-operator-last-resultSelector',
        type: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-alpha.3/src/internal/operators/last.ts#L12',
        breakingVersion: '6.0.0-alpha.4',
        breakingLink: 'breakingChange-operator-last-resultSelector',
        headline: getGeneralOperatorResultSelectorHeadlinePhrase('last'),
        reason: getGeneralStaticResultSelectorReasonPhrase('last'),
        implication: '@!TODO',
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
      },
      {
        subject: 'first',
        subjectApiSymbol: ApiSymbols.function,
        linkName: 'deprecation-operator-first-resultSelector',
        type: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-alpha.3/src/internal/operators/first.ts#L18',
        breakingVersion: '6.0.0-alpha.4',
        breakingLink: 'breakingChange-operator-first-resultSelector',
        headline: getGeneralOperatorResultSelectorHeadlinePhrase('first'),
        reason: getGeneralStaticResultSelectorReasonPhrase('first'),
        implication: '@!TODO',
        exampleBefore: `
        import { first } from 'rxjs/operators';
        a$
        .pipe(
          first((n, i) => n))
        )
          .subscribe({next: n => console.log(n)})
        `,
        exampleAfter: `
        import { first, map } from 'rxjs/operators';
        a$
        .pipe(
          first(),
          map((n, i) => n))
        )
          .subscribe({next: n => console.log(n)});
        `
      }
    ],
    breakingChanges: []
  },
  {
    version: '6.0.0-alpha.4',
    date: '2018-03-13',
    deprecations: [],
    breakingChanges: [
      {
        subject: 'last',
        subjectApiSymbol: ApiSymbols.function,
        linkName: 'breakingChange-operator-last-resultSelector-remove',
        type: 'breakingChange',
        deprecationVersion: '6.0.0-alpha.3',
        deprecationLink: 'deprecation-operator-last-resultSelector',
        headline: 'Operator `last` method removed the `resultSelector` argument'
      },
      {
        subject: 'first',
        subjectApiSymbol: ApiSymbols.function,
        linkName: 'breakingChange-operator-first-resultSelector-remove',
        type: 'breakingChange',
        deprecationVersion: '6.0.0-alpha.3',
        deprecationLink: 'deprecation-operator-first-resultSelector',
        headline: 'Operator `first` method removed the `resultSelector` argument'
      }
    ]
  },
  {
    version: '6.0.0-rc.0',
    date: '2018-03-31',
    deprecations: [
      {
        subject: 'combineLatest',
        subjectApiSymbol: ApiSymbols.function,
        linkName: 'deprecation-operator-combineLatest-to-static',
        type: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-rc.0/src/internal/operators/combineLatest.ts#L42',
        breakingVersion: '7',
        breakingLink: 'breakingChange-operator-combineLatest-removed',
        headline: getGeneralFlatteningHeadlinePhrase('combineLatest'),
        reason: getGeneralFlatteningReasonPhrase('combineLatest'),
        implication: '@!TODO',
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
        subject: 'merge',
        subjectApiSymbol: ApiSymbols.function,
        linkName: 'deprecation-operator-merge-to-static',
        type: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-rc.0/src/internal/operators/merge.ts#L37',
        breakingVersion: '7',
        breakingLink: 'breakingChange-operator-merge-removed',
        headline: getGeneralFlatteningHeadlinePhrase('merge'),
        reason: getGeneralFlatteningReasonPhrase('merge'),
        implication: '@!TODO',
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
        subject: 'zip',
        subjectApiSymbol: ApiSymbols.function,
        linkName: 'deprecation-operator-zip-to-static',
        type: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-rc.0/src/internal/operators/zip.ts#L37',
        breakingVersion: '7',
        breakingLink: 'breakingChange-operator-zip-removed',
        headline: getGeneralFlatteningHeadlinePhrase('zip'),
        reason: getGeneralFlatteningReasonPhrase('zip'),
        implication: '@!TODO',
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
        subject: 'concat',
        subjectApiSymbol: ApiSymbols.function,
        linkName: 'deprecation-operator-concat-to-static',
        type: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-rc.0/src/internal/operators/concat.ts#L25',
        breakingVersion: '7',
        breakingLink: 'breakingChange-operator-concat-removed',
        headline: getGeneralFlatteningHeadlinePhrase('concat'),
        reason: getGeneralFlatteningReasonPhrase('concat'),
        implication: '@!TODO',
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
        subject: 'zip',
        subjectApiSymbol: ApiSymbols.function,
        linkName: 'deprecation-static-zip-resultSelector',
        type: 'deprecation',
        sourceLink: `https://github.com/ReactiveX/rxjs/blob/6.0.0-rc.0/src/internal/observable/zip.ts#L37`,
        breakingVersion: '7',
        breakingLink: 'breakingChange-static-zip-resultSelector-removed',
        headline: getGeneralStaticResultSelectorHeadlinePhrase('zip'),
        reason: getGeneralStaticResultSelectorReasonPhrase('zip'),
        implication: '@!TODO',
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
        subject: 'fromEventPattern',
        subjectApiSymbol: ApiSymbols.function,
        linkName: 'deprecation-static-fromEventPattern-resultSelector',
        type: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-rc.0/src/internal/observable/fromEventPattern.ts#L9',
        breakingVersion: '7',
        breakingLink: 'breakingChange-static-fromEventPattern-resultSelector-removed',
        headline: getGeneralStaticResultSelectorHeadlinePhrase('fromEventPattern'),
        reason: getGeneralStaticResultSelectorReasonPhrase('fromEventPattern'),
        implication: '@!TODO',
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
        subject: 'bindNodeCallback',
        subjectApiSymbol: ApiSymbols.function,
        linkName: 'deprecation-static-bindNodeCallback-resultSelector',
        type: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-rc.0/src/internal/observable/bindNodeCallback.ts#L10',
        breakingVersion: '7',
        breakingLink: 'breakingChange-static-bindNodeCallback-resultSelector-removed',
        headline: getGeneralStaticResultSelectorHeadlinePhrase('bindNodeCallback'),
        reason: getGeneralStaticResultSelectorReasonPhrase('bindNodeCallback'),
        implication: '@!TODO',
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
        subject: 'bindCallback',
        subjectApiSymbol: ApiSymbols.function,
        linkName: 'deprecation-static-bindCallback-resultSelector',
        type: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-rc.0/src/internal/observable/bindCallback.ts#L10',
        breakingVersion: '7',
        breakingLink: 'breakingChange-static-bindCallback-resultSelector-removed',
        headline: getGeneralStaticResultSelectorHeadlinePhrase('bindCallback'),
        reason: getGeneralStaticResultSelectorReasonPhrase('bindCallback'),
        implication: '@!TODO',
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
        subject: 'forkJoin',
        subjectApiSymbol: ApiSymbols.function,
        linkName: 'deprecation-static-forkJoin-resultSelector',
        type: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-rc.0/src/internal/observable/forkJoin.ts#L29',
        breakingVersion: '7',
        breakingLink: 'breakingChange-static-forkJoin-resultSelector-removed',
        headline: getGeneralStaticResultSelectorHeadlinePhrase('forkJoin'),
        reason: getGeneralStaticResultSelectorReasonPhrase('forkJoin'),
        implication: '@!TODO',
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
        subject: 'fromEvent',
        subjectApiSymbol: ApiSymbols.function,
        linkName: 'deprecation-static-fromEvent-resultSelector',
        type: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-rc.0/src/internal/observable/fromEvent.ts#L32',
        breakingVersion: '7',
        breakingLink: 'breakingChange-static-fromEvent-resultSelector-removed',
        headline: getGeneralStaticResultSelectorHeadlinePhrase('fromEvent'),
        reason: getGeneralStaticResultSelectorReasonPhrase('fromEvent'),
        implication: '@!TODO',
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
        subject: 'switchMap',
        subjectApiSymbol: ApiSymbols.function,
        linkName: 'deprecation-operator-switchMap-resultSelector',
        type: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-rc.0/src/internal/operators/switchMap.ts#L16',
        breakingVersion: '7',
        breakingLink: 'breakingChange-operator-switchMap-resultSelector-removed',
        headline: getGeneralOperatorResultSelectorHeadlinePhrase('switchMap'),
        reason: getGeneralStaticResultSelectorReasonPhrase('switchMap'),
        implication: '@!TODO',
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
        subject: 'switchMapTo',
        subjectApiSymbol: ApiSymbols.function,
        linkName: 'deprecation-operator-switchMapTo-resultSelector',
        type: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-rc.0/src/internal/operators/switchMapTo.ts#L15',
        breakingVersion: '7',
        breakingLink: 'breakingChange-operator-switchMapTo-resultSelector-removed',
        headline: getGeneralOperatorResultSelectorHeadlinePhrase('switchMapTo'),
        reason: getGeneralStaticResultSelectorReasonPhrase('switchMapTo'),
        implication: '@!TODO',
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
          switchMapTo((a, i) => b$.pipe(
            map((b, ii) => resultSelector(a, b, i, ii))
          ))
        )
          .subscribe({next: n => console.log(n)});
        `
      },
      {
        subject: 'concatMap',
        subjectApiSymbol: ApiSymbols.function,
        linkName: 'deprecation-operator-concatMap-resultSelector',
        type: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-rc.0/src/internal/operators/concatMap.ts#L8',
        breakingVersion: '7',
        breakingLink: 'breakingChange-operator-concatMap-resultSelector-removed',
        headline: getGeneralOperatorResultSelectorHeadlinePhrase('concatMap'),
        reason: getGeneralStaticResultSelectorReasonPhrase('concatMap'),
        implication: '@!TODO',
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
        subject: 'concatMapTo',
        subjectApiSymbol: ApiSymbols.function,
        linkName: 'deprecation-operator-concatMapTo-resultSelector',
        type: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-rc.0/src/internal/operators/concatMapTo.ts#L8',
        breakingVersion: '7',
        breakingLink: 'breakingChange-operator-concatMapTo-resultSelector-removed',
        headline: getGeneralOperatorResultSelectorHeadlinePhrase('concatMapTo'),
        reason: getGeneralStaticResultSelectorReasonPhrase('concatMapTo'),
        implication: '@!TODO',
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
        subject: 'mergeMap',
        subjectApiSymbol: ApiSymbols.function,
        linkName: 'deprecation-operator-mergeMap-resultSelector',
        type: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-rc.0/src/internal/operators/mergeMap.ts#L16',
        breakingVersion: '7',
        breakingLink: 'breakingChange-operator-mergeMap-resultSelector-removed',
        headline: getGeneralOperatorResultSelectorHeadlinePhrase('mergeMap'),
        reason: getGeneralStaticResultSelectorReasonPhrase('mergeMap'),
        implication: '@!TODO',
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
        subject: 'mergeMapTo',
        subjectApiSymbol: ApiSymbols.function,
        linkName: 'deprecation-operator-mergeMapTo-resultSelector',
        type: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-rc.0/src/internal/operators/mergeMapTo.ts#L8',
        breakingVersion: '7',
        breakingLink: 'breakingChange-operator-mergeMapTo-resultSelector-removed',
        headline: getGeneralOperatorResultSelectorHeadlinePhrase('mergeMapTo'),
        reason: getGeneralStaticResultSelectorReasonPhrase('mergeMapTo'),
        implication: '@!TODO',
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
        subject: 'exhaustMapTo',
        subjectApiSymbol: ApiSymbols.function,
        linkName: 'deprecation-operator-exhaustMap-resultSelector',
        type: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-rc.0/src/internal/operators/exhaustMap.ts#L16',
        breakingVersion: '7',
        breakingLink: 'breakingChange-operator-exhaustMap-resultSelector-removed',
        headline: getGeneralOperatorResultSelectorHeadlinePhrase('exhaustMap'),
        reason: getGeneralStaticResultSelectorReasonPhrase('exhaustMap'),
        implication: '@!TODO',
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
    ],
    breakingChanges: []
  },
  {
    version: '6.0.0-tactical-rc.1',
    date: '2018-04-07',
    deprecations: [
      {
        subject: 'Scheduler',
        subjectApiSymbol: ApiSymbols.class,
        linkName: 'deprecation-class-Scheduler',
        type: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-tactical-rc.1/src/internal/Scheduler.ts#L20',
        breakingVersion: '7',
        breakingLink: 'breakingChange-class-Scheduler-removed',
        headline: 'Class `Scheduler` deprecated in favor of Interface {@link SchedulerLike}',
        reason: 'As `Scheduler` is an internal implementation detail of RxJS, and ' +
          'should not be used directly. Create your own class instead and implement the Interface {@link SchedulerLike}',
        implication: '@!TODO',
        exampleBefore: `
        @TODO => review
        import { Scheduler, Subscription, of } from "rxjs";
        import { Zone } from "./Zone";

        function leaveZone(
          zone: Zone,
          scheduler: Scheduler = queueScheduler
        ): SchedulerLike {
          return new LeaveZoneScheduler(zone, scheduler) as any;
        }

        class LeaveZoneScheduler {
          constructor(private zone: Zone, private scheduler: Scheduler) {}

          schedule(...args: any[]): Subscription {
            return this.zone.runOutsideAngular(() =>
              this.scheduler.schedule.apply(this.scheduler, args)
            );
          }
        }

        of(1, leaveZone(zone))
          .subscribe();
        `,
        exampleAfter: `
        import { SchedulerLike, Subscription, of } from "rxjs";
        import { Zone } from "./Zone";

        function leaveZone(
          zone: Zone,
          scheduler: SchedulerLike = queueScheduler
        ): SchedulerLike {
          return new LeaveZoneScheduler(zone, scheduler) as any;
        }

        class LeaveZoneScheduler {
          constructor(private zone: Zone, private scheduler: SchedulerLike) {}

          schedule(...args: any[]): Subscription {
            return this.zone.runOutsideAngular(() =>
              this.scheduler.schedule.apply(this.scheduler, args)
            );
          }
        }

         of(1, leaveZone(zone))
          .subscribe();
        `
      }
    ],
    breakingChanges: []
  },
  {
    version: '6.0.0-rc.1',
    date: '2018-04-07',
    deprecations: [
      {
        subject: 'Observable',
        subjectApiSymbol: ApiSymbols.class,
        linkName: 'deprecation-class-Observable-if-to-static',
        type: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-rc.1/src/internal/Observable.ts#L260',
        breakingVersion: '7',
        breakingLink: 'breakingChange-class-Observable-if-removed',
        headline: 'Observable static method `if` moved to static operator function {@link iif}',
        reason: 'As `if` was a prototype method there was no conflict. ' +
          'After moving to "pipeable" operators `if` now conflicts with reserved names of te language.' +
          'Therefore it is renamed to `iif` and exposed as static function',
        implication: '@!TODO',
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
        subject: 'Observable',
        subjectApiSymbol: ApiSymbols.class,
        linkName: 'deprecation-class-Observable-throw-to-static',
        type: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-rc.1/src/internal/Observable.ts#L265',
        breakingVersion: '7',
        breakingLink: 'breakingChange-class-Observable-throw-removed',
        headline: 'Observable static method `throw` moved to static operator function {@link iif}',
        reason: 'As `if` was a prototype method there was no conflict. ' +
          'After moving to "pipeable" operators `throw` now conflicts with reserved names of te language.' +
          'Therefore it is renamed to `throwError` and exposed as static function',
        implication: '@!TODO',
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
    ],
    breakingChanges: []
  },
  {
    version: '6.2.0',
    date: '2018-05-22',
    deprecations: [
      {
        subject: 'race',
        subjectApiSymbol: ApiSymbols.function,
        linkName: 'deprecation-race-operator-to-static',
        type: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.2.0/src/internal/operators/race.ts#L24',
        breakingVersion: '7',
        breakingLink: 'breakingChange-race-operator-removed',
        headline: 'Static `race` deprecated in favor of static function {@link race}',
        reason: 'As `race` operator is a name duplicate of static the operators to `race`.',
        implication: '@!TODO',
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
    ],
    breakingChanges: []
  },
  {
    version: '6.3.0',
    date: '2018-08-30',
    deprecations: [
      {
        subject: 'ObservableLike',
        subjectApiSymbol: ApiSymbols.interface,
        linkName: 'interface-ObservableLike-deprecation-to-interopObservable ',
        type: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.3.0/src/internal/types.ts#L48',
        breakingVersion: '8',
        breakingLink: 'interface-ObservableLike-removed',
        headline: 'Interface `ObservableLike` in favour of `InteropObservable`',
        reason: `This interface is only here to provide
         the [observable symbol](https://github.com/ReactiveX/rxjs/blob/6.5.3/src/internal/types.ts#L57)`,
        implication: '@!TODO',
        exampleBefore: `
        import { ObservableLike } from 'rxjs';
        let o: ObservableLike;
        `,
        exampleAfter: `
        import { InteropObservable } from 'rxjs';
        let o: InteropObservable;
        `
      }
    ],
    breakingChanges: []
  },
  {
    version: '6.4.0',
    date: '2019-01-30',
    deprecations: [
      {
        subject: 'ObservableLike',
        subjectApiSymbol: ApiSymbols.class,
        linkName: 'deprecation-class-Observable-subscribe-callback-argument-to-observer',
        type: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.4.0/src/internal/Observable.ts#L78',
        breakingVersion: '8',
        breakingLink: 'breakingChange-class-Observable-subscribe-callback-argument-removed',
        headline: 'The Observables `subscribe` method now takes an {@link Observer} object instead of callback',
        reason: `The {@link Observer} object is way more explicit as the callbacks.
        We can also avoid passing \`null\` for unused callbacks.
        It's more 'readable' as the callbacks are named as actual properties of the \`observer\`.
        Technically supporting both observers and individual callbacks is a pain.

        This deprecation will maybe get rolled back depending on official specification.
`,
        implication: '@!TODO',
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
        subject: 'tap',
        subjectApiSymbol: ApiSymbols.function,
        linkName: 'deprecation-operator-tap-callbacks-argument-to-observer',
        type: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.4.0/src/internal/operators/tap.ts#L13',
        breakingVersion: '8',
        breakingLink: 'breakingChange-operator-tap-callbacks-argument-removed',
        headline: 'Operator `tap` method now takes an {@link Observer} object instead of callback',
        reason: 'The {@link Observer} object is way more explicit as the callbacks. We can avoid passing `null` for unused callbacks.' +
          'Also the typings are easier to implement.',
        implication: '@!TODO',
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
        subject: 'Observable',
        subjectApiSymbol: ApiSymbols.class,
        linkName: 'deprecation-class-Observable-create',
        type: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.4.0/src/internal/Observable.ts#L53',
        breakingVersion: '8',
        breakingLink: 'breakingChange-class-Observable-create-removed',
        headline: 'Observable static method `create` deprecated in favour of normal instantiation over `new Observable()`',
        reason: `After moving to "pipeable" operators \`create\` static Observable method got deprecated.
        No new static method was created because \`new Observable() is more intuitive and natural to the language.
        Technically older versions of TypeScript had many more limitations that today's version`,
        implication: '@!TODO',
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
        subject: 'TimeInterval',
        subjectApiSymbol: ApiSymbols.class,
        linkName: 'deprecation-class-TimeInterval-to-interface',
        type: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.4.0/src/internal/operators/timeInterval.ts#L69',
        breakingVersion: '8',
        breakingLink: 'breakingChange-class-TimeInterval-removed',
        headline: 'Class `TimeInterval` deprecated. As it is an internal implementation detail use it as Interface only.',
        reason: `Class TimeInterval gets deprecated in favour of
         interface [TimeInterval](https://github.com/ReactiveX/rxjs/blob/6.5.3/src/internal/types.ts#L19-L22)`,
        implication: '@!TODO',
        exampleBefore: `@TODO`,
        exampleAfter: `@TODO`
      }
    ],
    breakingChanges: []
  },
  {
    version: '6.5.0',
    date: '2019-04-23',
    deprecations: [
      {
        subject: 'of',
        subjectApiSymbol: ApiSymbols.function,
        linkName: 'deprecation-static-of-scheduler',
        type: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.5.0/src/internal/observable/of.ts#L29',
        breakingVersion: '8',
        breakingLink: 'breakingChange-static-of-scheduler-removed',
        headline: 'Static `of` deprecated the scheduler argument.',
        reason: 'The scheduling API is heavy and rarely used. Therefor it will get released as a separate package.' +
          'If you used `of` with a scheduler argument, you can use {@link scheduled} instead.',
        implication: '@!TODO',
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
        subject: 'combineLatest',
        subjectApiSymbol: ApiSymbols.function,
        linkName: 'deprecation-static-combineLatest-scheduler',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.5.0/src/internal/observable/combineLatest.ts#L59',
        type: 'deprecation',
        breakingVersion: '8',
        breakingLink: 'breakingChange-static-combineLatest-scheduler-removed',
        headline: 'Static `combineLatest` deprecated the scheduler argument.',
        reason: 'The scheduling API is heavy and rarely used. Therefor it will get released as a separate package.' +
          'If you used `combineLatest` with a scheduler argument, you can use {@link scheduled} instead.',
        implication: '@!TODO',
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
        subject: 'combineLatest',
        subjectApiSymbol: ApiSymbols.function,
        linkName: 'deprecation-static-combineLatest-resultSelector',
        type: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.5.0/src/internal/observable/combineLatest.ts#L43',
        breakingVersion: '8',
        breakingLink: 'breakingChange-static-combineLatest-resultSelector-removed',
        headline: getGeneralStaticResultSelectorHeadlinePhrase('combineLatest'),
        reason: getGeneralStaticResultSelectorReasonPhrase('combineLatest'),
        implication: '@!TODO',
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
        subject: 'combineLatest',
        subjectApiSymbol: ApiSymbols.function,
        linkName: 'deprecation-static-combineLatest-multiple-arguments',
        type: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.5.0/src/internal/observable/combineLatest.ts#L100',
        breakingVersion: '8',
        breakingLink: 'breakingChange-static-combineLatest-multiple-arguments-removed',
        headline: 'Static `combineLatest` method arguments in an array instead of single arguments.',
        reason: `Static \`combineLatest\` method arguments in an array instead of single arguments.
        They are technically easier to type.`,
        implication: '@!TODO',
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
        subject: 'forkJoin',
        subjectApiSymbol: ApiSymbols.function,
        linkName: 'deprecation-static-forkJoin-multiple-arguments',
        type: 'deprecation',
        breakingVersion: '8',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.5.0/src/internal/observable/forkJoin.ts#L22',
        breakingLink: 'breakingChange-static-forkJoin-multiple-arguments-removed',
        headline: 'Static `forkJoin` method arguments in an array instead of single arguments.',
        reason: `Static \`forkJoin\` method arguments in an array instead of single arguments.
        They are technically easier to type.`,
        implication: '@!TODO',
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
        subject: 'partition',
        subjectApiSymbol: ApiSymbols.function,
        linkName: 'deprecation-operator-partition-to-static',
        type: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.5.0/src/internal/operators/partition.ts#L54',
        breakingVersion: '8',
        breakingLink: 'breakingChange-operator-partition-removed',
        headline: 'Static `partition` deprecated in favor of static function {@link partition}',
        reason: 'As `partition` operator is not compose able and it can anyway only be used to create the array`.',
        implication: '@!TODO',
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
    ],
    breakingChanges: []
  },
  {
    version: '6.5.1',
    date: '2019-04-23',
    deprecations: [
      {
        subject: 'NotificationKind',
        subjectApiSymbol: ApiSymbols.enum,
        linkName: 'deprecation-enum-NotificationKind-to-string-literal',
        type: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.5.1/src/internal/Notification.ts#L10',
        breakingVersion: '8',
        breakingLink: 'breakingChange-enum-NotificationKind-removed',
        headline: '`NotificationKind` is deprecated, use a string literal instead.',
        reason: 'NotificationKind is deprecated as const enums are not compatible with isolated modules. Use a string literal instead.',
        implication: '@!TODO',
        exampleBefore: `
        import { NotificationKind } from 'rxjs';
        const next = NotificationKind.NEXT;
        `,
        exampleAfter: `
        import { NotificationKind } from 'rxjs';
        const next:NotificationKind = 'N';
        `
      }
    ],
    breakingChanges: []
  },
  {
    version: '7.0.0-alpha.0',
    date: '2019-09-18',
    deprecations: [
      {
        subject: 'concat',
        subjectApiSymbol: ApiSymbols.function,
        linkName: 'deprecation-operator-concat-scheduler',
        type: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/7.0.0-alpha.0/src/internal/observable/concat.ts#L17',
        breakingVersion: '8',
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
        subject: 'of',
        subjectApiSymbol: ApiSymbols.function,
        linkName: 'deprecation-operator-of-deprecation-scheduler',
        type: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/7.0.0-alpha.0/src/internal/observable/of.ts#L29',
        breakingVersion: '8',
        breakingLink: 'breakingChange-static-of-scheduler-removed',
        headline: 'Static `of` deprecate the scheduler argument',
        reason: 'Due to refactorings on scheduling in RxJS the scheduler argument of `of` gets deprecated.',
        implication: '@!TODO',
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
        subject: 'merge',
        subjectApiSymbol: ApiSymbols.function,
        linkName: 'deprecation-static-merge-deprecation-scheduler',
        type: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/7.0.0-alpha.0/src/internal/observable/merge.ts#L49',
        breakingVersion: '8',
        breakingLink: 'breakingChange-static-merge-scheduler-removed',
        headline: 'Static `merge` deprecate the scheduler argument',
        reason: 'Due to refactorings on scheduling in RxJS the scheduler argument of `merge` gets deprecated.',
        implication: '@!TODO',
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
        subject: 'startWith',
        subjectApiSymbol: ApiSymbols.function,
        linkName: 'deprecation-operator-startWith-scheduler',
        type: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/7.0.0-alpha.0/src/internal/operators/startWith.ts#L29',
        breakingVersion: '8',
        breakingLink: 'breakingChange-operator-startWith-scheduler-removed',
        headline: 'Operator `startWith` deprecate the scheduler argument',
        reason: 'Due to refactorings on scheduling in RxJS the scheduler argument of `startWith` gets deprecated.',
        implication: '@!TODO',
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
        subject: 'endWith',
        subjectApiSymbol: ApiSymbols.function,
        linkName: 'deprecation-operator-endWith-scheduler',
        type: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/7.0.0-alpha.0/src/internal/operators/endWith.ts#L29',
        breakingVersion: '8',
        breakingLink: 'breakingChange-operator-endWith-scheduler-removed',
        headline: 'Operator `endWith` deprecate the scheduler argument',
        reason: 'Due to refactorings on scheduling in RxJS the scheduler argument of `endWith` gets deprecated.',
        implication: '@!TODO',
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
        subject: 'TestScheduler',
        subjectApiSymbol: ApiSymbols.class,
        linkName: 'deprecation-class-TestScheduler-hotObservables',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/7.0.0-alpha.0/src/internal/testing/TestScheduler.ts#L39',
        type: 'deprecation',
        breakingVersion: '8',
        breakingLink: 'breakingChange-class-TestScheduler-hotObservables-private',
        headline: 'Class `TestScheduler` deprecate the public property `hotObservables`',
        reason: '@TODO `TestScheduler` deprecates public `hotObservables` property and makes it protected as it is internal.',
        implication: '@!TODO',
        exampleBefore: `@TODO`,
        exampleAfter: '@TODO'
      },
      {
        subject: 'TestScheduler',
        subjectApiSymbol: ApiSymbols.class,
        linkName: 'deprecation-class-TestScheduler-coldObservables',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/7.0.0-alpha.0/src/internal/testing/TestScheduler.ts#L44',
        type: 'deprecation',
        breakingVersion: '8',
        breakingLink: 'breakingChange-class-TestScheduler-coldObservables-private',
        headline: 'Class `TestScheduler` deprecate the public property `coldObservables`',
        reason: '@TODO `TestScheduler` deprecates public `coldObservables` property and makes it protected as it is and internal.',
        implication: '@!TODO',
        exampleBefore: '@TODO',
        exampleAfter: '@TODO'
      },
      {
        subject: 'VirtualTimeScheduler',
        subjectApiSymbol: ApiSymbols.class,
        linkName: 'deprecation-class-VirtualTimeScheduler-frameTimeFactor',
        type: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/7.0.0-alpha.0/src/internal/scheduler/VirtualTimeScheduler.ts#L8',
        breakingVersion: '8',
        breakingLink: 'breakingChange-class-VirtualTimeScheduler-breakingChange-frameTimeFactor',
        headline: 'Class `VirtualTimeScheduler` deprecates the static property `frameTimeFactor`.',
        reason: '`frameTimeFactor` is not used in `VirtualTimeScheduler` directly, therefore it does not belong here.',
        implication: '@!TODO',
        exampleBefore: '@TODO',
        exampleAfter: '@TODO'
      },
      {
        subject: 'VirtualTimeScheduler',
        subjectApiSymbol: ApiSymbols.class,
        linkName: 'class-VirtualTimeScheduler-index-to-private',
        type: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/7.0.0-alpha.0/src/internal/scheduler/VirtualTimeScheduler.ts#L23',
        breakingVersion: '8',
        breakingLink: 'breakingChange-class-VirtualTimeScheduler-index-private',
        headline: 'Class `VirtualTimeScheduler` deprecates the static property `index`.',
        reason: '`index` property of `VirtualTimeScheduler` is only used internally and should ot be used.',
        implication: '@!TODO',
        exampleBefore: '@TODO',
        exampleAfter: '@TODO'
      }
    ],
    breakingChanges: []
  },
  {
    version: '7.0.0-test.99',
    date: '2019-11-18',
    deprecations: [
      {
        subject: 'TestScheduler',
        subjectApiSymbol: ApiSymbols.class,
        linkName: 'deprecation-class-TestScheduler-coldObservables',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/7.0.0-alpha.0/src/internal/testing/TestScheduler.ts#L44',
        type: 'deprecation',
        breakingVersion: '8',
        breakingLink: 'breakingChange-class-TestScheduler-coldObservables-private',
        headline: 'Class `TestScheduler` deprecate the public property `coldObservables`',
        reason: '@TODO `TestScheduler` deprecates public `coldObservables` property and makes it protected as it is and internal.',
        implication: '@!TODO',
        exampleBefore: '@TODO',
        exampleAfter: '@TODO'
      }
    ],
    breakingChanges: []
  },
  {
    version: '8.0.0.alpha.0',
    date: '2020-02-20',
    deprecations: [],
    breakingChanges: [
      {
        subject: 'concat',
        subjectApiSymbol: ApiSymbols.function,
        linkName: 'breakingChange-operator-concat-scheduler-removed',
        type: 'breakingChange',
        deprecationVersion: '7.0.0-alpha.0',
        deprecationLink: 'deprecation-operator-concat-scheduler',
        headline: 'Static `concat` method removed the `scheduler` argument'
      },
      {
        subject: 'of',
        subjectApiSymbol: ApiSymbols.function,
        linkName: 'breakingChange-static-of-scheduler-removed',
        type: 'breakingChange',
        deprecationVersion: '7.0.0-alpha.0',
        deprecationLink: 'deprecation-operator-of-scheduler',
        headline: 'Static `of` method removed the `scheduler` argument'
      },
      {
        subject: 'merge',
        subjectApiSymbol: ApiSymbols.function,
        linkName: 'breakingChange-static-merge-scheduler-removed',
        type: 'breakingChange',
        deprecationVersion: '7.0.0-alpha.0',
        deprecationLink: 'deprecation-operator-merge-scheduler',
        headline: 'Static `merge` method removed the `scheduler` argument'
      },
      {
        subject: 'startWith',
        subjectApiSymbol: ApiSymbols.function,
        linkName: 'breakingChange-operator-startWith-scheduler-removed',
        type: 'breakingChange',
        deprecationVersion: '7.0.0-alpha.0',
        deprecationLink: 'deprecation-operator-startWith-scheduler',
        headline: 'Static `startWith` method removed the `scheduler` argument'
      },
      {
        subject: 'endWith',
        subjectApiSymbol: ApiSymbols.function,
        linkName: 'breakingChange-operator-endWith-scheduler-removed',
        type: 'breakingChange',
        deprecationVersion: '7.0.0-alpha.0',
        deprecationLink: 'deprecation-operator-endWith-scheduler',
        headline: 'Static `endWith` method removed the `scheduler` argument'
      },
      {
        subject: 'TestScheduler',
        subjectApiSymbol: ApiSymbols.class,
        linkName: 'breakingChange-class-TestScheduler-hotObservables',
        type: 'breakingChange',
        deprecationVersion: '7.0.0-alpha.0',
        deprecationLink: 'deprecation-class-TestScheduler-hotObservables-private',
        headline: 'Class `TestScheduler` method made the `hotObservables` property private'
      },
      {
        subject: 'TestScheduler',
        subjectApiSymbol: ApiSymbols.class,
        linkName: 'breakingChange-class-TestScheduler-coldObservables',
        type: 'breakingChange',
        deprecationVersion: '7.0.0-alpha.0',
        deprecationLink: 'deprecation-class-TestScheduler-coldObservables-private',
        headline: 'Class `TestScheduler` method made the `coldObservables` property private'
      },
      {
        subject: 'VirtualTimeScheduler',
        subjectApiSymbol: ApiSymbols.class,
        linkName: 'breakingChange-class-VirtualTimeScheduler-breakingChange-frameTimeFactor',
        type: 'breakingChange',
        deprecationVersion: '7.0.0-alpha.0',
        deprecationLink: 'deprecation-class-VirtualTimeScheduler-breakingChange-frameTimeFactor',
        headline: 'Class `VirtualTimeScheduler` moved `frameTimeFactor` out of class.'
      },
      {
        subject: 'VirtualTimeScheduler',
        subjectApiSymbol: ApiSymbols.class,
        linkName: 'breakingChange-class-VirtualTimeScheduler-index-private',
        type: 'breakingChange',
        deprecationVersion: '7.0.0-alpha.0',
        deprecationLink: 'deprecation-class-VirtualTimeScheduler-breakingChange-frameTimeFactor',
        headline: 'Class `VirtualTimeScheduler` made `index` property private.'
      }
    ]
  }
];

// Info from: https://github.com/ReactiveX/rxjs/issues/3927
function getGeneralFlatteningHeadlinePhrase(operatorName: string): string {
  return `Static \`${operatorName}\` deprecated. Use static function \`${operatorName}\` instead.`;
}

// Info from: https://github.com/ReactiveX/rxjs/issues/3927
function getGeneralFlatteningReasonPhrase(operatorName: string): string {
  return `As \`${operatorName}\` operator is a name duplicate of the static
         function \`${operatorName}\` it gets deprecated.
         In future releases it will most probably be available under \`${operatorName}With\`.`;
}

// # RESULT SELECTOR ===
// ## Static
function getGeneralStaticResultSelectorHeadlinePhrase(operatorName: string): string {
  return `Static \`${operatorName}\` method deprecated the \`resultSelector\` argument`;
}

function getGeneralStaticResultSelectorReasonPhrase(operatorName: string): string {
  return `By removing the result selector from \`${operatorName}\` we get a smaller bundle since of the operator.
          Further the resultSelector was not that often used and the
          refactoring to use and internal \`map\` operation instead is a minor code change.`;
}

// ## Operator
function getGeneralOperatorResultSelectorHeadlinePhrase(operatorName: string): string {
  return `Operator \`${operatorName}\` method deprecated the \`resultSelector\` argument`;
}
/*
function toRefactoring(deprecation: Deprecation, version: string): string {
  return `
    Before Deprecation (< ${version})
    ${deprecation.exampleBefore}
    After Deprecation (>= ${version})
    ${deprecation.exampleBefore}
    `;
}
*/
