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
      /*@NOTE Deprecation not documented*/
      {
        subject: 'last',
        subjectApiSymbol: ApiSymbols.argument,
        subjectAction: 'resultSelector',
        itemType: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-alpha.3/src/internal/operators/last.ts#L12',
        breakingChangeVersion: '6.0.0-alpha.4',
        breakingChangeSubjectAction: 'resultSelector-removed',
        deprecationMsgCode: getOperatorResultSelectorDeprecationMsgCode('last'),
        reason: getResultSelectorReason('last'),
        implication: getCreationResultSelectorImplication('last'),
        exampleBefore: `
        import { Observable } from 'rxjs';
        import { last } from 'rxjs/operator';

        const resultSelector = (n, i) => n;
        const source = Observable.of(1,2,3)
            .last((n) => n > 0, resultSelector);
        source.subscribe((n) => console.log(n));
        `,
        exampleAfter: `
        import { Observable, of } from 'rxjs';
        import { last, map } from 'rxjs/operators';

        const resultSelector = (n, i) => n;
        const source = of(1,2,3)
        .pipe(
          last((n) => n > 0),
          map(resultSelector)
        );
        source.subscribe((n) => console.log(n));
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
        deprecationMsgCode: getOperatorResultSelectorDeprecationMsgCode('first'),
        reason: getResultSelectorReason('first'),
        implication: getCreationResultSelectorImplication('first'),
        exampleBefore: `
        import { Observable } from 'rxjs';
        import { first } from 'rxjs/operator';

        const resultSelector = (n, i) => n;
        const source = Observable.of(1,2,3)
            .first((n) => n > 0, resultSelector);
        source.subscribe((n) => console.log(n));
        `,
        exampleAfter: `
        import { Observable, of } from 'rxjs';
        import { first, map } from 'rxjs/operators';

        const resultSelector = (n, i) => n;
        const source = of(1,2,3)
        .pipe(
          last((n) => n > 0),
          map(resultSelector)
        );
        source.subscribe((n) => console.log(n));
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
        breakingChangeMsg: getResultSelectorBreakingChangeMsg('last')
      },
      {
        subject: 'first',
        subjectApiSymbol: ApiSymbols.argument,
        subjectAction: 'resultSelector-removed',
        itemType: 'breakingChange',
        deprecationVersion: '6.0.0-alpha.3',
        deprecationSubjectAction: 'resultSelector',
        breakingChangeMsg: getResultSelectorBreakingChangeMsg('first')
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
        reason: getFunctionToStaticReason('never'),
        implication: getFunctionToStaticImplication('never', 'NEVER'),
        exampleBefore: `
        import { never } from 'rxjs';

        const source = never();
        source.subscribe((n) => console.log(n));
        `,
        exampleAfter: `
        import { NEVER } from 'rxjs';

        const source = NEVER;
        source.subscribe((n) => console.log(n));
        `
      },
      {
        subject: 'empty',
        subjectApiSymbol: ApiSymbols.function,
        subjectAction: 'deprecated',
        itemType: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-beta.4/src/internal/observable/empty.ts#L52',
        breakingChangeVersion: '8',
        breakingChangeSubjectAction: 'removed',
        deprecationMsgCode: 'use the EMPTY constant instead',
        reason: getFunctionToStaticReason('empty'),
        implication: getFunctionToStaticImplication('empty', 'EMPTY'),
        exampleBefore: `
          import { empty } from 'rxjs';

          const source = empty();
          source.subscribe((n) => console.log(n));
        `,
        exampleAfter: `
          import {EMPTY} from 'rxjs';

          const source = EMPTY;
          source.subscribe((n) => console.log(n));
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
        subject: 'fromEventPattern',
        subjectApiSymbol: ApiSymbols.argument,
        subjectAction: 'resultSelector',
        itemType: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-rc.0/src/internal/observable/fromEventPattern.ts#L9',
        breakingChangeVersion: '7',
        breakingChangeSubjectAction: 'resultSelector-removed',
        deprecationMsgCode: getCreationResultSelectorDeprecationMsgCode('fromEventPattern'),
        reason: getResultSelectorReason('fromEventPattern'),
        implication: getCreationResultSelectorImplication('fromEventPattern'),
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
        subject: 'fromEvent',
        subjectApiSymbol: ApiSymbols.argument,
        subjectAction: 'resultSelector',
        itemType: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-rc.0/src/internal/observable/fromEvent.ts#L32',
        breakingChangeVersion: '7',
        breakingChangeSubjectAction: 'resultSelector-removed',
        deprecationMsgCode: getCreationResultSelectorDeprecationMsgCode('fromEvent'),
        reason: getResultSelectorReason('fromEvent'),
        implication: getCreationResultSelectorImplication('fromEvent'),
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
        subject: 'bindNodeCallback',
        subjectApiSymbol: ApiSymbols.argument,
        subjectAction: 'resultSelector',
        itemType: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-rc.0/src/internal/observable/bindNodeCallback.ts#L10',
        breakingChangeVersion: '7',
        breakingChangeSubjectAction: 'resultSelector-removed',
        deprecationMsgCode: getCreationResultSelectorDeprecationMsgCode('bindNodeCallback'),
        reason: getResultSelectorReason('bindNodeCallback'),
        implication: getCreationResultSelectorImplication('bindNodeCallback'),
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
        deprecationMsgCode: getCreationResultSelectorDeprecationMsgCode('bindCallback'),
        reason: getResultSelectorReason('bindCallback'),
        implication: getCreationResultSelectorImplication('bindCallback'),
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
        deprecationMsgCode: getCreationResultSelectorDeprecationMsgCode('forkJoin'),
        reason: getResultSelectorReason('forkJoin'),
        implication: getCreationResultSelectorImplication('forkJoin'),
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
        subject: 'combineLatest',
        subjectApiSymbol: ApiSymbols.function,
        subjectAction: 'deprecated',
        itemType: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-rc.0/src/internal/operators/combineLatest.ts#L42',
        breakingChangeVersion: '7',
        breakingChangeSubjectAction: 'removed',
        deprecationMsgCode: getNameDupleOperatorDeprecationMsgCode('combineLatest'),
        reason: getNameDupleOperatorReason('combineLatest'),
        implication: getNameDupleOperatorImplication('combineLatest', 'combineLatest'),
        exampleBefore: `
        import { of } from 'rxjs';
        import { combineLatest } from 'rxjs/operators';

        const a = of('1');
        const b = of('2');
        const source = a
          .pipe(combineLatest(b));
        source.subscribe(n => console.log(n));
        `,
        exampleAfter: `
          import { of, combineLatest } from 'rxjs';

          const a = of('1');
          const b = of('2');
          const source = combineLatest(a, b);
          source.subscribe(n => console.log(n));
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
        deprecationMsgCode: getNameDupleOperatorDeprecationMsgCode('merge'),
        reason: getNameDupleOperatorReason('merge'),
        implication: getNameDupleOperatorImplication('merge', 'merge'),
        exampleBefore: `
        import { of } from 'rxjs';
        import { merge } from 'rxjs/operators';

        const a = of('1');
        const b = of('2');
        const source = a
          .pipe(merge(b));
        source.subscribe(n => console.log(n));
        `,
        exampleAfter: `
          import { of, merge } from 'rxjs';

          const a = of('1');
          const b = of('2');
          const source = merge(a, b);
          source.subscribe(n => console.log(n));
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
        deprecationMsgCode: getNameDupleOperatorDeprecationMsgCode('zip'),
        reason: getNameDupleOperatorReason('zip'),
        implication: getNameDupleOperatorImplication('zip', 'zip'),
        exampleBefore: `
        import { of } from 'rxjs';
        import { zip } from 'rxjs/operators';

        const a = of('1');
        const b = of('2');
        const source = a
          .pipe(zip(b));
        source.subscribe(n => console.log(n));
        `,
        exampleAfter: `
          import { of, zip } from 'rxjs';

          const a = of('1');
          const b = of('2');
          const source = zip(a, b);
          source.subscribe(n => console.log(n));
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
        deprecationMsgCode: getNameDupleOperatorDeprecationMsgCode('concat'),
        reason: getNameDupleOperatorReason('concat'),
        implication: getNameDupleOperatorImplication('concat', 'concat'),
        exampleBefore: `
        import { of } from 'rxjs';
        import { concat } from 'rxjs/operators';

        const a = of('1');
        const b = of('2');
        const source = a
          .pipe(concat(b));
        source.subscribe(n => console.log(n));
        `,
        exampleAfter: `
          import { of, concat } from 'rxjs';

          const a = of('1');
          const b = of('2');
          const source = concat(a, b);
          source.subscribe(n => console.log(n));
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
        deprecationMsgCode: getCreationResultSelectorDeprecationMsgCode('zip'),
        reason: getResultSelectorReason('zip'),
        implication: getCreationResultSelectorImplication('zip'),
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
        subject: 'switchMap',
        subjectApiSymbol: ApiSymbols.argument,
        subjectAction: 'resultSelector',
        itemType: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-rc.0/src/internal/operators/switchMap.ts#L16',
        breakingChangeVersion: '7',
        breakingChangeSubjectAction: 'resultSelector-removed',
        deprecationMsgCode: getOperatorResultSelectorDeprecationMsgCode('switchMap'),
        reason: getResultSelectorReason('switchMap'),
        implication: getCreationResultSelectorImplication('switchMap'),
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
        deprecationMsgCode: getOperatorResultSelectorDeprecationMsgCode('switchMapTo'),
        reason: getResultSelectorReason('switchMapTo'),
        implication: getCreationResultSelectorImplication('switchMapTo'),
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
        deprecationMsgCode: getOperatorResultSelectorDeprecationMsgCode('concatMap'),
        reason: getResultSelectorReason('concatMap'),
        implication: getCreationResultSelectorImplication('concatMap'),
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
        deprecationMsgCode: getOperatorResultSelectorDeprecationMsgCode('concatMapTo'),
        reason: getResultSelectorReason('concatMapTo'),
        implication: getCreationResultSelectorImplication('concatMapTo'),
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
        deprecationMsgCode: getOperatorResultSelectorDeprecationMsgCode('mergeMap'),
        reason: getResultSelectorReason('mergeMap'),
        implication: getCreationResultSelectorImplication('mergeMap'),
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
        deprecationMsgCode: getOperatorResultSelectorDeprecationMsgCode('mergeMapTo'),
        reason: getResultSelectorReason('mergeMapTo'),
        implication: getCreationResultSelectorImplication('mergeMapTo'),
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
        deprecationMsgCode: getOperatorResultSelectorDeprecationMsgCode('exhaustMap'),
        reason: getResultSelectorReason('exhaustMap'),
        implication: getCreationResultSelectorImplication('exhaustMap'),
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
    version: '6.1.0',
    date: '2018-05-03T18:15:54.101Z',
    deprecations: [
      {
        subject: 'ObservableLike',
        subjectApiSymbol: ApiSymbols.interface,
        subjectAction: 'deprecated',
        itemType: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.1.0/src/internal/types.ts#L49',
        breakingChangeVersion: '8',
        breakingChangeSubjectAction: 'removed',
        deprecationMsgCode: 'use InteropObservable instead',
        reason: `This interface is only here to provide
         the 'Symbol.observable' and therefore internal.`,
        implication: 'The deprecation of ObservableLike means the user have to use InteropObservable instead.',
        exampleBefore: `
        import { ObservableLike } from 'rxjs';
        let o: ObservableLike<number>;
        `,
        exampleAfter: `
        import { InteropObservable } from 'rxjs';
        let o: InteropObservable<number>;
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
        deprecationMsgCode: getNameDupleOperatorDeprecationMsgCode('race'),
        reason: getNameDupleOperatorReason('race'),
        implication: getNameDupleOperatorImplication('race', 'race'),
        exampleBefore: `
                  import { of } from 'rxjs';
                  import { race } from 'rxjs/operators';

                  const a = of('1');
                  const b = of('2');
                  const source = a
                    .pipe(race(b));
                  source.subscribe(n => console.log(n));
                `,
        exampleAfter: `
                  import { of, race } from 'rxjs';

                  const a = of('1');
                  const b = of('2');
                  const source = race(a, b);
                  source.subscribe(n => console.log(n));
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
        deprecationMsgCode: getCreationGeneralSchedulerArgumentDeprecationPhrase(),
        reason: getSchedulerArgumentGeneralReason(),
        implication: getCreationSchedulerGeneralImplication('of'),
        exampleBefore: `
        import { of, asyncScheduler } from 'rxjs';

        const a = of('1', asyncScheduler);
        const source = a;
        source.subscribe((n) => console.log(n));
        console.log('logs before observer');
        `,
        exampleAfter: `
        import { of, asyncScheduler } from 'rxjs';
        import { observeOn } from 'rxjs/operators';

        const a = of('1');
        const source = a
        .pipe(
          observeOn(asyncScheduler)
        );
        source.subscribe((n) => console.log(n));
        console.log('logs before observer');
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
        deprecationMsgCode: getCreationGeneralSchedulerArgumentDeprecationPhrase(),
        reason: getSchedulerArgumentGeneralReason(),
        implication: getCreationSchedulerGeneralImplication('combineLatest'),
        exampleBefore: `
        import { of, combineLatest, asyncScheduler } from 'rxjs';

        const a = of('1');
        const b = of('2');
        const source = combineLatest(a, b, asyncScheduler);
        source.subscribe((n) => console.log(n));
        console.log('logs before observer');
        `,
        exampleAfter: `
        import { of, combineLatest, asyncScheduler } from 'rxjs';
        import { observeOn } from 'rxjs/operators';

        const a = of('1');
        const b = of('2');
        const source = combineLatest(a, b)
        .pipe(
          observeOn(asyncScheduler)
        );
        source.subscribe((n) => console.log(n));
        console.log('logs before observer');
        `
      },
      {
        subject: 'combineLatest',
        subjectApiSymbol: ApiSymbols.argument,
        subjectAction: 'resultSelector',
        itemType: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.5.0/src/internal/observable/combineLatest.ts#L43',
        breakingChangeVersion: '7',
        breakingChangeSubjectAction: 'resultSelector-removed',
        deprecationMsgCode: getCreationResultSelectorDeprecationMsgCode('combineLatest'),
        reason: getResultSelectorReason('combineLatest'),
        implication: getCreationResultSelectorImplication('combineLatest'),
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
        deprecationMsgCode: getCreationGeneralSchedulerArgumentDeprecationPhrase(),
        reason: getSchedulerArgumentGeneralReason(),
        implication: getCreationSchedulerGeneralImplication('concat'),
        exampleBefore: `
        import { of, concat, asyncScheduler } from 'rxjs';

        const a = of('1');
        const b = of('2');
        const source = concat(a, b, asyncScheduler);
        source.subscribe((n) => console.log(n));
        console.log('logs before observer');
        `,
        exampleAfter: `
        import { of, concat, asyncScheduler } from 'rxjs';
        import { observeOn } from 'rxjs/operators';

        const a = of('1');
        const b = of('2');
        const source = concat(a, b)
        .pipe(
          observeOn(asyncScheduler)
        );
        source.subscribe((n) => console.log(n));
        console.log('logs before observer');
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
        deprecationMsgCode: getCreationGeneralSchedulerArgumentDeprecationPhrase(),
        reason: getSchedulerArgumentGeneralReason(),
        implication: `For of, the removal of the scheduler parameter means that if callers
         want notifications to be scheduled, they will have to move the values
         into the scheduled operator and apply the used scheduler there.`,
        exampleBefore: `
        import { of, asyncScheduler } from 'rxjs';

        const a = of('1', asyncScheduler);
        const source = a;
        source.subscribe((n) => console.log(n));
        console.log('logs before observer');
        `,
        exampleAfter: `
        import { scheduled, asyncScheduler } from 'rxjs';

        const a = scheduled(['1'], asyncScheduler);
        const source = a;
        source.subscribe((n) => console.log(n));
        console.log('logs before observer');
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
        deprecationMsgCode: getCreationGeneralSchedulerArgumentDeprecationPhrase(),
        reason: getSchedulerArgumentGeneralReason(),
        implication: getCreationSchedulerGeneralImplication('merge'),
        exampleBefore: `
        import { of, merge, asyncScheduler } from 'rxjs';

        const a = of('1');
        const b = of('2');
        const source = merge(a, b, asyncScheduler);
        source.subscribe((n) => console.log(n));
        console.log('logs before observer');
        `,
        exampleAfter: `
        import { of, merge, asyncScheduler } from 'rxjs';
        import { observeOn } from 'rxjs/operators';

        const a = of('1');
        const b = of('2');
        const source = merge(a, b)
        .pipe(
          observeOn(asyncScheduler)
        );
        source.subscribe((n) => console.log(n));
        console.log('logs before observer');
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
        deprecationMsgCode: getOperatorGeneralSchedulerArgumentDeprecationPhrase('startWith', 'concatAll'),
        reason: getSchedulerArgumentGeneralReason(),
        implication: getOperatorSchedulerGeneralImplication('startWith'),
        exampleBefore: `
        import { of, asyncScheduler } from 'rxjs';
        import { startWith } from 'rxjs/operators';

        const a = of('1');
        const source = a
          .pipe(
            startWith(0, asyncScheduler)
          )
          .subscribe((n) => console.log(n));
          console.log('logs before observer');
        `,
        exampleAfter: `
        import { of, scheduled, asyncScheduler } from 'rxjs';
        import { concatAll } from 'rxjs/operators';

        const a = of('1');
        const source = concat(scheduled([0], asyncScheduler), a);
        source.subscribe((n) => console.log(n));
        console.log('logs before observer');
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
        deprecationMsgCode: getOperatorGeneralSchedulerArgumentDeprecationPhrase('endWith', 'concatAll'),
        reason: getSchedulerArgumentGeneralReason(),
        implication: getOperatorSchedulerGeneralImplication('endWith'),
        exampleBefore: `
        import { of, asyncScheduler } from 'rxjs';
        import { endWith } from 'rxjs/operators';

        const a = of('1');
        const source = a
          .pipe(
            endWith(0, asyncScheduler)
          )
          .subscribe((n) => console.log(n));
        console.log('logs before observer');
        `,
        exampleAfter: `
        import { of, concat, scheduled, asyncScheduler } from 'rxjs';
        import { concatAll } from 'rxjs/operators';

        const a = of('1');
        const source = concat(a, scheduled([0], asyncScheduler));
        source.subscribe((n) => console.log(n));
        console.log('logs before observer');
        `
      },
      {
        subject: 'TestScheduler',
        subjectApiSymbol: ApiSymbols.property,
        subjectAction: 'hotObservables-deprecated',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/7.0.0-alpha.0/src/internal/testing/TestScheduler.ts#L39',
        itemType: 'deprecation',
        breakingChangeVersion: '8',
        breakingChangeSubjectAction: 'hotObservables-to-private',
        deprecationMsgCode: 'it is meant to be used only internally',
        reason: 'TestScheduler deprecates public hotObservables property and makes it protected as it is meant to be used only internally.',
        implication: `The deprecation of the property hotObservables in TestScheduler means
        the caller uses parts that should not be used outside.`,
        exampleBefore: `
        import { scheduled } from 'rxjs';
        import { TestScheduler} from 'rxjs/testing';

        const testScheduler = new TestScheduler((a, b) => a === b);
        const a = scheduled([1], testScheduler);
        const source = a
        source.subscribe((n) => console.log(n));
        console.log('Usage of internal hotObservables:', testScheduler.hotObservables);
        console.log('logs only when flush');
        testScheduler.flush();
        `,
        exampleAfter: `
        import { scheduled } from 'rxjs';
        import { TestScheduler} from 'rxjs/testing';

        const testScheduler = new TestScheduler((a, b) => a === b);
        const a = scheduled([1], testScheduler);
        const source = a
        source.subscribe((n) => console.log(n));

        console.log('logs only when flush');
        testScheduler.flush();
        `
      },
      {
        subject: 'TestScheduler',
        subjectApiSymbol: ApiSymbols.property,
        subjectAction: 'coldObservables-deprecated',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/7.0.0-alpha.0/src/internal/testing/TestScheduler.ts#L44',
        itemType: 'deprecation',
        breakingChangeVersion: '8',
        breakingChangeSubjectAction: 'coldObservables-to-private',
        deprecationMsgCode: 'it is meant to be used only internally',
        reason: `TestScheduler deprecates public coldObservables
        property and makes it protected as it is meant to be used only internally.`,
        implication: `The deprecation of the property coldObservables in TestScheduler means
        the caller uses internal parts that should not be used outside.`,
        exampleBefore: `
        import { scheduled } from 'rxjs';
        import { TestScheduler} from 'rxjs/testing';

        const testScheduler = new TestScheduler((a, b) => a === b);
        const a = scheduled([1], testScheduler);
        const source = a
        source.subscribe((n) => console.log(n));
        console.log('Usage of internal coldObservables:', testScheduler.coldObservables);
        console.log('logs only when flush');
        testScheduler.flush();
        `,
        exampleAfter: `
        import { scheduled } from 'rxjs';
        import { TestScheduler} from 'rxjs/testing';

        const testScheduler = new TestScheduler((a, b) => a === b);
        const a = scheduled([1], testScheduler);
        const source = a
        source.subscribe((n) => console.log(n));

        console.log('logs only when flush');
        testScheduler.flush();
        `
      },
      {
        subject: 'VirtualTimeScheduler',
        subjectApiSymbol: ApiSymbols.property,
        subjectAction: 'frameTimeFactor-deprecated',
        itemType: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/7.0.0-alpha.0/src/internal/scheduler/VirtualTimeScheduler.ts#L8',
        breakingChangeVersion: '8',
        breakingChangeSubjectAction: 'frameTimeFactor-moved',
        deprecationMsgCode: 'it is no longer used directly',
        reason: 'frameTimeFactor is not used in VirtualTimeScheduler directly. Therefore it does not belong here.',
        implication: 'Property frameTimeFactor is deprecated because it moved to a different place. ',
        exampleBefore: `
        import { VirtualTimeScheduler } from 'rxjs';

        console.log('Usage of internal static frameTimeFactor:', VirtualTimeScheduler.frameTimeFactor);
        console.log('Usage of class:', VirtualTimeScheduler);
        `,
        exampleAfter: `
        import { VirtualTimeScheduler } from 'rxjs';

        console.log('Usage of class:', VirtualTimeScheduler);
        `
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
        implication: `The deprecation of the property index in VirtualTimeScheduler means the caller
        uses internal parts that should not be used outside.`,
        exampleBefore: `
        import { scheduled, VirtualTimeScheduler } from 'rxjs';

        const vTimeScheduler = new VirtualTimeScheduler();
        const a = scheduled([1], vTimeScheduler);
        const source = a
        source.subscribe((n) => console.log(n));
        console.log('Usage of internal index:', vTimeScheduler.index);
        console.log('logs only when flush');
        vTimeScheduler.flush();
        `,
        exampleAfter: `
        import { scheduled, VirtualTimeScheduler } from 'rxjs';

        const vTimeScheduler = new VirtualTimeScheduler();
        const a = scheduled([1], vTimeScheduler);
        const source = a
        source.subscribe((n) => console.log(n));

        console.log('logs only when flush');
        vTimeScheduler.flush();
        `
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
        subjectApiSymbol: ApiSymbols.property,
        subjectAction: 'coldObservables-to-private',
        itemType: 'breakingChange',
        deprecationVersion: '7.0.0-test.99',
        deprecationSubjectAction: 'coldObservables-deprecated',
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
        subject: 'combineLatest',
        subjectApiSymbol: ApiSymbols.function,
        subjectAction: 'removed',
        itemType: 'breakingChange',
        deprecationVersion: '6.0.0-rc.0',
        deprecationSubjectAction: 'deprecated',
        breakingChangeMsg: 'Operator combineLatest removed'
      },
      {
        subject: 'merge',
        subjectApiSymbol: ApiSymbols.function,
        subjectAction: 'removed',
        itemType: 'breakingChange',
        deprecationVersion: '6.0.0-rc.0',
        deprecationSubjectAction: 'deprecated',
        breakingChangeMsg: 'Operator merge removed'
      },
      {
        subject: 'zip',
        subjectApiSymbol: ApiSymbols.function,
        subjectAction: 'removed',
        deprecationVersion: '6.0.0-rc.0',
        itemType: 'breakingChange',
        deprecationSubjectAction: 'deprecated',
        breakingChangeMsg: 'Operator zip removed'
      },
      {
        subject: 'concat',
        subjectApiSymbol: ApiSymbols.function,
        subjectAction: 'removed',
        deprecationVersion: '6.0.0-rc.0',
        itemType: 'breakingChange',
        deprecationSubjectAction: 'deprecated',
        breakingChangeMsg: 'Operator concat removed'
      },
      {
        subject: 'race',
        subjectApiSymbol: ApiSymbols.function,
        subjectAction: 'removed',
        deprecationVersion: '6.2.0',
        itemType: 'breakingChange',
        deprecationSubjectAction: 'deprecated',
        breakingChangeMsg: 'Operator race removed'
      },
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
        subject: 'empty',
        subjectApiSymbol: ApiSymbols.function,
        subjectAction: 'removed',
        itemType: 'breakingChange',
        deprecationVersion: '6.0.0-beta.4',
        deprecationSubjectAction: 'deprecated',
        breakingChangeMsg: 'empty is removed in favour of EMPTY'
      },
      {
        subject: 'ObservableLike',
        subjectApiSymbol: ApiSymbols.interface,
        subjectAction: 'removed',
        itemType: 'breakingChange',
        deprecationVersion: '6.1.0',
        deprecationSubjectAction: 'deprecated',
        breakingChangeMsg: 'Interface ObservableLike removed in favour of InteropObservable'
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
        subjectApiSymbol: ApiSymbols.property,
        subjectAction: 'hotObservables-to-private',
        itemType: 'breakingChange',
        deprecationVersion: '7.0.0-alpha.0',
        deprecationSubjectAction: 'hotObservables-deprecated',
        breakingChangeMsg: 'The access modifier of TestScheduler property hotObservables is now private'
      },
      {
        subject: 'TestScheduler',
        subjectApiSymbol: ApiSymbols.class,
        subjectAction: 'coldObservables-to-private',
        itemType: 'breakingChange',
        deprecationVersion: '7.0.0-alpha.0',
        deprecationSubjectAction: 'coldObservables-deprecated',
        breakingChangeMsg: 'The access modifier of TestScheduler property coldObservables is now private'
      },
      {
        subject: 'VirtualTimeScheduler',
        subjectApiSymbol: ApiSymbols.property,
        subjectAction: 'frameTimeFactor-moved',
        itemType: 'breakingChange',
        deprecationVersion: '7.0.0-alpha.0',
        deprecationSubjectAction: 'frameTimeFactor-deprecated',
        breakingChangeMsg: 'Class `VirtualTimeScheduler` moved `frameTimeFactor` out of class.'
      },
      {
        subject: 'VirtualTimeScheduler',
        subjectApiSymbol: ApiSymbols.property,
        subjectAction: 'index-to-private',
        itemType: 'breakingChange',
        deprecationVersion: '7.0.0-alpha.0',
        deprecationSubjectAction: 'index-deprecated',
        breakingChangeMsg: 'Class `VirtualTimeScheduler` made `index` property private.'
      }
    ]
  }
];


