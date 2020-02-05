import {MigrationReleaseItem} from './migration-item';
import {SubjectSymbols} from './migration-uid';

export const deprecationAndBreakingChangeTimeline: MigrationReleaseItem[] = [
  {
    version: '5.3.0',
    date: '2017-04-03T20:28:46.482Z',
    sourceLink: 'https://github.com/ReactiveX/rxjs/blob/5.3.0',
    deprecations: [
      {
        subject: '$$rxSubscriber',
        subjectSymbol: SubjectSymbols.symbol,
        subjectAction: 'deprecated',
        itemType: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/5.3.0/src/symbol/rxSubscriber.ts#L9',
        breakingChangeVersion: '8',
        breakingChangeSubjectAction: 'removed',
        deprecationMsgCode: 'use rxSubscriber instead',
        reason: '@TODO',
        implication: '@TODO',
        exampleBefore: `
        '@TODO'
        `,
        exampleAfter: `
        '@TODO'
        `
      },
      {
        subject: 'iterator',
        subjectSymbol: SubjectSymbols.symbol,
        subjectAction: 'deprecated',
        itemType: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/5.3.0/src/symbol/iterator.ts#L36',
        breakingChangeVersion: '8',
        breakingChangeSubjectAction: 'removed',
        deprecationMsgCode: 'use iterator instead',
        reason: '@TODO',
        implication: '@TODO',
        exampleBefore: `
        '@TODO'
        `,
        exampleAfter: `
        '@TODO'
        `
      }
    ],
    breakingChanges: []
  },
  {
    version: '6.0.0-alpha.3',
    date: '2018-02-09T17:06:57.961Z',
    sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-alpha.3',
    deprecations: [
      {
        subject: 'last',
        subjectSymbol: SubjectSymbols.function,
        subjectAction: 'argument-resultSelector-deprecated',
        itemType: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-alpha.3/src/internal/operators/last.ts#L12',
        breakingChangeVersion: '6.0.0-alpha.4',
        breakingChangeSubjectAction: 'argument-resultSelector-removed',
        deprecationMsgCode: getOperatorResultSelectorDeprecationMsgCode('last'),
        reason: getResultSelectorReason('last'),
        implication: getResultSelectorImplication('last'),
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
        subjectSymbol: SubjectSymbols.function,
        subjectAction: 'argument-resultSelector-deprecated',
        itemType: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-alpha.3/src/internal/operators/first.ts#L18',
        breakingChangeVersion: '6.0.0-alpha.4',
        breakingChangeSubjectAction: 'argument-resultSelector-removed',
        deprecationMsgCode: getOperatorResultSelectorDeprecationMsgCode('first'),
        reason: getResultSelectorReason('first'),
        implication: getResultSelectorImplication('first'),
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
    sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-alpha.4',
    deprecations: [],
    breakingChanges: [
      {
        subject: 'last',
        subjectSymbol: SubjectSymbols.function,
        subjectAction: 'argument-resultSelector-removed',
        itemType: 'breakingChange',
        deprecationVersion: '6.0.0-alpha.3',
        deprecationSubjectAction: 'argument-resultSelector-deprecated',
        breakingChangeMsg: getResultSelectorBreakingChangeMsg('last')
      },
      {
        subject: 'first',
        subjectSymbol: SubjectSymbols.function,
        subjectAction: 'argument-resultSelector-removed',
        itemType: 'breakingChange',
        deprecationVersion: '6.0.0-alpha.3',
        deprecationSubjectAction: 'argument-resultSelector-deprecated',
        breakingChangeMsg: getResultSelectorBreakingChangeMsg('first')
      }
    ]
  },
  {
    version: '6.0.0-beta.4',
    date: '2018-03-29T20:15:32.638Z',
    sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-beta.4',
    deprecations: [
      {
        subject: 'never',
        subjectSymbol: SubjectSymbols.function,
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
        subjectSymbol: SubjectSymbols.function,
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
        subjectSymbol: SubjectSymbols.class,
        subjectAction: 'argument-resultSelector-deprecated',
        itemType: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-beta.4/src/internal/observable/dom/WebSocketSubject.ts#L16',
        breakingChangeVersion: '8',
        breakingChangeSubjectAction: 'argument-resultSelector-removed',
        deprecationMsgCode: 'use deserializer instead',
        reason: `Incoming and outgoing projections are now done over WebSocketSubjectConfig interface serialize and deserialize options`,
        implication: `instead of providing the resultSelector under the key
        "resultSelector" in WebSocketSubjectConfig use key "deserialize" instead`,
        exampleBefore: `
          import { websocket } from 'rxjs/websocket';

          const resultSelector = (e: MessageEvent) => {
              return JSON.parse(e.data).msg;
          }
          const wsCfg = {
            url: 'wss://echo.websocket.org',
            resultSelector
          };

          const wsSubject = websocket(wsCfg);

          wsSubject.subscribe(console.log);

          wsSubject.next(JSON.stringify({msg: 'This is a message'}));
        `,
        exampleAfter: `
        import { websocket } from 'rxjs/websocket';

        const resultSelector = (e: MessageEvent) => {
            return JSON.parse(e.data).msg;
        }
        const wsCfg = {
          url: 'wss://echo.websocket.org',
          deserializer: resultSelector
        };

        const wsSubject = websocket(wsCfg);

        wsSubject.subscribe(console.log);

        wsSubject.next({msg: 'This is a message'});
        `
      }
    ],
    breakingChanges: [],
  },
  {
    version: '6.0.0-rc.0',
    date: '2018-03-31T00:12:03.479Z',
    sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-rc.0',
    deprecations: [
      {
        subject: 'fromEventPattern',
        subjectSymbol: SubjectSymbols.function,
        subjectAction: 'argument-resultSelector-deprecated',
        itemType: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-rc.0/src/internal/observable/fromEventPattern.ts#L9',
        breakingChangeVersion: '7',
        breakingChangeSubjectAction: 'argument-resultSelector-removed',
        deprecationMsgCode: getCreationResultSelectorDeprecationMsgCode('fromEventPattern'),
        reason: getResultSelectorReason('fromEventPattern'),
        implication: getResultSelectorImplication('fromEventPattern'),
        exampleBefore: `
          import { fromEventPattern } from 'rxjs';

          const resultSelector = (event) => event.matches;

          const mediaQueryList = window.matchMedia('(max-width: 600px)');
          const source = fromEventPattern(
            (handler) => { mediaQueryList.addListener(handler)},
            (handler) => { mediaQueryList.removeListener(handler)},
            resultSelector
          )

          // Resize the window to see results in the console
          source.subscribe((n) => console.log(n));
                  `,
        exampleAfter: `
                  import { fromEventPattern } from 'rxjs';
                  import { map } from 'rxjs/operators';

                  const resultSelector = (event) => event.matches;

                  const mediaQueryList = window.matchMedia('(max-width: 600px)');
                  const source = fromEventPattern(
                    (handler) => { mediaQueryList.addListener(handler)},
                    (handler) => { mediaQueryList.removeListener(handler)}
                  )
                  .pipe(
                    map(resultSelector)
                  );

                  // Resize the window to see results in the console
                  source.subscribe((n) => console.log(n));
                `
      },
      {
        subject: 'fromEvent',
        subjectSymbol: SubjectSymbols.function,
        subjectAction: 'argument-resultSelector-deprecated',
        itemType: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-rc.0/src/internal/observable/fromEvent.ts#L32',
        breakingChangeVersion: '7',
        breakingChangeSubjectAction: 'argument-resultSelector-removed',
        deprecationMsgCode: getCreationResultSelectorDeprecationMsgCode('fromEvent'),
        reason: getResultSelectorReason('fromEvent'),
        implication: getResultSelectorImplication('fromEvent'),
        exampleBefore: `
                import { fromEvent } from 'rxjs';

                const resultSelector = (event) => event.clientX;
                const source = fromEvent(document, 'click', resultSelector);

                // Click the window to see results in the console
                source.subscribe((n) => console.log(n));
                `,
        exampleAfter: `
                import { fromEvent } from 'rxjs';
                import { map } from 'rxjs/operators';

                const resultSelector = (event) => event.clientX;
                const source = fromEvent(document, 'click')
                .pipe(
                  map(resultSelector)
                )

                // Click the window to see results in the console
                source.subscribe((n) => console.log(n));
                `
      },
      {
        subject: 'bindNodeCallback',
        subjectSymbol: SubjectSymbols.function,
        subjectAction: 'argument-resultSelector-deprecated',
        itemType: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-rc.0/src/internal/observable/bindNodeCallback.ts#L10',
        breakingChangeVersion: '7',
        breakingChangeSubjectAction: 'argument-resultSelector-removed',
        deprecationMsgCode: getCreationResultSelectorDeprecationMsgCode('bindNodeCallback'),
        reason: getResultSelectorReason('bindNodeCallback'),
        implication: getResultSelectorImplication('bindNodeCallback'),
        exampleBefore: `
                import { bindNodeCallback } from 'rxjs';

                function fakeReadFile( path: string, callback: (err: any, data: any) => void): void {
                    setTimeout(() => {
                      callback(null, {value: 'a value'});
                    }, 0);
                }

                const resultSelector = (result) => result.value;
                const readFileAsObservable = bindNodeCallback(fakeReadFile, resultSelector);
                const source = readFileAsObservable('path/to/file');

                source.subscribe(n => console.log('next', n));
                `,
        exampleAfter: `
                import { bindNodeCallback } from 'rxjs';
                import { map } from 'rxjs/operators';

                function fakeReadFile( path: string, callback: (err: any, data: any) => void): void {
                    setTimeout(() => {
                      callback(null, {value: 'a value'});
                    }, 0);
                }

                const resultSelector = (result) => result.value;
                const readFileAsObservable = bindNodeCallback(fakeReadFile);
                const source = readFileAsObservable('path/to/file')
                .pipe(
                  map(resultSelector)
                );

                source.subscribe(n => console.log('next', n));
                `
      },
      {
        subject: 'bindCallback',
        subjectSymbol: SubjectSymbols.function,
        subjectAction: 'argument-resultSelector-deprecated',
        itemType: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-rc.0/src/internal/observable/bindCallback.ts#L10',
        breakingChangeVersion: '7',
        breakingChangeSubjectAction: 'argument-resultSelector-removed',
        deprecationMsgCode: getCreationResultSelectorDeprecationMsgCode('bindCallback'),
        reason: getResultSelectorReason('bindCallback'),
        implication: getResultSelectorImplication('bindCallback'),
        exampleBefore: `
                import { bindCallback } from 'rxjs';

                  function callbackSynchronously(cb) {
                      setTimeout(() => {
                        cb({value: 'a value'});
                      }, 0);
                  }

                  const resultSelector = (result) => result.value;
                  const readFileAsObservable = bindCallback(callbackSynchronously, resultSelector);
                  const source = readFileAsObservable();

                  source.subscribe(n => console.log('next', n));
                `,
        exampleAfter: `
                    import { bindCallback } from 'rxjs';
                    import { map } from 'rxjs/operators';

                    function callbackSynchronously(cb) {
                        setTimeout(() => {
                          cb({value: 'a value'});
                        }, 0);
                    }

                    const resultSelector = (result) => result.value;
                    const readFileAsObservable = bindCallback(callbackSynchronously, resultSelector);
                    const source = readFileAsObservable()
                      .pipe(
                        map(resultSelector)
                      );

                    source.subscribe(n => console.log('next', n));
            `
      },
      {
        subject: 'forkJoin',
        subjectSymbol: SubjectSymbols.function,
        subjectAction: 'argument-resultSelector-deprecated',
        itemType: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-rc.0/src/internal/observable/forkJoin.ts#L29',
        breakingChangeVersion: '7',
        breakingChangeSubjectAction: 'argument-resultSelector-removed',
        deprecationMsgCode: getCreationResultSelectorDeprecationMsgCode('forkJoin'),
        reason: getResultSelectorReason('forkJoin'),
        implication: getResultSelectorImplication('forkJoin'),
        exampleBefore: `
        import { of, forkJoin } from 'rxjs';

        const a = of('1');
        const b = of('2');
        const resultSelector = (a, b, i) => a + b;
        const source = forkJoin(a, b, resultSelector);
        source.subscribe(n => console.log(n));
        `,
        exampleAfter: `
        import { of, forkJoin } from 'rxjs';
        import { map } from 'rxjs/operators';

        const a = of('1');
        const b = of('2');
        const resultSelector = (a, b, i) => a + b;
        const source = forkJoin(a, b)
        .pipe(
          map(([a,b], i) => resultSelector(a, b, i))
        );
        source.subscribe(n => console.log(n));
        `
      },
      {
        subject: 'zip',
        subjectSymbol: SubjectSymbols.function,
        subjectAction: 'argument-resultSelector-deprecated',
        itemType: 'deprecation',
        sourceLink: `https://github.com/ReactiveX/rxjs/blob/6.0.0-rc.0/src/internal/observable/zip.ts#L37`,
        breakingChangeVersion: '7',
        breakingChangeSubjectAction: 'argument-resultSelector-removed',
        deprecationMsgCode: getCreationResultSelectorDeprecationMsgCode('zip'),
        reason: getResultSelectorReason('zip'),
        implication: getResultSelectorImplication('zip'),
        exampleBefore: `
        import { of, zip } from 'rxjs';

        const a = of('1');
        const b = of('2');
        const resultSelector = (a, b, i) => a + b;
        const source = zip(a, b, resultSelector);
        source.subscribe(n => console.log(n));
        `,
        exampleAfter: `
        import { of, zip } from 'rxjs';
        import { map } from 'rxjs/operators';

        const a = of('1');
        const b = of('2');
        const resultSelector = (a, b, i) => a + b;
        const source = zip(a, b)
        .pipe(
          map(([a,b], i) => resultSelector(a, b, i))
        );
        source.subscribe(n => console.log(n));
        `
      },
      {
        subject: 'switchMap',
        subjectSymbol: SubjectSymbols.function,
        subjectAction: 'argument-resultSelector-deprecated',
        itemType: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-rc.0/src/internal/operators/switchMap.ts#L16',
        breakingChangeVersion: '7',
        breakingChangeSubjectAction: 'argument-resultSelector-removed',
        deprecationMsgCode: getOperatorResultSelectorDeprecationMsgCode('switchMap'),
        reason: getResultSelectorReason('switchMap'),
        implication: getResultSelectorImplication('switchMap'),
        exampleBefore: `
        import { of } from 'rxjs';
        import { switchMap } from 'rxjs/operators';

        const a = of('1');
        const b = of('2');
        const resultSelector = (a, b, i) => a + b;
        const source = a.pipe(
          switchMap(n => b, resultSelector)
        );
        source.subscribe(n => console.log(n));
        `,
        exampleAfter: `
        import { of } from 'rxjs';
        import { map, switchMap } from 'rxjs/operators';

        const a = of('1');
        const b = of('2');
        const resultSelector = (a, b, i) => a + b;
        const source = a.pipe(
          switchMap(nextA => b
            .pipe(
              map((b, i) => resultSelector(nextA, b, i))
            )
          ),
        );
        source.subscribe(n => console.log(n));
        `
      },
      {
        subject: 'switchMapTo',
        subjectSymbol: SubjectSymbols.function,
        subjectAction: 'argument-resultSelector-deprecated',
        itemType: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-rc.0/src/internal/operators/switchMapTo.ts#L15',
        breakingChangeVersion: '7',
        breakingChangeSubjectAction: 'argument-resultSelector-removed',
        deprecationMsgCode: getMapToOperatorResultSelectorDeprecationMsgCode('switchMapTo', 'switchMap'),
        reason: getResultSelectorReason('switchMapTo'),
        implication: getResultSelectorImplication('switchMapTo'),
        exampleBefore: `
        import { of } from 'rxjs';
        import { switchMapTo } from 'rxjs/operators';

        const a = of('1');
        const b = of('2');
        const resultSelector = (a, b, i) => a + b;
        const source = a.pipe(
          switchMapTo(b, resultSelector)
        );
        source.subscribe(n => console.log(n));
        `,
        exampleAfter: `
        import { of } from 'rxjs';
        import { map, switchMap } from 'rxjs/operators';

        const a = of('1');
        const b = of('2');
        const resultSelector = (a, b, i) => a + b;
        const source = a.pipe(
          switchMap(nextA => b
            .pipe(
              map((b, i) => resultSelector(nextA, b, i))
            )
          ),
        );
        source.subscribe(n => console.log(n));
        `
      },
      {
        subject: 'concatMap',
        subjectSymbol: SubjectSymbols.function,
        subjectAction: 'argument-resultSelector-deprecated',
        itemType: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-rc.0/src/internal/operators/concatMap.ts#L8',
        breakingChangeVersion: '7',
        breakingChangeSubjectAction: 'argument-resultSelector-removed',
        deprecationMsgCode: getOperatorResultSelectorDeprecationMsgCode('concatMap'),
        reason: getResultSelectorReason('concatMap'),
        implication: getResultSelectorImplication('concatMap'),
        exampleBefore: `
        import { of } from 'rxjs';
        import { concatMap } from 'rxjs/operators';

        const a = of('1');
        const b = of('2');
        const resultSelector = (a, b, i) => a + b;
        const source = a.pipe(
          concatMap(n => b, resultSelector)
        );
        source.subscribe(n => console.log(n));
        `,
        exampleAfter: `
        import { of } from 'rxjs';
        import { map, concatMap } from 'rxjs/operators';

        const a = of('1');
        const b = of('2');
        const resultSelector = (a, b, i) => a + b;
        const source = a.pipe(
          concatMap(nextA => b
            .pipe(
              map((b, i) => resultSelector(nextA, b, i))
            )
          ),
        );
        source.subscribe(n => console.log(n));
        `
      },
      {
        subject: 'concatMapTo',
        subjectSymbol: SubjectSymbols.function,
        subjectAction: 'argument-resultSelector-deprecated',
        itemType: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-rc.0/src/internal/operators/concatMapTo.ts#L8',
        breakingChangeVersion: '7',
        breakingChangeSubjectAction: 'argument-resultSelector-removed',
        deprecationMsgCode: getMapToOperatorResultSelectorDeprecationMsgCode('concatMapTo', 'concatMap'),
        reason: getResultSelectorReason('concatMapTo'),
        implication: getResultSelectorImplication('concatMapTo'),
        exampleBefore: `
        import { of } from 'rxjs';
        import { concatMapTo } from 'rxjs/operators';

        const a = of('1');
        const b = of('2');
        const resultSelector = (a, b, i) => a + b;
        const source = a.pipe(
          concatMapTo(b, resultSelector)
        );
        source.subscribe(n => console.log(n));
        `,
        exampleAfter: `
        import { of } from 'rxjs';
        import { map, concatMap } from 'rxjs/operators';

        const a = of('1');
        const b = of('2');
        const resultSelector = (a, b, i) => a + b;
        const source = a.pipe(
          concatMap(nextA => b
            .pipe(
              map((b, i) => resultSelector(nextA, b, i))
            )
          ),
        );
        source.subscribe(n => console.log(n));
        `
      },
      {
        subject: 'mergeMap',
        subjectSymbol: SubjectSymbols.function,
        subjectAction: 'argument-resultSelector-deprecated',
        itemType: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-rc.0/src/internal/operators/mergeMap.ts#L16',
        breakingChangeVersion: '7',
        breakingChangeSubjectAction: 'argument-resultSelector-removed',
        deprecationMsgCode: getOperatorResultSelectorDeprecationMsgCode('mergeMap'),
        reason: getResultSelectorReason('mergeMap'),
        implication: getResultSelectorImplication('mergeMap'),
        exampleBefore: `
        import { of } from 'rxjs';
        import { mergeMap } from 'rxjs/operators';

        const a = of('1');
        const b = of('2');
        const resultSelector = (a, b, i) => a + b;
        const source = a.pipe(
          mergeMap(n => b, resultSelector)
        );
        source.subscribe(n => console.log(n));
        `,
        exampleAfter: `
        import { of } from 'rxjs';
        import { map, mergeMap } from 'rxjs/operators';

        const a = of('1');
        const b = of('2');
        const resultSelector = (a, b, i) => a + b;
        const source = a.pipe(
          mergeMap(nextA => b
            .pipe(
              map((b, i) => resultSelector(nextA, b, i))
            )
          ),
        );
        source.subscribe(n => console.log(n));
        `
      },
      {
        subject: 'mergeMapTo',
        subjectSymbol: SubjectSymbols.function,
        subjectAction: 'argument-resultSelector-deprecated',
        itemType: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-rc.0/src/internal/operators/mergeMapTo.ts#L8',
        breakingChangeVersion: '7',
        breakingChangeSubjectAction: 'argument-resultSelector-removed',
        deprecationMsgCode: getMapToOperatorResultSelectorDeprecationMsgCode('mergeMapTo', 'mergeMap'),
        reason: getResultSelectorReason('mergeMapTo'),
        implication: getResultSelectorImplication('mergeMapTo'),
        exampleBefore: `
        import { of } from 'rxjs';
        import { mergeMapTo } from 'rxjs/operators';

        const a = of('1');
        const b = of('2');
        const resultSelector = (a, b, i) => a + b;
        const source = a.pipe(
          mergeMapTo(b, resultSelector)
        );
        source.subscribe(n => console.log(n));
        `,
        exampleAfter: `
        import { of } from 'rxjs';
        import { map, mergeMap } from 'rxjs/operators';

        const a = of('1');
        const b = of('2');
        const resultSelector = (a, b, i) => a + b;
        const source = a.pipe(
          mergeMap(nextA => b
            .pipe(
              map((b, i) => resultSelector(nextA, b, i))
            )
          ),
        );
        source.subscribe(n => console.log(n));
        `
      },
      {
        subject: 'exhaustMap',
        subjectSymbol: SubjectSymbols.function,
        subjectAction: 'argument-resultSelector-deprecated',
        itemType: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-rc.0/src/internal/operators/exhaustMap.ts#L16',
        breakingChangeVersion: '7',
        breakingChangeSubjectAction: 'argument-resultSelector-removed',
        deprecationMsgCode: getOperatorResultSelectorDeprecationMsgCode('exhaustMap'),
        reason: getResultSelectorReason('exhaustMap'),
        implication: getResultSelectorImplication('exhaustMap'),
        exampleBefore: `
        import { of } from 'rxjs';
        import { exhaustMap } from 'rxjs/operators';

        const a = of('1');
        const b = of('2');
        const resultSelector = (a, b, i) => a + b;
        const source = a.pipe(
          exhaustMap(n => b, resultSelector)
        );
        source.subscribe(n => console.log(n));
        `,
        exampleAfter: `
        import { of } from 'rxjs';
        import { map, exhaustMap } from 'rxjs/operators';

        const a = of('1');
        const b = of('2');
        const resultSelector = (a, b, i) => a + b;
        const source = a.pipe(
          exhaustMap(nextA => b
            .pipe(
              map((b, i) => resultSelector(nextA, b, i))
            )
          ),
        );
        source.subscribe(n => console.log(n));
        `
      },
      {
        subject: 'combineLatest',
        subjectSymbol: SubjectSymbols.function,
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
        subjectSymbol: SubjectSymbols.function,
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
        subject: 'concat',
        subjectSymbol: SubjectSymbols.function,
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
        subjectSymbol: SubjectSymbols.function,
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
      }

    ],
    breakingChanges: []
  },
  {
    version: '6.0.0-rc.1',
    date: '2018-04-07T04:52:25.078Z',
    sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-rc.1',
    deprecations: [
      {
        subject: 'Observable',
        subjectSymbol: SubjectSymbols.class,
        subjectAction: 'static-property-if-deprecated',
        itemType: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-rc.1/src/internal/Observable.ts#L260',
        breakingChangeVersion: '7',
        breakingChangeSubjectAction: 'static-property-if-removed',
        deprecationMsgCode: 'use iif instead',
        reason: `As 'if' is seen by the compiler as reserved word, static method 'if' gets deprecated.
            It is now available under a creation operator named 'iif'`,
        implication: 'The deprecation of Observable.if means for the caller to use iif instead',
        exampleBeforeDependencies: {
          'rxjs': '6.0.0-rc.0',
          'rxjs-compat': '6.0.0-rc.0'
        },
        exampleBefore: `
        import { Observable } from 'rxjs/Observable';
        import 'rxjs/add/observable/of';
        import 'rxjs/add/observable/if';

        const a = Observable.of('1');
        const b = Observable.of('2');
        const condition = (): boolean => Math.random() < 0.5;

        const source = Observable.if(condition, a, b);
        source.subscribe((n) => console.log(n));
        `,
        exampleAfter: `
        import { of, iif } from 'rxjs'

        const a = of('1');
        const b = of('2');
        const condition = (): boolean => Math.random() < 0.5;

        const source = iif(condition, a, b)
        source.subscribe((n) => console.log(n));
        `
      },
      {
        subject: 'Observable',
        subjectSymbol: SubjectSymbols.class,
        subjectAction: 'static-property-throw-deprecated',
        itemType: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-rc.1/src/internal/Observable.ts#L265',
        breakingChangeVersion: '7',
        breakingChangeSubjectAction: 'static-property-throw-removed',
        deprecationMsgCode: 'use throwError instead',
        reason: `As 'throw' is seen by the compiler as reserved word, static method 'throw' gets deprecated.
            It is now available under a creation operator named 'throwError'`,
        implication: 'The deprecation of Observable.if means for the caller to use iif operator instead',
        exampleBeforeDependencies: {
          'rxjs': '6.0.0-rc.0',
          'rxjs-compat': '6.0.0-rc.0'
        },
        exampleBefore: `
        import { Observable } from 'rxjs/Observable';
        import 'rxjs/add/observable/throw';

        const error = new Error('smooshMap does not exist');
        const source = Observable.throw(error);
        source.subscribe((n) => console.log(n));
        `,
        exampleAfter: `
        import { of, throwError } from 'rxjs';

        const error = new Error('smooshMap does not exist');
        const source = throwError(error);
        source.subscribe((n) => console.log(n));
        `
      }
    ],
    breakingChanges: []
  },
  {
    version: '6.0.0-tactical-rc.1',
    date: '2018-04-07T05:03:49.629Z',
    sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-tactical-rc.1',
    deprecations: [
      {
        subject: 'Scheduler',
        subjectSymbol: SubjectSymbols.class,
        subjectAction: 'deprecated',
        itemType: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-tactical-rc.1/src/internal/Scheduler.ts#L20',
        breakingChangeVersion: '7',
        breakingChangeSubjectAction: 'to-private',
        deprecationMsgCode: 'use interface SchedulerLike instead',
        reason: `create your own class and implement SchedulerLike instead`,
        implication: '@TODO',
        exampleBefore: `
        @TODO => https://stackblitz.com/edit/rxjs-scheduler-example
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
    version: '6.0.0-tenacious-rc.2',
    date: '2018-04-11T04:44:27.465Z',
    sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-tenacious-rc.2',
    deprecations: [
      {
        subject: 'SubscribeOnObservable',
        subjectSymbol: SubjectSymbols.class,
        subjectAction: 'method-subscribe-deprecated',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-tenacious-rc.2/src/internal/observable/SubscribeOnObservable.ts#L42',
        itemType: 'deprecation',
        breakingChangeVersion: '8',
        breakingChangeSubjectAction: 'method-subscribe-to-private',
        deprecationMsgCode: getInternalDeprecationMsg('subscribe'),
        reason: getInternalReason('subscribe'),
        implication: getInternalImplication()
      },
      {
        subject: 'AjaxCreationMethod',
        subjectSymbol: SubjectSymbols.class,
        subjectAction: 'method-subscribe-deprecated',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-tenacious-rc.2/src/internal/observable/dom/AjaxObservable.ts#L182',
        itemType: 'deprecation',
        breakingChangeVersion: '8',
        breakingChangeSubjectAction: 'method-subscribe-to-private',
        deprecationMsgCode: getInternalDeprecationMsg('subscribe'),
        reason: getInternalReason('subscribe'),
        implication: getInternalImplication()
      },
      {
        subject: 'Subscriber',
        subjectSymbol: SubjectSymbols.class,
        subjectAction: 'method-unsubscribeAndRecycle-deprecated',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-tenacious-rc.2/src/internal/Subscriber.ts#L155',
        itemType: 'deprecation',
        breakingChangeVersion: '8',
        breakingChangeSubjectAction: 'method-unsubscribeAndRecycle-to-private',
        deprecationMsgCode: getInternalDeprecationMsg('unsubscribeAndRecycle'),
        reason: getInternalReason('unsubscribeAndRecycle'),
        implication: getInternalImplication()
      },
      {
        subject: 'TimeoutWithSubscriber',
        subjectSymbol: SubjectSymbols.class,
        subjectAction: 'method-unsubscribe-deprecated',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-tenacious-rc.2/src/internal/operators/timeoutWith.ts#L132',
        itemType: 'deprecation',
        breakingChangeVersion: '8',
        breakingChangeSubjectAction: 'method-unsubscribe-to-private',
        deprecationMsgCode: getInternalDeprecationMsg('unsubscribe'),
        reason: getInternalReason('unsubscribe'),
        implication: getInternalImplication()
      },
      {
        subject: 'ConnectableObservable',
        subjectSymbol: SubjectSymbols.class,
        subjectAction: 'method-subscribe-deprecated',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-tenacious-rc.2/src/internal/observable/ConnectableObservable.ts#L25',
        itemType: 'deprecation',
        breakingChangeVersion: '8',
        breakingChangeSubjectAction: 'method-subscribe-to-private',
        deprecationMsgCode: getInternalDeprecationMsg('subscribe'),
        reason: getInternalReason('subscribe'),
        implication: getInternalImplication()
      },
      {
        subject: 'RepeatWhenSubscriber',
        subjectSymbol: SubjectSymbols.class,
        subjectAction: 'method-unsubscribe-deprecated',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-tenacious-rc.2/src/internal/operators/repeatWhen.ts#L89',
        itemType: 'deprecation',
        breakingChangeVersion: '8',
        breakingChangeSubjectAction: 'method-unsubscribe-to-private',
        deprecationMsgCode: getInternalDeprecationMsg('unsubscribe'),
        reason: getInternalReason('unsubscribe'),
        implication: getInternalImplication()
      },
      {
        subject: 'RepeatWhenSubscriber',
        subjectSymbol: SubjectSymbols.class,
        subjectAction: 'method-unsubscribeAndRecycle-deprecated',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-tenacious-rc.2/src/internal/operators/repeatWhen.ts#L103',
        itemType: 'deprecation',
        breakingChangeVersion: '8',
        breakingChangeSubjectAction: 'method-unsubscribeAndRecycle-to-private',
        deprecationMsgCode: getInternalDeprecationMsg('unsubscribeAndRecycle'),
        reason: getInternalReason('unsubscribeAndRecycle'),
        implication: getInternalImplication()
      },
      {
        subject: 'WindowToggleSubscriber',
        subjectSymbol: SubjectSymbols.class,
        subjectAction: 'method-unsubscribe-deprecated',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-tenacious-rc.2/src/internal/operators/windowToggle.ts#L137',
        itemType: 'deprecation',
        breakingChangeVersion: '8',
        breakingChangeSubjectAction: 'method-unsubscribe-to-private',
        deprecationMsgCode: getInternalDeprecationMsg('unsubscribe'),
        reason: getInternalReason('unsubscribe'),
        implication: getInternalImplication()
      },
      {
        subject: 'WindowSubscriber',
        subjectSymbol: SubjectSymbols.class,
        subjectAction: 'method-unsubscribe-deprecated',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-tenacious-rc.2/src/internal/operators/window.ts#L109',
        itemType: 'deprecation',
        breakingChangeVersion: '8',
        breakingChangeSubjectAction: 'method-unsubscribe-to-private',
        deprecationMsgCode: getInternalDeprecationMsg('unsubscribe'),
        reason: getInternalReason('unsubscribe'),
        implication: getInternalImplication()
      },
      {
        subject: 'GroupDurationSubscriber',
        subjectSymbol: SubjectSymbols.class,
        subjectAction: 'method-unsubscribe-deprecated',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-tenacious-rc.2/src/internal/operators/groupBy.ts#L237',
        itemType: 'deprecation',
        breakingChangeVersion: '8',
        breakingChangeSubjectAction: 'method-unsubscribe-to-private',
        deprecationMsgCode: getInternalDeprecationMsg('unsubscribe'),
        reason: getInternalReason('unsubscribe'),
        implication: getInternalImplication()
      },
      {
        subject: 'GroupedObservable',
        subjectSymbol: SubjectSymbols.class,
        subjectAction: 'method-subscribe-deprecated',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-tenacious-rc.2/src/internal/operators/groupBy.ts#L262',
        itemType: 'deprecation',
        breakingChangeVersion: '8',
        breakingChangeSubjectAction: 'method-subscribe-to-private',
        deprecationMsgCode: getInternalDeprecationMsg('subscribe'),
        reason: getInternalReason('subscribe'),
        implication: getInternalImplication()
      },
      {
        subject: 'BufferWhenSubscriber',
        subjectSymbol: SubjectSymbols.class,
        subjectAction: 'method-unsubscribe-deprecated',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-tenacious-rc.2/src/internal/operators/bufferWhen.ts#L88',
        itemType: 'deprecation',
        breakingChangeVersion: '8',
        breakingChangeSubjectAction: 'method-unsubscribe-to-private',
        deprecationMsgCode: getInternalDeprecationMsg('unsubscribe'),
        reason: getInternalReason('unsubscribe'),
        implication: getInternalImplication()
      },
      {
        subject: 'BufferWhenSubscriber',
        subjectSymbol: SubjectSymbols.class,
        subjectAction: 'method-subscribe-deprecated',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-tenacious-rc.2/src/internal/operators/bufferWhen.ts#L88',
        itemType: 'deprecation',
        breakingChangeVersion: '8',
        breakingChangeSubjectAction: 'method-subscribe-to-private',
        deprecationMsgCode: getInternalDeprecationMsg('subscribe'),
        reason: getInternalReason('subscribe'),
        implication: getInternalImplication()
      },
      {
        subject: 'BufferTimeSubscriber',
        subjectSymbol: SubjectSymbols.class,
        subjectAction: 'method-unsubscribe-deprecated',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-tenacious-rc.2/src/internal/operators/bufferTime.ts#L173',
        itemType: 'deprecation',
        breakingChangeVersion: '8',
        breakingChangeSubjectAction: 'method-unsubscribe-to-private',
        deprecationMsgCode: getInternalDeprecationMsg('unsubscribe'),
        reason: getInternalReason('unsubscribe'),
        implication: getInternalImplication()
      },
      {
        subject: 'AsyncAction',
        subjectSymbol: SubjectSymbols.class,
        subjectAction: 'method-unsubscribe-deprecated',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-tenacious-rc.2/src/internal/scheduler/AsyncAction.ts#L132',
        itemType: 'deprecation',
        breakingChangeVersion: '8',
        breakingChangeSubjectAction: 'method-unsubscribe-to-private',
        deprecationMsgCode: getInternalDeprecationMsg('unsubscribe'),
        reason: getInternalReason('unsubscribe'),
        implication: getInternalImplication()
      },
      {
        subject: 'Subscriber',
        subjectSymbol: SubjectSymbols.class,
        subjectAction: 'method-unsubscribeAndRecycle-deprecated',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-tenacious-rc.2/src/internal/Subscriber.ts#L155',
        itemType: 'deprecation',
        breakingChangeVersion: '8',
        breakingChangeSubjectAction: 'method-unsubscribeAndRecycle-to-private',
        deprecationMsgCode: getInternalDeprecationMsg('unsubscribeAndRecycle'),
        reason: getInternalReason('unsubscribeAndRecycle'),
        implication: getInternalImplication()
      },
      {
        subject: 'Subscriber',
        subjectSymbol: SubjectSymbols.class,
        subjectAction: 'method-trySubscribe-deprecated',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-tenacious-rc.2/src/internal/Subject.ts#L103',
        itemType: 'deprecation',
        breakingChangeVersion: '8',
        breakingChangeSubjectAction: 'method-trySubscribe-to-private',
        deprecationMsgCode: getInternalDeprecationMsg('trySubscribe'),
        reason: getInternalReason('trySubscribe'),
        implication: getInternalImplication()
      },
      {
        subject: 'Subject',
        subjectSymbol: SubjectSymbols.class,
        subjectAction: 'method-subscribe-deprecated',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-tenacious-rc.2/src/internal/Subject.ts#L112',
        itemType: 'deprecation',
        breakingChangeVersion: '8',
        breakingChangeSubjectAction: 'method-subscribe-to-private',
        deprecationMsgCode: getInternalDeprecationMsg('subscribe'),
        reason: getInternalReason('subscribe'),
        implication: getInternalImplication()
      },
      {
        subject: 'BehaviorSubject',
        subjectSymbol: SubjectSymbols.class,
        subjectAction: 'method-subscribe-deprecated',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-tenacious-rc.2/src/internal/BehaviorSubject.ts#L20',
        itemType: 'deprecation',
        breakingChangeVersion: '8',
        breakingChangeSubjectAction: 'method-subscribe-to-private',
        deprecationMsgCode: getInternalDeprecationMsg('subscribe'),
        reason: getInternalReason('subscribe'),
        implication: getInternalImplication()
      }
    ],
    breakingChanges: []
  },
  {
    version: '6.1.0',
    date: '2018-05-03T18:15:54.101Z',
    sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.1.0',
    deprecations: [
      {
        subject: 'ObservableLike',
        subjectSymbol: SubjectSymbols.interface,
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
      },
      {
        subject: 'AsyncScheduler',
        subjectSymbol: SubjectSymbols.class,
        subjectAction: 'property-active-deprecated',
        itemType: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.1.0/src/internal/scheduler/AsyncScheduler.ts#L14',
        breakingChangeVersion: '8',
        breakingChangeSubjectAction: 'property-active-to-private',
        deprecationMsgCode: getInternalDeprecationMsg('active'),
        reason: getInternalReason('active'),
        implication: getInternalImplication()
      },
      {
        subject: 'AsyncScheduler',
        subjectSymbol: SubjectSymbols.class,
        subjectAction: 'property-scheduled-deprecated',
        itemType: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.1.0/src/internal/scheduler/AsyncScheduler.ts#L22',
        breakingChangeVersion: '8',
        breakingChangeSubjectAction: 'property-scheduled-to-private',
        deprecationMsgCode: getInternalDeprecationMsg('scheduled'),
        reason: getInternalReason('scheduled'),
        implication: getInternalImplication()
      },
      {
        subject: 'GroupedObservable',
        subjectSymbol: SubjectSymbols.class,
        subjectAction: 'constructor-deprecated',
        itemType: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.0.0-turbo-rc.4/src/internal/operators/groupBy.ts#L256',
        breakingChangeVersion: '8',
        breakingChangeSubjectAction: 'constructor-@TODO',
        deprecationMsgCode: getInternalDeprecationMsg('constructor'),
        reason: getInternalReason('constructor'),
        implication: getInternalImplication()
      }
    ],
    breakingChanges: []
  },
  {
    version: '6.2.0',
    date: '2018-05-22T04:52:34.571Z',
    sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.2.0',
    deprecations: [
      {
        subject: 'race',
        subjectSymbol: SubjectSymbols.function,
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
    version: '6.2.1',
    date: '2018-06-12T17:04:31.187Z',
    sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.2.1',
    deprecations: [
      {
        subject: 'delayWhen',
        subjectSymbol: SubjectSymbols.class,
        subjectAction: 'constructor-deprecated',
        itemType: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.2.1/src/internal/operators/delayWhen.ts#L11',
        breakingChangeVersion: '8',
        breakingChangeSubjectAction: 'constructor-@TODO',
        deprecationMsgCode: `@TODO In future versions, empty notifiers will no longer re-emit the source value on the output observable.`,
        reason: `@TODO In future versions, empty notifiers will no longer re-emit the source value on the output observable.`,
        implication: `@TODO`
      }
    ],
    breakingChanges: []
  },
  {
    version: '6.3.3',
    date: '2018-09-25T23:52:58.845Z',
    sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.3.3',
    deprecations: [
      {
        subject: 'rxSubscriber',
        subjectSymbol: SubjectSymbols.symbol,
        subjectAction: 'deprecated',
        itemType: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.3.3/src/internal/symbol/rxSubscriber.ts#L1',
        breakingChangeVersion: '8',
        breakingChangeSubjectAction: 'removed',
        deprecationMsgCode: `do not use, this is no longer checked by RxJS internals`,
        reason: `@TODO`,
        implication: `@TODO`
      }
    ],
    breakingChanges: []
  },
  {
    version: '6.4.0',
    date: '2019-01-30T03:50:24.313Z',
    sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.4.0',
    deprecations: [
      {
        subject: 'Observable',
        subjectSymbol: SubjectSymbols.class,
        subjectAction: 'subscribe-argument-nextCallback-deprecated',
        itemType: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.4.0/src/internal/Observable.ts#L74',
        breakingChangeVersion: '8',
        breakingChangeSubjectAction: 'subscribe-argument-nextCallback-removed',
        deprecationMsgCode: getGeneralObserverCallbackDeprecationMsgCode(),
        reason: getGeneralObserverCallbackReason(),
        implication: getOperatorGeneralObserverCallbackImplication(),
        exampleBefore: `
        import { of } from 'rxjs';

        const source = of('1');
        source.subscribe((n) => console.log(n));
        `,
        exampleAfter: `
        import { of, Observable } from 'rxjs';

        const observer: Observer = {
              next:     (n) => console.log(n)
            };

        const source = of('1');
        source.subscribe(observer);
        `
      },
      {
        subject: 'Observable',
        subjectSymbol: SubjectSymbols.class,
        subjectAction: 'subscribe-argument-errorCallback-deprecated',
        itemType: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.4.0/src/internal/Observable.ts#L76',
        breakingChangeVersion: '8',
        breakingChangeSubjectAction: 'subscribe-argument-errorCallback-removed',
        deprecationMsgCode: getGeneralObserverCallbackDeprecationMsgCode(),
        reason: getGeneralObserverCallbackReason(),
        implication: getOperatorGeneralObserverCallbackImplication(),
        exampleBefore: `
        import { of } from 'rxjs';

        const source = of('1');
        source.subscribe(null, (e) => console.log(e));
        `,
        exampleAfter: `
        const observer: Observer = {
              error:    (e) => console.log(e)
            };

        const source = of('1');
        source.subscribe(observer);
        `
      },
      {
        subject: 'Observable',
        subjectSymbol: SubjectSymbols.class,
        subjectAction: 'subscribe-argument-completeCallback-deprecated',
        itemType: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.4.0/src/internal/Observable.ts#L78',
        breakingChangeVersion: '8',
        breakingChangeSubjectAction: 'subscribe-argument-completeCallback-removed',
        deprecationMsgCode: getGeneralObserverCallbackDeprecationMsgCode(),
        reason: getGeneralObserverCallbackReason(),
        implication: getOperatorGeneralObserverCallbackImplication(),
        exampleBefore: `
        import { of } from 'rxjs';

        const source = of('1');
        source.subscribe(null, null, () => console.log('c'));
        `,
        exampleAfter: `
        const observer: Observer = {
              complete: ( ) => console.log('c')
            };

        const source = of('1');
        source.subscribe(observer);
        `
      },
      {
        subject: 'tap',
        subjectSymbol: SubjectSymbols.function,
        subjectAction: 'argument-nextCallback-deprecated',
        itemType: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.4.0/src/internal/operators/tap.ts#L9',
        breakingChangeVersion: '8',
        breakingChangeSubjectAction: 'argument-nextCallback-removed',
        deprecationMsgCode: getGeneralObserverCallbackDeprecationMsgCode(),
        reason: getGeneralObserverCallbackReason(),
        implication: getOperatorGeneralObserverCallbackImplication(),
        exampleBefore: `
        import { of } from 'rxjs';

        const source = of('1')
          .pipe(
            tap((n) => console.log(n))
          );
        source.subscribe();
        `,
        exampleAfter: `
        import { of, Observable } from 'rxjs';

        const observer: Observer = {
              next:     (n) => console.log(n)
            };
        const source = of('1')
          .pipe(
            tap(observer)
          );
        source.subscribe();
        `
      },
      {
        subject: 'tap',
        subjectSymbol: SubjectSymbols.function,
        subjectAction: 'argument-errorCallback-deprecated',
        itemType: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.4.0/src/internal/operators/tap.ts#L11',
        breakingChangeVersion: '8',
        breakingChangeSubjectAction: 'argument-errorCallback-removed',
        deprecationMsgCode: getGeneralObserverCallbackDeprecationMsgCode(),
        reason: getGeneralObserverCallbackReason(),
        implication: getOperatorGeneralObserverCallbackImplication(),
        exampleBefore: `
        import { of } from 'rxjs';

        const source = of('1')
          .pipe(
            tap(null, (e) => console.log(e))
          );
        source.subscribe();
        `,
        exampleAfter: `
        import { of, Observable } from 'rxjs';

        const observer: Observer = {
              error:    (e) => console.log(e)
            };
        const source = of('1')
          .pipe(
            tap(observer)
          );
        source.subscribe();
        `
      },
      {
        subject: 'tap',
        subjectSymbol: SubjectSymbols.function,
        subjectAction: 'argument-completeCallback-deprecated',
        itemType: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.4.0/src/internal/operators/tap.ts#L13',
        breakingChangeVersion: '8',
        breakingChangeSubjectAction: 'argument-completeCallback-removed',
        deprecationMsgCode: getGeneralObserverCallbackDeprecationMsgCode(),
        reason: getGeneralObserverCallbackReason(),
        implication: getOperatorGeneralObserverCallbackImplication(),
        exampleBefore: `
        import { of } from 'rxjs';

        const source = of('1')
          .pipe(
            tap(null, null, ( ) => console.log('c')
          )
        );
        source.subscribe();
        `,
        exampleAfter: `
        import { of, Observable } from 'rxjs';

        const observer: Observer = {
              complete: ( ) => console.log('c')
            };
        const source = of('1')
          .pipe(
            tap(observer)
          );
        source.subscribe();
        `
      },
      {
        subject: 'Subscribable',
        subjectSymbol: SubjectSymbols.function,
        subjectAction: 'argument-nextCallback-deprecated',
        itemType: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.4.0/src/internal/types.ts#L43',
        breakingChangeVersion: '8',
        breakingChangeSubjectAction: 'argument-nextCallback-removed',
        deprecationMsgCode: getGeneralObserverCallbackDeprecationMsgCode(),
        reason: getGeneralObserverCallbackReason(),
        implication: getOperatorGeneralObserverCallbackImplication(),
        exampleBefore: `
        @TODO
        `,
        exampleAfter: `
        @TODO
        `
      },
      {
        subject: 'Subscribable',
        subjectSymbol: SubjectSymbols.function,
        subjectAction: 'argument-errorCallback-deprecated',
        itemType: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.4.0/src/internal/types.ts#L45',
        breakingChangeVersion: '8',
        breakingChangeSubjectAction: 'argument-errorCallback-removed',
        deprecationMsgCode: getGeneralObserverCallbackDeprecationMsgCode(),
        reason: getGeneralObserverCallbackReason(),
        implication: getOperatorGeneralObserverCallbackImplication(),
        exampleBefore: `
        @TODO
        `,
        exampleAfter: `
        @TODO
        `
      },
      {
        subject: 'Subscribable',
        subjectSymbol: SubjectSymbols.function,
        subjectAction: 'argument-completeCallback-deprecated',
        itemType: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.4.0/src/internal/types.ts#L47',
        breakingChangeVersion: '8',
        breakingChangeSubjectAction: 'argument-completeCallback-removed',
        deprecationMsgCode: getGeneralObserverCallbackDeprecationMsgCode(),
        reason: getGeneralObserverCallbackReason(),
        implication: getOperatorGeneralObserverCallbackImplication(),
        exampleBefore: `
        @TODO
        `,
        exampleAfter: `
        @TODO
        `
      },
      {
        subject: 'Observable',
        subjectSymbol: SubjectSymbols.class,
        subjectAction: 'property-create-deprecated',
        itemType: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.4.0/src/internal/Observable.ts#L53',
        breakingChangeVersion: '8',
        breakingChangeSubjectAction: 'property-create-removed',
        deprecationMsgCode: 'use new Observable() instead',
        reason: `After moving to "pipeable" operators create static Observable method got deprecated.
        No new static method was created because new Observable() is more intuitive and natural to the language.
        Technically older versions of TypeScript had many more limitations that today's version`,
        implication: 'The deprecation of Observable.create means tfor thw caller to use new Observable instead.',
        exampleBefore: `
        import { Observable } from 'rxjs';

        const source = Observable.create(subscriberFunc);
        source.subscribe((n) => console.log(n));
        `,
        exampleAfter: `
        import { Observable } from 'rxjs';

        const source = new Observable(subscriberFunc)
        source.subscribe((n) => console.log(n));
        `
      },
      {
        subject: 'TimeInterval',
        subjectSymbol: SubjectSymbols.class,
        subjectAction: 'deprecated',
        itemType: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.4.0/src/internal/operators/timeInterval.ts#L69',
        breakingChangeVersion: '8',
        breakingChangeSubjectAction: 'to-private',
        deprecationMsgCode: 'use the interface TimeInterval instead',
        reason: `Class TimeInterval gets deprecated in favour of
         interface [TimeInterval](https://github.com/ReactiveX/rxjs/blob/6.0.0/src/internal/types.ts#L19-L22).
         because there's no reason users should be manually creating this type.`,
        implication: 'To make the class TimeInterval private means for the caller to use the interface TimeInterval instead.',
        exampleBefore: `
        import { interval, Observable, TimeInterval } from 'rxjs';
        import { timeInterval } from 'rxjs/operators';

        const source: Observable<TimeInterval<number>> = interval(1000)
          .pipe(
            timeInterval()
          );
        source.subscribe((n) => console.log(n));
        `,
        exampleAfter: `
        import { interval, Observable, TimeInterval } from 'rxjs';
        import { timeInterval } from 'rxjs/operators';

        const source: Observable<TimeInterval<number>> = interval(1000)
          .pipe(
            timeInterval()
          );
        source.subscribe((n) => console.log(n));
        `
      },
      {
        subject: 'Subject',
        subjectSymbol: SubjectSymbols.class,
        subjectAction: 'static-create-deprecated',
        itemType: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.4.0/src/internal/Subject.ts#L49',
        breakingChangeVersion: '8',
        breakingChangeSubjectAction: 'static-create-removed',
        deprecationMsgCode: 'use the interface TimeInterval instead',
        reason: `@TODO`,
        implication: `@TODO`,
        exampleBefore: `@TODO`,
        exampleAfter: `@TODO`
      }
    ],
    breakingChanges: []
  },
  {
    version: '6.5.0',
    date: '2019-04-23T02:55:47.108Z',
    sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.5.0',
    deprecations: [
      {
        subject: 'from',
        subjectSymbol: SubjectSymbols.function,
        subjectAction: 'argument-scheduler-deprecated',
        itemType: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.5.0/src/internal/observable/from.ts#L7',
        breakingChangeVersion: '8',
        breakingChangeSubjectAction: 'argument-scheduler-removed',
        deprecationMsgCode: 'use scheduled instead',
        reason: getSchedulerArgumentGeneralReason(),
        implication: `For from, the removal of the scheduler parameter means that if callers
  want notifications to be scheduled, they will have to use the scheduled operator instead.`,
        exampleBefore: `
        import { from } from 'rxjs';

        const source = from([1,2,3]);
        source.subscribe((n) => console.log(n));
        `,
        exampleAfter: `
        import { scheduled } from 'rxjs';

        const source = scheduled([1,2,3]);
        source.subscribe((n) => console.log(n));
        `
      },
      {
        subject: 'of',
        subjectSymbol: SubjectSymbols.function,
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
        subjectSymbol: SubjectSymbols.function,
        subjectAction: 'argument-scheduler-deprecated',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.5.0/src/internal/observable/combineLatest.ts#L59',
        itemType: 'deprecation',
        breakingChangeVersion: '8',
        breakingChangeSubjectAction: 'argument-scheduler-removed',
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
        subjectSymbol: SubjectSymbols.function,
        subjectAction: 'argument-resultSelector-deprecated',
        itemType: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.5.0/src/internal/observable/combineLatest.ts#L43',
        breakingChangeVersion: '7',
        breakingChangeSubjectAction: 'argument-resultSelector-removed',
        deprecationMsgCode: getCreationResultSelectorDeprecationMsgCode('combineLatest'),
        reason: getResultSelectorReason('combineLatest'),
        implication: getResultSelectorImplication('combineLatest'),
        exampleBefore: `
        import { of, combineLatest } from 'rxjs';

        const a = of('1');
        const b = of('2');
        const resultSelector = (a, b, i) => a + b;
        const source = combineLatest(a, b, resultSelector);
        source.subscribe(n => console.log(n));
        `,
        exampleAfter: `
        import { of, combineLatest } from 'rxjs';
        import { map } from 'rxjs/operators';

        const a = of('1');
        const b = of('2');
        const resultSelector = (a, b, i) => a + b;
        const source = combineLatest(a, b)
        .pipe(
          map(([a,b], i) => resultSelector(a, b, i))
        );
        source.subscribe(n => console.log(n));
        `
      },
      {
        subject: 'combineLatest',
        subjectSymbol: SubjectSymbols.function,
        subjectAction: 'multiple-arguments-deprecated',
        itemType: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.5.0/src/internal/observable/combineLatest.ts#L88',
        breakingChangeVersion: '8',
        breakingChangeSubjectAction: 'multiple-arguments-removed',
        deprecationMsgCode: 'pass arguments in a single array instead',
        reason: `Creation operator combineLatest method arguments in an array instead of single arguments.
        They are technically easier to type.`,
        implication: `Deprecating the option to passe multiple observables
        to combineLatest means for the caller to use an array of observables instead.`,
        exampleBefore: `
        import { of } from 'rxjs';
        import { combineLatest } from 'rxjs';

        const a = of('1');
        const b = of('2');

        const source = combineLatest(a,b);
        source.subscribe((n) => console.log(n));
        `,
        exampleAfter: `
        import { of } from 'rxjs';
        import { combineLatest } from 'rxjs';

        const a = of('1');
        const b = of('2');

        const source = combineLatest([a,b]);
        source.subscribe((n) => console.log(n));
        `
      },
      {
        subject: 'forkJoin',
        subjectSymbol: SubjectSymbols.function,
        subjectAction: 'multiple-arguments-deprecated',
        itemType: 'deprecation',
        breakingChangeVersion: '8',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.5.0/src/internal/observable/forkJoin.ts#L22',
        breakingChangeSubjectAction: 'multiple-arguments-removed',
        deprecationMsgCode: 'pass arguments in a single array instead',
        reason: `Creation operator forkJoin method arguments in an array instead of single arguments.
        They are technically easier to type.`,
        implication: `Deprecating the option to passe multiple observables
        to forkJoin means for the caller to use an array of observables instead.`,
        exampleBefore: `
        import { of } from 'rxjs';
        import { forkJoin } from 'rxjs';

        const a = of('1');
        const b = of('2');

        const source = forkJoin(a,b);
        source.subscribe((n) => console.log(n));
        `,
        exampleAfter: `
        import { of } from 'rxjs';
        import { forkJoin } from 'rxjs';

        const a = of('1');
        const b = of('2');

        const source = forkJoin([a,b]);
        source.subscribe((n) => console.log(n));
        `
      },
      {
        subject: 'partition',
        subjectSymbol: SubjectSymbols.function,
        subjectAction: 'deprecated',
        itemType: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.5.0/src/internal/operators/partition.ts#L54',
        breakingChangeVersion: '8',
        breakingChangeSubjectAction: 'removed',
        deprecationMsgCode: 'use the static partition instead',
        reason: `As partition operator is not compose able and it can anyway only be used to create the array it is deprecated.`,
        implication: 'The deprecation of the operator partition means for the caller to use creation method instead',
        exampleBefore: `
        import { of, Observable } from 'rxjs';
        import { partition } from 'rxjs/operators';

        const predicate = (n: number, i: number) => n % 2 < 0
        const a = of (1, 2, 3, 4);
        const result: [Observable<number>, Observable<number>] = a
        .pipe(
        partition(predicate)
        ) ;

        result[0].subscribe((n) => console.log('odd', n));
        result[1].subscribe((n) => console.log('even', n));
        `,
        exampleAfter: `
        import { of, Observable, partition } from 'rxjs';

        const predicate = (n: number, i: number) => n % 2 < 0
        const a = of(1, 2, 3, 4);
        const result: [Observable<number>, Observable<number>] = partition(a, predicate);

        result[0].subscribe((n) => console.log('odd', n));
        result[1].subscribe((n) => console.log('even', n));
        `
      }
    ],
    breakingChanges: []
  },
  {
    version: '6.5.1',
    date: '2019-04-23T03:40:26.583Z',
    sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.5.1',
    deprecations: [
      {
        subject: 'NotificationKind',
        subjectSymbol: SubjectSymbols.enum,
        subjectAction: 'deprecated',
        itemType: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/6.5.1/src/internal/Notification.ts#L10',
        breakingChangeVersion: '8',
        breakingChangeSubjectAction: 'removed',
        deprecationMsgCode: 'use a string literal instead of a const enum',
        reason: `NotificationKind is deprecated as const enums are not compatible with isolated modules. Use a string literal instead.`,
        implication: 'The deprecation of enum NotificationKind means for the caller to use string literals instead.',
        exampleBefore: `
        import { Notification, NotificationKind } from 'rxjs';

        const notification: Notification<any> = new Notification(NotificationKind.NEXT, undefined);;
        console.log(notification.kind);
        `,
        exampleAfter: `
        import { Notification } from 'rxjs';
        const notification: Notification<any> = new Notification('N', undefined);;
        console.log(notification.kind);
        `
      }
    ],
    breakingChanges: []
  },
  {
    version: '7.0.0-alpha.0',
    date: '2019-09-18T14:02:25.345Z',
    sourceLink: 'https://github.com/ReactiveX/rxjs/blob/7.0.0-alpha.0',
    deprecations: [
      {
        subject: 'concat',
        subjectSymbol: SubjectSymbols.function,
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
        subjectSymbol: SubjectSymbols.function,
        subjectAction: 'generic-argument-deprecated',
        itemType: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/7.0.0-alpha.0/src/internal/observable/of.ts#L35',
        breakingChangeVersion: '8',
        breakingChangeSubjectAction: 'generic-argument-removed',
        deprecationMsgCode: 'do not use generic arguments directly, allow inference or assert with `as`',
        reason: `As TypeScript 3.x allows better type inference directly applying generic arguments is no longer needed.`,
        implication: `The deprecation of generic arguments for the of creation operator means for the caller to delete
         them and let the type inference do the rest, or use 'as' to type it.`,
        exampleBefore: `
        import { of } from 'rxjs';

        const source = of<string>('1');
        source.subscribe((n) => console.log(n));
        `,
        exampleAfter: `
        import { of, Observable } from 'rxjs';

        const a = of('1');
        const b = of('1') as Observable<string>;
        a.subscribe((n) => console.log(n));
        b.subscribe((n) => console.log(n));
        `
      },
      {
        subject: 'of',
        subjectSymbol: SubjectSymbols.function,
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
        subjectSymbol: SubjectSymbols.function,
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
        subjectSymbol: SubjectSymbols.function,
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
        subjectSymbol: SubjectSymbols.function,
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
        subjectSymbol: SubjectSymbols.class,
        subjectAction: 'property-hotObservables-deprecated',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/7.0.0-alpha.0/src/internal/testing/TestScheduler.ts#L39',
        itemType: 'deprecation',
        breakingChangeVersion: '8',
        breakingChangeSubjectAction: 'property-hotObservables-to-private',
        deprecationMsgCode: getInternalDeprecationMsg('hotObservables'),
        reason: `TestScheduler deprecates public hotObservables property and makes it protected as it is meant to be used only internally.`,
        implication: `The deprecation of the property hotObservables in TestScheduler means
        the caller uses parts that should not be used outside.`
      },
      {
        subject: 'TestScheduler',
        subjectSymbol: SubjectSymbols.class,
        subjectAction: 'property-coldObservables-deprecated',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/7.0.0-alpha.0/src/internal/testing/TestScheduler.ts#L44',
        itemType: 'deprecation',
        breakingChangeVersion: '8',
        breakingChangeSubjectAction: 'property-coldObservables-to-private',
        deprecationMsgCode: getInternalDeprecationMsg('coldObservables'),
        reason: `TestScheduler deprecates public coldObservables
        property and makes it protected as it is meant to be used only internally.`,
        implication: `The deprecation of the property coldObservables in TestScheduler means
        the caller uses internal parts that should not be used outside.`
      },
      {
        subject: 'VirtualTimeScheduler',
        subjectSymbol: SubjectSymbols.class,
        subjectAction: 'property-frameTimeFactor-deprecated',
        itemType: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/7.0.0-alpha.0/src/internal/scheduler/VirtualTimeScheduler.ts#L8',
        breakingChangeVersion: '8',
        breakingChangeSubjectAction: 'property-frameTimeFactor-moved',
        deprecationMsgCode: 'it is no longer used directly',
        reason: `frameTimeFactor is not used in VirtualTimeScheduler directly. Therefore it does not belong here.`,
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
        subjectSymbol: SubjectSymbols.class,
        subjectAction: 'property-index-deprecated',
        itemType: 'deprecation',
        sourceLink: 'https://github.com/ReactiveX/rxjs/blob/7.0.0-alpha.0/src/internal/scheduler/VirtualTimeScheduler.ts#L23',
        breakingChangeVersion: '8',
        breakingChangeSubjectAction: 'property-index-to-private',
        deprecationMsgCode: getInternalDeprecationMsg('index'),
        reason: `index property of VirtualTimeScheduler is only used internally and should ot be used.`,
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
    version: '7.0.0',
    date: '2020-11-24T12:12:12.800Z',
    sourceLink: 'https://github.com/ReactiveX/rxjs/blob/7.0.0',
    deprecations: [],
    breakingChanges: [
      {
        subject: 'fromEventPattern',
        subjectSymbol: SubjectSymbols.function,
        subjectAction: 'argument-resultSelector-removed',
        itemType: 'breakingChange',
        deprecationVersion: '6.0.0-rc.0',
        deprecationSubjectAction: 'argument-resultSelector-deprecated',
        breakingChangeMsg: getResultSelectorBreakingChangeMsg('fromEventPattern')
      },
      {
        subject: 'fromEvent',
        subjectSymbol: SubjectSymbols.function,
        subjectAction: 'argument-resultSelector-removed',
        itemType: 'breakingChange',
        deprecationVersion: '6.0.0-rc.0',
        deprecationSubjectAction: 'argument-resultSelector-deprecated',
        breakingChangeMsg: getResultSelectorBreakingChangeMsg('fromEvent')
      },
      {
        subject: 'bindNodeCallback',
        subjectSymbol: SubjectSymbols.function,
        subjectAction: 'argument-resultSelector-removed',
        itemType: 'breakingChange',
        deprecationVersion: '6.0.0-rc.0',
        deprecationSubjectAction: 'argument-resultSelector-deprecated',
        breakingChangeMsg: getResultSelectorBreakingChangeMsg('bindNodeCallback')
      },
      {
        subject: 'bindCallback',
        subjectSymbol: SubjectSymbols.function,
        subjectAction: 'argument-resultSelector-removed',
        itemType: 'breakingChange',
        deprecationVersion: '6.0.0-rc.0',
        deprecationSubjectAction: 'argument-resultSelector-deprecated',
        breakingChangeMsg: getResultSelectorBreakingChangeMsg('bindCallback')
      },
      {
        subject: 'forkJoin',
        subjectSymbol: SubjectSymbols.function,
        subjectAction: 'argument-resultSelector-removed',
        itemType: 'breakingChange',
        deprecationVersion: '6.0.0-rc.0',
        deprecationSubjectAction: 'argument-resultSelector-deprecated',
        breakingChangeMsg: getResultSelectorBreakingChangeMsg('forkJoin')
      },
      {
        subject: 'zip',
        subjectSymbol: SubjectSymbols.function,
        subjectAction: 'argument-resultSelector-removed',
        itemType: 'breakingChange',
        deprecationVersion: '6.0.0-rc.0',
        deprecationSubjectAction: 'argument-resultSelector-deprecated',
        breakingChangeMsg: getResultSelectorBreakingChangeMsg('zip')
      },
      {
        subject: 'combineLatest',
        subjectSymbol: SubjectSymbols.function,
        subjectAction: 'argument-resultSelector-removed',
        itemType: 'breakingChange',
        deprecationVersion: '6.5.0',
        deprecationSubjectAction: 'argument-resultSelector-deprecated',
        breakingChangeMsg: getResultSelectorBreakingChangeMsg('combineLatest')
      },
      {
        subject: 'switchMap',
        subjectSymbol: SubjectSymbols.function,
        subjectAction: 'argument-resultSelector-removed',
        itemType: 'breakingChange',
        deprecationVersion: '6.0.0-rc.0',
        deprecationSubjectAction: 'argument-resultSelector-deprecated',
        breakingChangeMsg: getResultSelectorBreakingChangeMsg('switchMap')
      },
      {
        subject: 'switchMapTo',
        subjectSymbol: SubjectSymbols.function,
        subjectAction: 'argument-resultSelector-removed',
        itemType: 'breakingChange',
        deprecationVersion: '6.0.0-rc.0',
        deprecationSubjectAction: 'argument-resultSelector-deprecated',
        breakingChangeMsg: getResultSelectorBreakingChangeMsg('switchMapTo')
      },
      {
        subject: 'concatMap',
        subjectSymbol: SubjectSymbols.function,
        subjectAction: 'argument-resultSelector-removed',
        itemType: 'breakingChange',
        deprecationVersion: '6.0.0-rc.0',
        deprecationSubjectAction: 'argument-resultSelector-deprecated',
        breakingChangeMsg: getResultSelectorBreakingChangeMsg('concatMap')
      },
      {
        subject: 'concatMapTo',
        subjectSymbol: SubjectSymbols.function,
        subjectAction: 'argument-resultSelector-removed',
        itemType: 'breakingChange',
        deprecationVersion: '6.0.0-rc.0',
        deprecationSubjectAction: 'argument-resultSelector-deprecated',
        breakingChangeMsg: getResultSelectorBreakingChangeMsg('concatMapTo')
      },
      {
        subject: 'mergeMap',
        subjectSymbol: SubjectSymbols.function,
        subjectAction: 'argument-resultSelector-removed',
        itemType: 'breakingChange',
        deprecationVersion: '6.0.0-rc.0',
        deprecationSubjectAction: 'argument-resultSelector-deprecated',
        breakingChangeMsg: getResultSelectorBreakingChangeMsg('mergeMap')
      },
      {
        subject: 'mergeMapTo',
        subjectSymbol: SubjectSymbols.function,
        subjectAction: 'argument-resultSelector-removed',
        itemType: 'breakingChange',
        deprecationVersion: '6.0.0-rc.0',
        deprecationSubjectAction: 'argument-resultSelector-deprecated',
        breakingChangeMsg: getResultSelectorBreakingChangeMsg('mergeMapTo')
      },
      {
        subject: 'exhaustMap',
        subjectSymbol: SubjectSymbols.function,
        subjectAction: 'argument-resultSelector-removed',
        itemType: 'breakingChange',
        deprecationVersion: '6.0.0-rc.0',
        deprecationSubjectAction: 'argument-resultSelector-deprecated',
        breakingChangeMsg: getResultSelectorBreakingChangeMsg('exhaustMap')
      },
      {
        subject: 'merge',
        subjectSymbol: SubjectSymbols.function,
        subjectAction: 'removed',
        itemType: 'breakingChange',
        deprecationVersion: '6.0.0-rc.0',
        deprecationSubjectAction: 'deprecated',
        breakingChangeMsg: getOperatorRemovedBreakingChangePhrase('merge')
      },
      {
        subject: 'zip',
        subjectSymbol: SubjectSymbols.function,
        subjectAction: 'removed',
        deprecationVersion: '6.0.0-rc.0',
        itemType: 'breakingChange',
        deprecationSubjectAction: 'deprecated',
        breakingChangeMsg: getOperatorRemovedBreakingChangePhrase('zip')
      },
      {
        subject: 'concat',
        subjectSymbol: SubjectSymbols.function,
        subjectAction: 'removed',
        deprecationVersion: '6.0.0-rc.0',
        itemType: 'breakingChange',
        deprecationSubjectAction: 'deprecated',
        breakingChangeMsg: getOperatorRemovedBreakingChangePhrase('concat')
      },
      {
        subject: 'combineLatest',
        subjectSymbol: SubjectSymbols.function,
        subjectAction: 'removed',
        itemType: 'breakingChange',
        deprecationVersion: '6.0.0-rc.0',
        deprecationSubjectAction: 'deprecated',
        breakingChangeMsg: getOperatorRemovedBreakingChangePhrase('combineLatest')
      },
      {
        subject: 'Observable',
        subjectSymbol: SubjectSymbols.class,
        subjectAction: 'static-property-if-removed',
        itemType: 'breakingChange',
        deprecationVersion: '6.0.0-rc.1',
        deprecationSubjectAction: 'static-property-if-deprecated',
        breakingChangeMsg: 'Class Observable removed if property.'
      },
      {
        subject: 'Observable',
        subjectSymbol: SubjectSymbols.class,
        subjectAction: 'static-property-throw-removed',
        itemType: 'breakingChange',
        deprecationVersion: '6.0.0-rc.1',
        deprecationSubjectAction: 'static-property-throw-deprecated',
        breakingChangeMsg: 'Class Observable removed throw property.'
      },
      {
        subject: 'race',
        subjectSymbol: SubjectSymbols.function,
        subjectAction: 'removed',
        deprecationVersion: '6.2.0',
        itemType: 'breakingChange',
        deprecationSubjectAction: 'deprecated',
        breakingChangeMsg: getOperatorRemovedBreakingChangePhrase('race')
      },
      {
        subject: 'Scheduler',
        subjectSymbol: SubjectSymbols.class,
        subjectAction: 'to-private',
        itemType: 'breakingChange',
        deprecationVersion: '6.0.0-tactical-rc.1',
        deprecationSubjectAction: 'deprecated',
        breakingChangeMsg: 'The access modifier of class Scheduler is now private'
      }
    ]
  },
  {
    version: '8.0.0',
    date: '2020-12-24T12:12:12.800Z',
    sourceLink: 'https://github.com/ReactiveX/rxjs/blob/8.0.0',
    deprecations: [],
    breakingChanges: [
      {
        subject: 'WebSocketSubject',
        subjectSymbol: SubjectSymbols.class,
        subjectAction: 'argument-resultSelector-removed',
        itemType: 'breakingChange',
        deprecationVersion: '6.0.0-beta.4',
        deprecationSubjectAction: 'argument-resultSelector-deprecated',
        breakingChangeMsg: 'Class WebSocketSubject removed resultSelector.'
      },
      {
        subject: 'combineLatest',
        subjectSymbol: SubjectSymbols.function,
        subjectAction: 'argument-scheduler-removed',
        itemType: 'breakingChange',
        deprecationVersion: '6.5.0',
        deprecationSubjectAction: 'argument-scheduler-deprecated',
        breakingChangeMsg: getOperatorRemovedBreakingChangePhrase('combineLatest')
      },
      {
        subject: 'combineLatest',
        subjectSymbol: SubjectSymbols.function,
        subjectAction: 'multiple-arguments-removed',
        itemType: 'breakingChange',
        deprecationVersion: '6.5.0',
        deprecationSubjectAction: 'multiple-arguments-deprecated',
        breakingChangeMsg: getOperatorRemovedMultipleArgumentsBreakingChangeMsg('combineLatest')
      },
      {
        subject: 'forkJoin',
        subjectSymbol: SubjectSymbols.function,
        subjectAction: 'multiple-arguments-removed',
        itemType: 'breakingChange',
        deprecationVersion: '6.5.0',
        deprecationSubjectAction: 'multiple-arguments-deprecated',
        breakingChangeMsg: getOperatorRemovedMultipleArgumentsBreakingChangeMsg('forkJoin')
      },
      {
        subject: 'from',
        subjectSymbol: SubjectSymbols.function,
        subjectAction: 'argument-scheduler-removed',
        itemType: 'breakingChange',
        deprecationVersion: '6.5.0',
        deprecationSubjectAction: 'argument-scheduler-deprecated',
        breakingChangeMsg: getOperatorRemovedBreakingChangePhrase('from')
      },
      {
        subject: 'never',
        subjectSymbol: SubjectSymbols.function,
        subjectAction: 'removed',
        itemType: 'breakingChange',
        deprecationVersion: '6.0.0-beta.4',
        deprecationSubjectAction: 'deprecated',
        breakingChangeMsg: getOperatorRemovedInFavourOfBreakingChangePhrase('never', 'NEVER')
      },
      {
        subject: 'empty',
        subjectSymbol: SubjectSymbols.function,
        subjectAction: 'removed',
        itemType: 'breakingChange',
        deprecationVersion: '6.0.0-beta.4',
        deprecationSubjectAction: 'deprecated',
        breakingChangeMsg: getOperatorRemovedInFavourOfBreakingChangePhrase('empty', 'EMPTY')
      },
      {
        subject: 'partition',
        subjectSymbol: SubjectSymbols.function,
        subjectAction: 'removed',
        itemType: 'breakingChange',
        deprecationVersion: '6.5.0',
        deprecationSubjectAction: 'deprecated',
        breakingChangeMsg: getOperatorRemovedBreakingChangePhrase('partition')
      },
      {
        subject: 'NotificationKind',
        subjectSymbol: SubjectSymbols.enum,
        subjectAction: 'removed',
        itemType: 'breakingChange',
        deprecationVersion: '6.5.1',
        deprecationSubjectAction: 'deprecated',
        breakingChangeMsg: getOperatorRemovedBreakingChangePhrase('NotificationKind')
      },
      {
        subject: 'ObservableLike',
        subjectSymbol: SubjectSymbols.interface,
        subjectAction: 'removed',
        itemType: 'breakingChange',
        deprecationVersion: '6.1.0',
        deprecationSubjectAction: 'deprecated',
        breakingChangeMsg: getInterfaceRemovedInFavourOfBreakingChangePhrase('ObservableLike', ' InteropObservable')
      },
      {
        subject: 'TimeInterval',
        subjectSymbol: SubjectSymbols.class,
        subjectAction: 'to-private',
        itemType: 'breakingChange',
        deprecationVersion: '6.4.0',
        deprecationSubjectAction: 'deprecated',
        breakingChangeMsg: 'The access modifier of class TimeInterval is now private'
      },
      {
        subject: 'concat',
        subjectSymbol: SubjectSymbols.function,
        subjectAction: 'scheduler-removed',
        itemType: 'breakingChange',
        deprecationVersion: '7.0.0-alpha.0',
        deprecationSubjectAction: 'scheduler',
        breakingChangeMsg: getGeneralSchedulerArgumentBreakingChangePhrase()
      },
      {
        subject: 'of',
        subjectSymbol: SubjectSymbols.function,
        subjectAction: 'scheduler-removed',
        itemType: 'breakingChange',
        deprecationVersion: '7.0.0-alpha.0',
        deprecationSubjectAction: 'scheduler',
        breakingChangeMsg: getGeneralSchedulerArgumentBreakingChangePhrase()
      },
      {
        subject: 'merge',
        subjectSymbol: SubjectSymbols.function,
        subjectAction: 'scheduler-removed',
        itemType: 'breakingChange',
        deprecationVersion: '7.0.0-alpha.0',
        deprecationSubjectAction: 'scheduler',
        breakingChangeMsg: getGeneralSchedulerArgumentBreakingChangePhrase()
      },
      {
        subject: 'startWith',
        subjectSymbol: SubjectSymbols.function,
        subjectAction: 'scheduler-removed',
        itemType: 'breakingChange',
        deprecationVersion: '7.0.0-alpha.0',
        deprecationSubjectAction: 'scheduler',
        breakingChangeMsg: getGeneralSchedulerArgumentBreakingChangePhrase()
      },
      {
        subject: 'endWith',
        subjectSymbol: SubjectSymbols.function,
        subjectAction: 'scheduler-removed',
        itemType: 'breakingChange',
        deprecationVersion: '7.0.0-alpha.0',
        deprecationSubjectAction: 'scheduler',
        breakingChangeMsg: getGeneralSchedulerArgumentBreakingChangePhrase()
      },
      {
        subject: 'TestScheduler',
        subjectSymbol: SubjectSymbols.class,
        subjectAction: 'property-hotObservables-to-private',
        itemType: 'breakingChange',
        deprecationVersion: '7.0.0-alpha.0',
        deprecationSubjectAction: 'property-hotObservables-deprecated',
        breakingChangeMsg: 'The access modifier of TestScheduler property hotObservables is now private'
      },
      {
        subject: 'TestScheduler',
        subjectSymbol: SubjectSymbols.class,
        subjectAction: 'property-coldObservables-to-private',
        itemType: 'breakingChange',
        deprecationVersion: '7.0.0-alpha.0',
        deprecationSubjectAction: 'property-coldObservables-deprecated',
        breakingChangeMsg: 'The access modifier of TestScheduler property coldObservables is now private'
      },
      {
        subject: 'VirtualTimeScheduler',
        subjectSymbol: SubjectSymbols.class,
        subjectAction: 'property-frameTimeFactor-moved',
        itemType: 'breakingChange',
        deprecationVersion: '7.0.0-alpha.0',
        deprecationSubjectAction: 'property-frameTimeFactor-deprecated',
        breakingChangeMsg: 'Class `VirtualTimeScheduler` moved `frameTimeFactor` out of class.'
      },
      {
        subject: 'VirtualTimeScheduler',
        subjectSymbol: SubjectSymbols.class,
        subjectAction: 'property-index-to-private',
        itemType: 'breakingChange',
        deprecationVersion: '7.0.0-alpha.0',
        deprecationSubjectAction: 'property-index-deprecated',
        breakingChangeMsg: 'Class `VirtualTimeScheduler` made `index` property private.'
      },
      {
        subject: 'Observable',
        subjectSymbol: SubjectSymbols.class,
        subjectAction: 'subscribe-argument-nextCallback-removed',
        itemType: 'breakingChange',
        deprecationVersion: '6.4.0',
        deprecationSubjectAction: 'subscribe-argument-nextCallback-deprecated',
        breakingChangeMsg: getGeneralObserverCallbackBreakingChangeMsg('Observable', 'next')
      },
      {
        subject: 'Observable',
        subjectSymbol: SubjectSymbols.class,
        subjectAction: 'subscribe-argument-errorCallback-removed',
        itemType: 'breakingChange',
        deprecationVersion: '6.4.0',
        deprecationSubjectAction: 'subscribe-argument-errorCallback-deprecated',
        breakingChangeMsg: getGeneralObserverCallbackBreakingChangeMsg('Observable', 'error')
      },
      {
        subject: 'Observable',
        subjectSymbol: SubjectSymbols.class,
        subjectAction: 'subscribe-argument-completeCallback-removed',
        itemType: 'breakingChange',
        deprecationVersion: '6.4.0',
        deprecationSubjectAction: 'subscribe-argument-completeCallback-deprecated',
        breakingChangeMsg: getGeneralObserverCallbackBreakingChangeMsg('Observable', 'complete')
      },
      {
        subject: 'tap',
        subjectSymbol: SubjectSymbols.function,
        subjectAction: 'argument-nextCallback-removed',
        itemType: 'breakingChange',
        deprecationVersion: '6.4.0',
        deprecationSubjectAction: 'argument-nextCallback-deprecated',
        breakingChangeMsg: getGeneralObserverCallbackBreakingChangeMsg('tap', 'next')
      },
      {
        subject: 'tap',
        subjectSymbol: SubjectSymbols.function,
        subjectAction: 'argument-errorCallback-removed',
        itemType: 'breakingChange',
        deprecationVersion: '6.4.0',
        deprecationSubjectAction: 'argument-errorCallback-deprecated',
        breakingChangeMsg: getGeneralObserverCallbackBreakingChangeMsg('tap', 'error')
      },
      {
        subject: 'tap',
        subjectSymbol: SubjectSymbols.function,
        subjectAction: 'argument-completeCallback-removed',
        itemType: 'breakingChange',
        deprecationVersion: '6.4.0',
        deprecationSubjectAction: 'argument-completeCallback-deprecated',
        breakingChangeMsg: getGeneralObserverCallbackBreakingChangeMsg('tap', 'complete')
      },
      {
        subject: 'of',
        subjectSymbol: SubjectSymbols.function,
        subjectAction: 'generic-argument-removed',
        itemType: 'breakingChange',
        deprecationVersion: '7.0.0-alpha.0',
        deprecationSubjectAction: 'generic-argument-deprecated',
        breakingChangeMsg: 'Creation operator of removed generic arguments'
      },
      {
        subject: 'Observable',
        subjectSymbol: SubjectSymbols.class,
        subjectAction: 'property-create-removed',
        itemType: 'breakingChange',
        deprecationVersion: '6.4.0',
        deprecationSubjectAction: 'property-create-deprecated',
        breakingChangeMsg: 'Class Observable removed property create'
      },
      {
        subject: '$$rxSubscriber',
        subjectSymbol: SubjectSymbols.symbol,
        subjectAction: 'removed',
        itemType: 'breakingChange',
        deprecationVersion: '5.3.0',
        deprecationSubjectAction: 'deprecated',
        breakingChangeMsg: 'Symbol $$rxSubscriber removed in favour of rxSubscriber'
      },
      {
        subject: 'SubscribeOnObservable',
        subjectSymbol: SubjectSymbols.class,
        subjectAction: 'method-subscribe-to-private',
        itemType: 'breakingChange',
        deprecationVersion: '6.0.0-tenacious-rc.2',
        deprecationSubjectAction: 'method-subscribe-deprecated',
        breakingChangeMsg: 'Made private because of internal use only'
      }
    ]
  }
];

// GENERAL

function getInternalDeprecationMsg(name: string) {
  return `${name} it is meant to be used only internally.`;
}

function getInternalReason(name: string) {
  return `${name} was meant to be used only internally.`;
}

function getInternalImplication() {
  return `The deprecation means the caller uses internal parts.`;
}

function getOperatorRemovedMultipleArgumentsBreakingChangeMsg(operatorName: string, arg?: string) {
  return `${operatorName} removed the option to pass multiple arguments`;
}

function getOperatorRemovedBreakingChangePhrase(operatorName: string, arg?: string) {
  return `Operator ${operatorName} removed`;
}

function getOperatorRemovedInFavourOfBreakingChangePhrase(operatorName: string, arg?: string) {
  return `Operator ${operatorName} is removed in favour of ${arg}`;
}

function getInterfaceRemovedInFavourOfBreakingChangePhrase(interfaceName: string, arg?: string) {
  return `Interface ${interfaceName} is removed in favour of ${arg}`;
}

// OBSERVE CALLBACKS

function getGeneralObserverCallbackBreakingChangeMsg(operatorName: string, arg: string) {
  return `Class Observable removed the ${arg} callback argument of the subscribe method.`;
}

function getGeneralObserverCallbackDeprecationMsgCode(operatorName?: string, arg?: string) {
  return 'use an observer instead of a separate callback';
}

function getGeneralObserverCallbackReason(operatorName?: string, arg?: string) {
  return `The Observer object is more explicit and passing null values for unused callbacks can be avoided.

 Furthermore, technically supporting both observers and individual callbacks is a pain.
 This deprecation will maybe get rolled back depending on official specification of Observables.`;
}

function getOperatorGeneralObserverCallbackImplication(operatorName?: string, arg?: string) {
  return `The removal of observer callback arguments means for the caller to use and Observer object instead.`;
}


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

function getNameDupleOperatorDeprecationMsgCode(operatorName: string): string {
  return `use the static ${operatorName} instead`;
}

function getNameDupleOperatorReason(operatorName: string): string {
  return `As ${operatorName} operator is a name duplicate of the static
         function ${operatorName} it gets deprecated.
         In future releases it will most probably be available under ${operatorName}With.`;
}

function getNameDupleOperatorImplication(opr: string, arg: string): string {
  return `For ${opr}, the removal of the resultSelector argument means that if callers want to
   "compose in" another observable the observable to compose and
   the other code need to get composed by the equivalent a creation method ${arg}.`;
}

// RESULT_SELECTOR

function getResultSelectorBreakingChangeMsg(opr: string): string {
  return `Operator ${opr} removed the resultSelector argument`;
}

function getResultSelectorReason(operatorName: string): string {
  return `By removing the result selector from ${operatorName} we get a smaller bundle since and better maintainability.
          Refactoring to use a map operation instead.`;
}

function getResultSelectorImplication(opr: string): string {
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

function getMapToOperatorResultSelectorDeprecationMsgCode(operatorName?: string, arg?: string): string {
  return ` use ${arg} with an inner map instead of a result selector`;
}
