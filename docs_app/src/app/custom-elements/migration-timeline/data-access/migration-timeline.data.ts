import {ApiSymbols, MigrationReleaseItem} from './migration-timeline-struckture/interfaces';

/*
@TODO Consider:
- how to structure rollback of a deprecation?
https://github.com/ReactiveX/rxjs/issues/5107
 */

// @TODO => show migration scripts in the timeline
// @TODO => rxjs-compat intro and remove

export const deprecationAndBreakingChangeTimeline: MigrationReleaseItem[] = [
  {
    version: '6.0.0-alpha.3',
    date: '2018-02-09T17:06:57.961Z',
    deprecations: [
      {
        subject: 'last',
        subjectApiSymbol: ApiSymbols.argument,
        subjectAction: 'resultSelector',
        itemType: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-alpha.3/src/internal/operators/last.ts#L12',
        breakingChangeVersion: '6.0.0-alpha.4',
        breakingChangeSubjectAction: 'resultSelector-removed',
        deprecationMsgCode: getGeneralOperatorResultSelectorHeadlinePhrase('last'),
        reason: getGeneralStaticResultSelectorReasonPhrase('last'),
        implication: getResultSelectorGeneralImplication('last'),
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
        subjectApiSymbol: ApiSymbols.argument,
        subjectAction: 'resultSelector',
        itemType: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-alpha.3/src/internal/operators/first.ts#L18',
        breakingChangeVersion: '6.0.0-alpha.4',
        breakingChangeSubjectAction: 'resultSelector-removed',
        deprecationMsgCode: getGeneralOperatorResultSelectorHeadlinePhrase('first'),
        reason: getGeneralStaticResultSelectorReasonPhrase('first'),
        implication: getResultSelectorGeneralImplication('first'),
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
    date: '2018-03-13T19:00:55.397Z',
    deprecations: [],
    breakingChanges: [
      {
        subject: 'last',
        subjectApiSymbol: ApiSymbols.argument,
        subjectAction: 'resultSelector-removed',
        itemType: 'breakingChange',
        deprecationVersion: '6.0.0-alpha.3',
        deprecationSubjectAction: 'resultSelector',
        breakingChangeMsg: getResultSelectorGeneralBreakingChangeMsg('last')
      },
      {
        subject: 'first',
        subjectApiSymbol: ApiSymbols.argument,
        subjectAction: 'resultSelector-removed',
        itemType: 'breakingChange',
        deprecationVersion: '6.0.0-alpha.3',
        deprecationSubjectAction: 'resultSelector',
        breakingChangeMsg: getResultSelectorGeneralBreakingChangeMsg('first')
      }
    ]
  },
  {
    version: '6.0.0-beta.4',
    date: '2018-03-29T20:15:32.638Z',
    deprecations: [
      {
        subject: 'never',
        subjectApiSymbol: ApiSymbols.function,
        subjectAction: 'deprecated',
        itemType: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-beta.4/src/internal/observable/never.ts#L30',
        breakingChangeVersion: '8',
        breakingChangeSubjectAction: 'removed',
        deprecationMsgCode: 'use the NEVER constant instead',
        reason: 'Deprecated because it is more efficient?',
        implication: '@TODO',
        exampleBefore: `
          import { never } from 'rxjs';
          never();
        `,
        exampleAfter: `
          import { NEVER } from 'rxjs';
          NEVER;
        `
      },
      {
        subject: 'empty',
        subjectApiSymbol: ApiSymbols.function,
        subjectAction: 'deprecated',
        itemType: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-beta.4/src/internal/observable/empty.ts#L52',
        breakingChangeVersion: '7',
        breakingChangeSubjectAction: 'removed',
        deprecationMsgCode: 'use the EMPTY constant or scheduled([], scheduler) instead',
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
        subjectApiSymbol: ApiSymbols.argument,
        subjectAction: 'resultSelector',
        itemType: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-beta.4/src/internal/observable/dom/WebSocketSubject.ts#L16',
        breakingChangeVersion: '7',
        breakingChangeSubjectAction: 'deserializer-removed',
        deprecationMsgCode: 'use deserializer instead',
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
    breakingChanges: [],
  },
  {
    version: '6.0.0-rc.0',
    date: '2018-03-31T00:12:03.479Z',
    deprecations: [
      {
        subject: 'combineLatest',
        subjectApiSymbol: ApiSymbols.function,
        subjectAction: 'deprecated',
        itemType: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-rc.0/src/internal/operators/combineLatest.ts#L42',
        breakingChangeVersion: '7',
        breakingChangeSubjectAction: 'removed',
        deprecationMsgCode: getGeneralFlatteningHeadlinePhrase('combineLatest'),
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
        subjectAction: 'deprecated',
        itemType: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-rc.0/src/internal/operators/merge.ts#L37',
        breakingChangeVersion: '7',
        breakingChangeSubjectAction: 'removed',
        deprecationMsgCode: getGeneralFlatteningHeadlinePhrase('merge'),
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
        subjectAction: 'deprecated',
        itemType: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-rc.0/src/internal/operators/zip.ts#L37',
        breakingChangeVersion: '7',
        breakingChangeSubjectAction: 'removed',
        deprecationMsgCode: getGeneralFlatteningHeadlinePhrase('zip'),
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
        subjectAction: 'deprecated',
        itemType: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-rc.0/src/internal/operators/concat.ts#L25',
        breakingChangeVersion: '7',
        breakingChangeSubjectAction: 'removed',
        deprecationMsgCode: getGeneralFlatteningHeadlinePhrase('concat'),
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
        subjectApiSymbol: ApiSymbols.argument,
        subjectAction: 'resultSelector',
        itemType: 'deprecation',
        sourceLink: `https://github.com/ReactiveX/rxjs/blob/6.0.0-rc.0/src/internal/observable/zip.ts#L37`,
        breakingChangeVersion: '7',
        breakingChangeSubjectAction: 'resultSelector-removed',
        deprecationMsgCode: getGeneralStaticResultSelectorHeadlinePhrase('zip'),
        reason: getGeneralStaticResultSelectorReasonPhrase('zip'),
        implication: getResultSelectorGeneralImplication('zip'),
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
        subjectApiSymbol: ApiSymbols.argument,
        subjectAction: 'resultSelector',
        itemType: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-rc.0/src/internal/observable/fromEventPattern.ts#L9',
        breakingChangeVersion: '7',
        breakingChangeSubjectAction: 'resultSelector-removed',
        deprecationMsgCode: getGeneralStaticResultSelectorHeadlinePhrase('fromEventPattern'),
        reason: getGeneralStaticResultSelectorReasonPhrase('fromEventPattern'),
        implication: getResultSelectorGeneralImplication('fromEventPattern'),
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
        subjectApiSymbol: ApiSymbols.argument,
        subjectAction: 'resultSelector',
        itemType: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-rc.0/src/internal/observable/bindNodeCallback.ts#L10',
        breakingChangeVersion: '7',
        breakingChangeSubjectAction: 'resultSelector-removed',
        deprecationMsgCode: getGeneralStaticResultSelectorHeadlinePhrase('bindNodeCallback'),
        reason: getGeneralStaticResultSelectorReasonPhrase('bindNodeCallback'),
        implication: getResultSelectorGeneralImplication('bindNodeCallback'),
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
        subjectApiSymbol: ApiSymbols.argument,
        subjectAction: 'resultSelector',
        itemType: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-rc.0/src/internal/observable/bindCallback.ts#L10',
        breakingChangeVersion: '7',
        breakingChangeSubjectAction: 'resultSelector-removed',
        deprecationMsgCode: getGeneralStaticResultSelectorHeadlinePhrase('bindCallback'),
        reason: getGeneralStaticResultSelectorReasonPhrase('bindCallback'),
        implication: getResultSelectorGeneralImplication('bindCallback'),
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
        subjectApiSymbol: ApiSymbols.argument,
        subjectAction: 'resultSelector',
        itemType: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-rc.0/src/internal/observable/forkJoin.ts#L29',
        breakingChangeVersion: '7',
        breakingChangeSubjectAction: 'resultSelector-removed',
        deprecationMsgCode: getGeneralStaticResultSelectorHeadlinePhrase('forkJoin'),
        reason: getGeneralStaticResultSelectorReasonPhrase('forkJoin'),
        implication: getResultSelectorGeneralImplication('forkJoin'),
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
        subjectApiSymbol: ApiSymbols.argument,
        subjectAction: 'resultSelector',
        itemType: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-rc.0/src/internal/observable/fromEvent.ts#L32',
        breakingChangeVersion: '7',
        breakingChangeSubjectAction: 'resultSelector-removed',
        deprecationMsgCode: getGeneralStaticResultSelectorHeadlinePhrase('fromEvent'),
        reason: getGeneralStaticResultSelectorReasonPhrase('fromEvent'),
        implication: getResultSelectorGeneralImplication('fromEvent'),
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
        subjectApiSymbol: ApiSymbols.argument,
        subjectAction: 'resultSelector',
        itemType: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-rc.0/src/internal/operators/switchMap.ts#L16',
        breakingChangeVersion: '7',
        breakingChangeSubjectAction: 'resultSelector-removed',
        deprecationMsgCode: getGeneralOperatorResultSelectorHeadlinePhrase('switchMap'),
        reason: getGeneralStaticResultSelectorReasonPhrase('switchMap'),
        implication: getResultSelectorGeneralImplication('switchMap'),
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
        subjectApiSymbol: ApiSymbols.argument,
        subjectAction: 'resultSelector',
        itemType: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-rc.0/src/internal/operators/switchMapTo.ts#L15',
        breakingChangeVersion: '7',
        breakingChangeSubjectAction: 'resultSelector-removed',
        deprecationMsgCode: getGeneralOperatorResultSelectorHeadlinePhrase('switchMapTo'),
        reason: getGeneralStaticResultSelectorReasonPhrase('switchMapTo'),
        implication: getResultSelectorGeneralImplication('switchMapTo'),
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
        subjectApiSymbol: ApiSymbols.argument,
        subjectAction: 'resultSelector',
        itemType: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-rc.0/src/internal/operators/concatMap.ts#L8',
        breakingChangeVersion: '7',
        breakingChangeSubjectAction: 'resultSelector-removed',
        deprecationMsgCode: getGeneralOperatorResultSelectorHeadlinePhrase('concatMap'),
        reason: getGeneralStaticResultSelectorReasonPhrase('concatMap'),
        implication: getResultSelectorGeneralImplication('concatMap'),
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
        subjectApiSymbol: ApiSymbols.argument,
        subjectAction: 'resultSelector',
        itemType: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-rc.0/src/internal/operators/concatMapTo.ts#L8',
        breakingChangeVersion: '7',
        breakingChangeSubjectAction: 'resultSelector-removed',
        deprecationMsgCode: getGeneralOperatorResultSelectorHeadlinePhrase('concatMapTo'),
        reason: getGeneralStaticResultSelectorReasonPhrase('concatMapTo'),
        implication: getResultSelectorGeneralImplication('concatMapTo'),
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
        subjectApiSymbol: ApiSymbols.argument,
        subjectAction: 'resultSelector',
        itemType: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-rc.0/src/internal/operators/mergeMap.ts#L16',
        breakingChangeVersion: '7',
        breakingChangeSubjectAction: 'resultSelector-removed',
        deprecationMsgCode: getGeneralOperatorResultSelectorHeadlinePhrase('mergeMap'),
        reason: getGeneralStaticResultSelectorReasonPhrase('mergeMap'),
        implication: getResultSelectorGeneralImplication('mergeMap'),
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
        subjectApiSymbol: ApiSymbols.argument,
        subjectAction: 'resultSelector',
        itemType: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-rc.0/src/internal/operators/mergeMapTo.ts#L8',
        breakingChangeVersion: '7',
        breakingChangeSubjectAction: 'resultSelector-removed',
        deprecationMsgCode: getGeneralOperatorResultSelectorHeadlinePhrase('mergeMapTo'),
        reason: getGeneralStaticResultSelectorReasonPhrase('mergeMapTo'),
        implication: getResultSelectorGeneralImplication('mergeMapTo'),
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
        subjectApiSymbol: ApiSymbols.argument,
        subjectAction: 'resultSelector',
        itemType: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-rc.0/src/internal/operators/exhaustMap.ts#L16',
        breakingChangeVersion: '7',
        breakingChangeSubjectAction: 'resultSelector-removed',
        deprecationMsgCode: getGeneralOperatorResultSelectorHeadlinePhrase('exhaustMap'),
        reason: getGeneralStaticResultSelectorReasonPhrase('exhaustMap'),
        implication: getResultSelectorGeneralImplication('exhaustMap'),
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
    version: '6.0.0-rc.1',
    date: '2018-04-07T04:43:35.190Z',
    deprecations: [
      {
        subject: 'Observable',
        subjectApiSymbol: ApiSymbols.class,
        subjectAction: 'deprecated',
        itemType: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-rc.1/src/internal/Observable.ts#L260',
        breakingChangeVersion: '7',
        breakingChangeSubjectAction: 'property-if-removed',
        deprecationMsgCode: 'renamed - use iif instead',
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
        subjectAction: 'deprecated',
        itemType: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-rc.1/src/internal/Observable.ts#L265',
        breakingChangeVersion: '7',
        breakingChangeSubjectAction: 'property-throw-removed',
        deprecationMsgCode: 'renamed - use throwError instead',
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
    version: '6.0.0-tactical-rc.1',
    date: '2018-04-07T05:03:49.629Z',
    deprecations: [
      {
        subject: 'Scheduler',
        subjectApiSymbol: ApiSymbols.class,
        subjectAction: 'deprecated',
        itemType: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-tactical-rc.1/src/internal/Scheduler.ts#L20',
        breakingChangeVersion: '7',
        breakingChangeSubjectAction: 'removed',
        deprecationMsgCode: 'Class `Scheduler` deprecated in favor of Interface {@link SchedulerLike}',
        reason: 'create your own class and implement SchedulerLike instead',
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
    version: '6.2.0',
    date: '2018-05-22T04:52:34.571Z',
    deprecations: [
      {
        subject: 'race',
        subjectApiSymbol: ApiSymbols.function,
        subjectAction: 'deprecated',
        itemType: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.2.0/src/internal/operators/race.ts#L24',
        breakingChangeVersion: '7',
        breakingChangeSubjectAction: 'removed',
        deprecationMsgCode: 'use the static race instead',
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
    date: '2018-08-30T14:49:17.765Z',
    deprecations: [
      {
        subject: 'ObservableLike',
        subjectApiSymbol: ApiSymbols.interface,
        subjectAction: 'deprecated',
        itemType: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.3.0/src/internal/types.ts#L48',
        breakingChangeVersion: '8',
        breakingChangeSubjectAction: 'removed',
        deprecationMsgCode: 'use InteropObservable instead',
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
    date: '2019-01-30T03:50:24.313Z',
    deprecations: [
      {
        subject: 'Observable',
        subjectApiSymbol: ApiSymbols.argument,
        subjectAction: 'subscribe-next-callback',
        itemType: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.4.0/src/internal/Observable.ts#L74',
        breakingChangeVersion: '8',
        breakingChangeSubjectAction: 'subscribe-next-callback-removed',
        deprecationMsgCode: 'use an observer instead of separate callbacks',
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
        subject: 'Observable',
        subjectApiSymbol: ApiSymbols.argument,
        subjectAction: 'subscribe-error-callback',
        itemType: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.4.0/src/internal/Observable.ts#L76',
        breakingChangeVersion: '8',
        breakingChangeSubjectAction: 'subscribe-error-callback-removed',
        deprecationMsgCode: 'use an observer instead of separate callbacks',
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
        subject: 'Observable',
        subjectApiSymbol: ApiSymbols.argument,
        subjectAction: 'subscribe-complete-callback',
        itemType: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.4.0/src/internal/Observable.ts#L78',
        breakingChangeVersion: '8',
        breakingChangeSubjectAction: 'subscribe-complete-callback-removed',
        deprecationMsgCode: 'use an observer instead of separate callbacks',
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
        subjectApiSymbol: ApiSymbols.argument,
        subjectAction: 'subscribe-next-callback',
        itemType: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.4.0/src/internal/operators/tap.ts#L9',
        breakingChangeVersion: '8',
        breakingChangeSubjectAction: 'subscribe-next-callbacks-removed',
        deprecationMsgCode: 'use an observer instead of separate callbacks',
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
        subject: 'tap',
        subjectApiSymbol: ApiSymbols.argument,
        subjectAction: 'subscribe-error-callback',
        itemType: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.4.0/src/internal/operators/tap.ts#L11',
        breakingChangeVersion: '8',
        breakingChangeSubjectAction: 'subscribe-error-callbacks-removed',
        deprecationMsgCode: 'use an observer instead of separate callbacks',
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
        subject: 'tap',
        subjectApiSymbol: ApiSymbols.argument,
        subjectAction: 'subscribe-complete-callback',
        itemType: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.4.0/src/internal/operators/tap.ts#L13',
        breakingChangeVersion: '8',
        breakingChangeSubjectAction: 'subscribe-complete-callbacks-removed',
        deprecationMsgCode: 'use an observer instead of separate callbacks',
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
        subject: 'create',
        subjectApiSymbol: ApiSymbols.class,
        subjectAction: 'deprecated',
        itemType: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.4.0/src/internal/Observable.ts#L53',
        breakingChangeVersion: '8',
        breakingChangeSubjectAction: 'property-create-removed',
        deprecationMsgCode: 'use new Observable() instead',
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
        subjectAction: 'deprecated',
        itemType: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.4.0/src/internal/operators/timeInterval.ts#L69',
        breakingChangeVersion: '8',
        breakingChangeSubjectAction: 'removed',
        deprecationMsgCode: '@TODO',
        reason: `Class TimeInterval gets deprecated in favour of
         interface [TimeInterval](https://github.com/ReactiveX/rxjs/blob/6.5.3/src/internal/types.ts#L19-L22)`,
        implication: '@TODO',
        exampleBefore: `@TODO`,
        exampleAfter: `@TODO`
      }
    ],
    breakingChanges: []
  },
  {
    version: '6.5.0',
    date: '2019-04-23T02:55:47.108Z',
    deprecations: [
      {
        subject: 'from',
        subjectApiSymbol: ApiSymbols.argument,
        subjectAction: 'scheduler',
        itemType: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.5.0/src/internal/observable/from.ts#L7',
        breakingChangeVersion: '8',
        breakingChangeSubjectAction: 'scheduler-removed',
        deprecationMsgCode: 'use scheduled instead',
        reason: `@TODO`,
        implication: '@!TODO',
        exampleBefore: `
        import { from } from 'rxjs';
        from([1,2,3])
          .subscribe(
            (n) => console.log(n),
            (e) => console.log(e),
            ( ) => console.log('c')
          );
        `,
        exampleAfter: `
        import { scheduled } from 'rxjs';
        scheduled([1,2,3])
          .subscribe({
            next:     (n) => console.log(n),
            error:    (e) => console.log(e),
            complete: ( ) => console.log('c')
          });
        `
      },
      {
        subject: 'of',
        subjectApiSymbol: ApiSymbols.argument,
        subjectAction: 'scheduler',
        itemType: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.5.0/src/internal/observable/of.ts#L29',
        breakingChangeVersion: '8',
        breakingChangeSubjectAction: 'scheduler-removed',
        deprecationMsgCode: getOperatorGeneralSchedulerArgumentDeprecationPhrase(),
        reason: getSchedulerArgumentGeneralReason(),
        implication: getOperatorSchedulerGeneralImplication('of'),
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
        subjectApiSymbol: ApiSymbols.argument,
        subjectAction: 'scheduler',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.5.0/src/internal/observable/combineLatest.ts#L59',
        itemType: 'deprecation',
        breakingChangeVersion: '8',
        breakingChangeSubjectAction: 'scheduler-removed',
        deprecationMsgCode: getOperatorGeneralSchedulerArgumentDeprecationPhrase(),
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
        subjectApiSymbol: ApiSymbols.argument,
        subjectAction: 'resultSelector',
        itemType: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.5.0/src/internal/observable/combineLatest.ts#L43',
        breakingChangeVersion: '8',
        breakingChangeSubjectAction: 'resultSelector-removed',
        deprecationMsgCode: getGeneralStaticResultSelectorHeadlinePhrase('combineLatest'),
        reason: getGeneralStaticResultSelectorReasonPhrase('combineLatest'),
        implication: getResultSelectorGeneralImplication('combineLatest'),
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
        subjectAction: 'multiple-arguments',
        itemType: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.5.0/src/internal/observable/combineLatest.ts#L100',
        breakingChangeVersion: '8',
        breakingChangeSubjectAction: 'multiple-arguments-removed',
        deprecationMsgCode: 'pass arguments in a single array instead `combineLatest([a, b, c])`',
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
        subjectAction: 'multiple-arguments',
        itemType: 'deprecation',
        breakingChangeVersion: '8',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.5.0/src/internal/observable/forkJoin.ts#L22',
        breakingChangeSubjectAction: 'multiple-arguments-removed',
        deprecationMsgCode: 'Static `forkJoin` method arguments in an array instead of single arguments.',
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
        subjectAction: 'deprecated',
        itemType: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.5.0/src/internal/operators/partition.ts#L54',
        breakingChangeVersion: '8',
        breakingChangeSubjectAction: 'removed',
        deprecationMsgCode: 'use the static partition instead',
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
    date: '2019-04-23T03:39:56.746Z',
    deprecations: [
      {
        subject: 'NotificationKind',
        subjectApiSymbol: ApiSymbols.enum,
        subjectAction: 'deprecated',
        itemType: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.5.1/src/internal/Notification.ts#L10',
        breakingChangeVersion: '8',
        breakingChangeSubjectAction: 'removed',
        deprecationMsgCode: 'use a string literal instead of a const enum',
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
    date: '2019-09-18T14:02:25.345Z',
    deprecations: [
      {
        subject: 'concat',
        subjectApiSymbol: ApiSymbols.argument,
        subjectAction: 'scheduler',
        itemType: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/7.0.0-alpha.0/src/internal/observable/concat.ts#L17',
        breakingChangeVersion: '8',
        breakingChangeSubjectAction: 'scheduler-removed',
        deprecationMsgCode: getStaticGeneralSchedulerArgumentDeprecationPhrase('concatAll'),
        reason: getSchedulerArgumentGeneralReason(),
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
        subjectApiSymbol: ApiSymbols.argument,
        subjectAction: 'generic',
        itemType: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/7.0.0-alpha.0/src/internal/observable/of.ts#L35',
        breakingChangeVersion: '8',
        breakingChangeSubjectAction: 'generic-removed',
        deprecationMsgCode: 'do not use generic arguments directly, allow inference or assert with `as`',
        reason: '@TODO',
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
        subject: 'of',
        subjectApiSymbol: ApiSymbols.argument,
        subjectAction: 'scheduler',
        itemType: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/7.0.0-alpha.0/src/internal/observable/of.ts#L29',
        breakingChangeVersion: '8',
        breakingChangeSubjectAction: 'scheduler-removed',
        deprecationMsgCode: getStaticGeneralSchedulerArgumentDeprecationPhrase('of'),
        reason: getSchedulerArgumentGeneralReason(),
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
        subjectApiSymbol: ApiSymbols.argument,
        subjectAction: 'scheduler',
        itemType: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/7.0.0-alpha.0/src/internal/observable/merge.ts#L49',
        breakingChangeVersion: '8',
        breakingChangeSubjectAction: 'scheduler-removed',
        deprecationMsgCode: getStaticGeneralSchedulerArgumentDeprecationPhrase('merge'),
        reason: getSchedulerArgumentGeneralReason(),
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
        subjectApiSymbol: ApiSymbols.argument,
        subjectAction: 'scheduler',
        itemType: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/7.0.0-alpha.0/src/internal/operators/startWith.ts#L29',
        breakingChangeVersion: '8',
        breakingChangeSubjectAction: 'scheduler-removed',
        deprecationMsgCode: getStaticGeneralSchedulerArgumentDeprecationPhrase('concatAll'),
        reason: getSchedulerArgumentGeneralReason(),
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
        subjectApiSymbol: ApiSymbols.argument,
        subjectAction: 'scheduler',
        itemType: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/7.0.0-alpha.0/src/internal/operators/endWith.ts#L29',
        breakingChangeVersion: '8',
        breakingChangeSubjectAction: 'scheduler-removed',
        deprecationMsgCode: getStaticGeneralSchedulerArgumentDeprecationPhrase('concatAll'),
        reason: getSchedulerArgumentGeneralReason(),
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
        subjectAction: 'property-hotObservables',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/7.0.0-alpha.0/src/internal/testing/TestScheduler.ts#L39',
        itemType: 'deprecation',
        breakingChangeVersion: '8',
        breakingChangeSubjectAction: 'property-hotObservables-to-private',
        deprecationMsgCode: 'internal use only',
        reason: '@TODO `TestScheduler` deprecates public `hotObservables` property and makes it protected as it is internal.',
        implication: '@!TODO',
        exampleBefore: `@TODO`,
        exampleAfter: '@TODO'
      },
      {
        subject: 'TestScheduler',
        subjectApiSymbol: ApiSymbols.class,
        subjectAction: 'property-coldObservables',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/7.0.0-alpha.0/src/internal/testing/TestScheduler.ts#L44',
        itemType: 'deprecation',
        breakingChangeVersion: '8',
        breakingChangeSubjectAction: 'property-coldObservables-to-private',
        deprecationMsgCode: 'internal use only',
        reason: '@TODO `TestScheduler` deprecates public `coldObservables` property and makes it protected as it is and internal.',
        implication: '@!TODO',
        exampleBefore: '@TODO',
        exampleAfter: '@TODO'
      },
      {
        subject: 'VirtualTimeScheduler',
        subjectApiSymbol: ApiSymbols.class,
        subjectAction: 'property-frameTimeFactor',
        itemType: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/7.0.0-alpha.0/src/internal/scheduler/VirtualTimeScheduler.ts#L8',
        breakingChangeVersion: '8',
        breakingChangeSubjectAction: 'property-frameTimeFactor-moved',
        deprecationMsgCode: 'no longer used directly',
        reason: '`frameTimeFactor` is not used in `VirtualTimeScheduler` directly, therefore it does not belong here.',
        implication: '@!TODO',
        exampleBefore: '@TODO',
        exampleAfter: '@TODO'
      },
      {
        subject: 'VirtualTimeScheduler',
        subjectApiSymbol: ApiSymbols.class,
        subjectAction: 'property-index-to-private',
        itemType: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/7.0.0-alpha.0/src/internal/scheduler/VirtualTimeScheduler.ts#L23',
        breakingChangeVersion: '8',
        breakingChangeSubjectAction: 'breakingChange-class-VirtualTimeScheduler-index-private',
        deprecationMsgCode: 'internal use only',
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
    date: '2019-12-18T14:02:25.345Z',
    deprecations: [
      {
        subject: 'TestScheduler',
        subjectApiSymbol: ApiSymbols.class,
        subjectAction: 'property-coldObservables',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/7.0.0-alpha.0/src/internal/testing/TestScheduler.ts#L44',
        itemType: 'deprecation',
        breakingChangeVersion: '7.0.0-test.99',
        breakingChangeSubjectAction: 'property-coldObservables-to-private',
        deprecationMsgCode: 'Class `TestScheduler` deprecate the public property `coldObservables`',
        reason: '@TODO `TestScheduler` deprecates public `coldObservables` property and makes it protected as it is and internal.',
        implication: '@!TODO',
        exampleBefore: '@TODO',
        exampleAfter: '@TODO'
      }
    ],
    breakingChanges: [
      {
        subject: 'TestScheduler',
        subjectApiSymbol: ApiSymbols.class,
        subjectAction: 'property-coldObservables-to-private',
        itemType: 'breakingChange',
        deprecationVersion: '7.0.0-test.99',
        deprecationSubjectAction: 'property-coldObservables',
        breakingChangeMsg: 'Class `TestScheduler` changed property `coldObservables` to private'
      }
    ]
  },
  {
    version: '8.0.0',
    date: '2020-12-24T12:12:12.800Z',
    deprecations: [],
    breakingChanges: [
      {
        subject: 'never',
        subjectApiSymbol: ApiSymbols.function,
        subjectAction: 'removed',
        itemType: 'breakingChange',
        deprecationVersion: '6.0.0-beta.4',
        deprecationSubjectAction: 'deprecated',
        breakingChangeMsg: 'never is removed in favour of NEVER'
      },
      {
        subject: 'ObservableLike',
        subjectApiSymbol: ApiSymbols.interface,
        subjectAction: 'removed',
        itemType: 'breakingChange',
        deprecationVersion: '6.3.0',
        deprecationSubjectAction: 'deprecated',
        breakingChangeMsg: getGeneralSchedulerArgumentBreakingChangePhrase()
      },
      {
        subject: 'concat',
        subjectApiSymbol: ApiSymbols.argument,
        subjectAction: 'scheduler-removed',
        itemType: 'breakingChange',
        deprecationVersion: '7.0.0-alpha.0',
        deprecationSubjectAction: 'scheduler',
        breakingChangeMsg: getGeneralSchedulerArgumentBreakingChangePhrase()
      },
      {
        subject: 'of',
        subjectApiSymbol: ApiSymbols.argument,
        subjectAction: 'scheduler-removed',
        itemType: 'breakingChange',
        deprecationVersion: '7.0.0-alpha.0',
        deprecationSubjectAction: 'scheduler',
        breakingChangeMsg: getGeneralSchedulerArgumentBreakingChangePhrase()
      },
      {
        subject: 'merge',
        subjectApiSymbol: ApiSymbols.argument,
        subjectAction: 'scheduler-removed',
        itemType: 'breakingChange',
        deprecationVersion: '7.0.0-alpha.0',
        deprecationSubjectAction: 'scheduler',
        breakingChangeMsg: getGeneralSchedulerArgumentBreakingChangePhrase()
      },
      {
        subject: 'startWith',
        subjectApiSymbol: ApiSymbols.argument,
        subjectAction: 'scheduler-removed',
        itemType: 'breakingChange',
        deprecationVersion: '7.0.0-alpha.0',
        deprecationSubjectAction: 'scheduler',
        breakingChangeMsg: getGeneralSchedulerArgumentBreakingChangePhrase()
      },
      {
        subject: 'endWith',
        subjectApiSymbol: ApiSymbols.argument,
        subjectAction: 'scheduler-removed',
        itemType: 'breakingChange',
        deprecationVersion: '7.0.0-alpha.0',
        deprecationSubjectAction: 'scheduler',
        breakingChangeMsg: getGeneralSchedulerArgumentBreakingChangePhrase()
      },
      {
        subject: 'TestScheduler',
        subjectApiSymbol: ApiSymbols.class,
        subjectAction: 'property-hotObservables-to-private',
        itemType: 'breakingChange',
        deprecationVersion: '7.0.0-alpha.0',
        deprecationSubjectAction: 'property-hotObservables',
        breakingChangeMsg: 'Class `TestScheduler` method made the `hotObservables` property private'
      },
      {
        subject: 'TestScheduler',
        subjectApiSymbol: ApiSymbols.class,
        subjectAction: 'property-coldObservables-to-private',
        itemType: 'breakingChange',
        deprecationVersion: '7.0.0-alpha.0',
        deprecationSubjectAction: 'property-coldObservables',
        breakingChangeMsg: 'Class `TestScheduler` method made the `coldObservables` property private'
      },
      {
        subject: 'VirtualTimeScheduler',
        subjectApiSymbol: ApiSymbols.class,
        subjectAction: 'moved-frameTimeFactor',
        itemType: 'breakingChange',
        deprecationVersion: '7.0.0-alpha.0',
        deprecationSubjectAction: 'property-frameTimeFactor',
        breakingChangeMsg: 'Class `VirtualTimeScheduler` moved `frameTimeFactor` out of class.'
      },
      {
        subject: 'VirtualTimeScheduler',
        subjectApiSymbol: ApiSymbols.class,
        subjectAction: 'property-index-to-private',
        itemType: 'breakingChange',
        deprecationVersion: '7.0.0-alpha.0',
        deprecationSubjectAction: 'property-frameTimeFactor',
        breakingChangeMsg: 'Class `VirtualTimeScheduler` made `index` property private.'
      }
    ]
  }
];


// SCHEDULER ARGUMENT
function getStaticGeneralSchedulerArgumentDeprecationPhrase(operatorName: string) {
  return `use scheduled and ${operatorName} instead of passing a scheduler`;
}

function getOperatorGeneralSchedulerArgumentDeprecationPhrase() {
  return `use subscribeOn and/or observeOn instead of passing a scheduler`;
}

function getGeneralSchedulerArgumentBreakingChangePhrase() {
  return `scheduler argument removed`;
}

function getSchedulerArgumentGeneralReason(): string {
  return `The scheduler argument rather will be used only where appropriate.
          A lot of operators include optional scheduler parameters,
          that means that the implementation needs to check for a scheduler, which
          imports the scheduling logic and prevents it from being tree-shaken.`;
}

// OPR
function getOperatorSchedulerGeneralImplication(opr: string): string {
  return `For ${opr}, the removal of the scheduler parameter means that if callers
  want notifications to be scheduled, they will have to use observeOn`;
}

// -----------------------------

// NAME DUPLICATE

// Info from: https://github.com/ReactiveX/rxjs/issues/3927
function getGeneralFlatteningHeadlinePhrase(operatorName: string): string {
  return `use the static ${operatorName} instead`;
}

// Info from: https://github.com/ReactiveX/rxjs/issues/3927
function getGeneralFlatteningReasonPhrase(operatorName: string): string {
  return `As \`${operatorName}\` operator is a name duplicate of the static
         function \`${operatorName}\` it gets deprecated.
         In future releases it will most probably be available under \`${operatorName}With\`.`;
}

// RESULT_SELECTOR

function getResultSelectorGeneralBreakingChangeMsg(opr: string): string {
  return `Operator \`${opr}\` method removed the \`resultSelector\` argument`;
}

function getResultSelectorGeneralImplication(opr: string): string {
  return `For ${opr}, the removal of the resultSelector argument means that if callers want to
   perform a projection, they will have to use map`;
}


// Static
function getGeneralStaticResultSelectorHeadlinePhrase(operatorName: string): string {
  return `use the map operator instead of a result selector`;
}

function getGeneralStaticResultSelectorReasonPhrase(operatorName: string): string {
  return `By removing the result selector from \`${operatorName}\` we get a smaller bundle since of the operator.
          Further the resultSelector was not that often used and the
          refactoring to use and internal \`map\` operation instead is a minor code change.`;
}

// Operator
function getGeneralOperatorResultSelectorHeadlinePhrase(operatorName: string): string {
  return `use the map operator, on the inner observable, instead of a result selector`;
}