// SCHEDULER ARGUMENT
function getOperatorGeneralSchedulerArgumentDeprecationPhrase(operatorName: string, arg: string) {
  return `use scheduled and ${arg} instead of passing a scheduler`;
}

function getGeneralSchedulerArgumentBreakingChangePhrase() {
  return `scheduler argument removed`;
}

function getSchedulerArgumentGeneralReason(): string {
  return `The scheduler argument will be used only where appropriate.
          A lot of operators include optional scheduler parameters,
          that means that the implementation needs to check for a scheduler, which
          imports the scheduling logic and prevents it from being tree-shaken.`;
}

// Creation

function getCreationGeneralSchedulerArgumentDeprecationPhrase(operatorName?: string, arg?: string) {
  return `use subscribeOn and/or observeOn instead of passing a scheduler`;
}

function getCreationSchedulerGeneralImplication(opr: string): string {
  return `For ${opr}, the removal of the scheduler parameter means that if callers
  want notifications to be scheduled, they will have to apply the observeOn operator and move the used scheduler into it.`;
}


// OPR
function getOperatorSchedulerGeneralImplication(opr: string): string {
  return `For ${opr}, the removal of the scheduler parameter means that if callers
  want notifications to be scheduled, they will have to move the observables in the scheduled operator
  and later on use concatAll to flatten the resulting observable.`;
}

