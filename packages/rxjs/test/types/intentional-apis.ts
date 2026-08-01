import {
  AsyncSubject,
  ColdObservable,
  PerSubscriptionSubjectBase,
  Subject,
  behaviorSubject,
  replaySubject,
  type ReplaySubjectConfig,
} from 'rxjs';
import { ColdObservable as ColdObservableSubpath } from 'rxjs/cold-observable';
import { map } from 'rxjs/map';
import { PerSubscriptionSubjectBase as PerSubscriptionSubjectBaseSubpath } from 'rxjs/per-subscription-subject-base';
import { pipe } from 'rxjs/pipe';
import { Subject as SubjectSubpath } from 'rxjs/subject';

const cold = new ColdObservable<number>((subscriber) => {
  subscriber.next(1);
  subscriber.complete();
});
const coldFromSubpath: ColdObservable<number> = new ColdObservableSubpath<number>(() => {});

// Symbol extensions expose the platform Observable result type. The runtime
// creation protocol still preserves ColdObservable's producer-per-subscription
// construction policy, which is covered by focused behavior tests.
const coldSymbolResult: Observable<string> = cold[map]((value) => String(value));
const coldPipeResult: Observable<string> = cold[pipe]((source) => source[map]((value) => String(value)));

const subject: Subject<number> = new SubjectSubpath<number>();
const subjectView: Observable<number> = subject.asObservable();
const asyncSubject = new AsyncSubject<number>();
const asyncSubjectView: Observable<number> = asyncSubject.asObservable();

const behavior: PerSubscriptionSubjectBase<number> = behaviorSubject(0);
const replayConfig: ReplaySubjectConfig = { maxAge: 1_000, size: 2 };
const replay: PerSubscriptionSubjectBase<number> = replaySubject<number>(replayConfig);

class CustomPerSubscriptionSubject extends PerSubscriptionSubjectBaseSubpath<number> {
  constructor() {
    super();
  }
}

const custom: PerSubscriptionSubjectBase<number> = new CustomPerSubscriptionSubject();
const staticPipeResult: Observable<string> = Observable[pipe]([1, 2], (source) =>
  source[map]((value) => String(value))
);

void coldFromSubpath;
void coldSymbolResult;
void coldPipeResult;
void subjectView;
void asyncSubjectView;
void behavior;
void replay;
void custom;
void staticPipeResult;