// -----------------------------

// FUNCTION TO STATIC

function getFunctionToStaticReason(operatorName: string): string {
  return `The function is deprecated as it returns a constant value. A constant is more efficient  than a function.`;
}

function getFunctionToStaticImplication(operatorName: string, arg: string): string {
  return `For ${operatorName}, the refactoring to a constant means that the  callers have to use ${arg}`;
}

// NAME DUPLICATE

// Info from: https://github.com/ReactiveX/rxjs/issues/3927
function getNameDupleOperatorDeprecationMsgCode(operatorName: string): string {
  return `use the static ${operatorName} instead`;
}

// Info from: https://github.com/ReactiveX/rxjs/issues/3927
function getNameDupleOperatorReason(operatorName: string): string {
  return `As \`${operatorName}\` operator is a name duplicate of the static
         function \`${operatorName}\` it gets deprecated.
         In future releases it will most probably be available under \`${operatorName}With\`.`;
}

function getNameDupleOperatorImplication(opr: string, arg: string): string {
  return `For ${opr}, the removal of the resultSelector argument means that if callers want to
   "compose in" another observable the observable to compose and
   the other code need to get composed by the equivalent a creation method ${arg}.`;
}


// RESULT_SELECTOR

function getResultSelectorBreakingChangeMsg(opr: string): string {
  return `Operator \`${opr}\` method removed the \`resultSelector\` argument`;
}


function getResultSelectorReason(operatorName: string): string {
  return `By removing the result selector from \`${operatorName}\` we get a smaller bundle since and better maintainability.
          Refactoring to use a \`map\` operation instead.`;
}

function getCreationResultSelectorImplication(opr: string): string {
  return `For ${opr}, the removal of the resultSelector argument means that if callers want to
   perform a projection, they will have to move this code into an additional map operator.
   To refactor this, take the function used as resultSelector and place it into a map operator below.`;
}

// Static
function getCreationResultSelectorDeprecationMsgCode(operatorName?: string): string {
  return `use the map operator instead of a result selector`;
}

// Operator
function getOperatorResultSelectorDeprecationMsgCode(operatorName?: string): string {
  return `use the map operator, on the inner observable, instead of a result selector`;
}
