

- 
  - https://github.com/ReactiveX/rxjs/blob/6.0.0-tenacious-rc.2/src/internal/observable/SubscribeOnObservable.ts#L42
- 6.0.0-tenacious-rc.2_deprecation-class-AjaxObservable
  - https://github.com/ReactiveX/rxjs/blob/6.0.0-tenacious-rc.2/src/internal/observable/dom/AjaxObservable.ts#L182
- 6.0.0-tenacious-rc.2_deprecation-class-Subscriber
  - https://github.com/ReactiveX/rxjs/blob/6.0.0-tenacious-rc.2/src/internal/Subscriber.ts#L155
- 6.0.0-tenacious-rc.2_deprecation-class-TimeoutWithSubscriber
  - https://github.com/ReactiveX/rxjs/blob/6.0.0-tenacious-rc.2/src/internal/operators/timeoutWith.ts#L132
- 6.0.0-tenacious-rc.2_deprecation-class-ConnectableObservable
  - https://github.com/ReactiveX/rxjs/blob/6.0.0-tenacious-rc.2/src/internal/observable/ConnectableObservable.ts#L25
- 6.0.0-tenacious-rc.2_deprecation-class-RepeatWhenSubscriber
  - https://github.com/ReactiveX/rxjs/blob/6.0.0-tenacious-rc.2/src/internal/operators/repeatWhen.ts#L89
- 6.0.0-tenacious-rc.2_deprecation-class-RepeatWhenSubscriber
  - https://github.com/ReactiveX/rxjs/blob/6.0.0-tenacious-rc.2/src/internal/operators/repeatWhen.ts#L103
- 6.0.0-tenacious-rc.2_deprecation-class-WindowToggleSubscriber
  - https://github.com/ReactiveX/rxjs/blob/6.0.0-tenacious-rc.2/src/internal/operators/windowToggle.ts#L137
- 6.0.0-tenacious-rc.2_deprecation-class-WindowSubscriber
  - https://github.com/ReactiveX/rxjs/blob/6.0.0-tenacious-rc.2/src/internal/operators/window.ts#L109
- 6.0.0-tenacious-rc.2_deprecation-class-GroupBySubscriber
  - https://github.com/ReactiveX/rxjs/blob/6.0.0-tenacious-rc.2/src/internal/operators/groupBy.ts#L237
- 6.0.0-tenacious-rc.2_deprecation-class-GroupedObservable
  - https://github.com/ReactiveX/rxjs/blob/6.0.0-tenacious-rc.2/src/internal/operators/groupBy.ts#L262
- 6.0.0-tenacious-rc.2_deprecation-class-BufferWhenSubscriber
  - https://github.com/ReactiveX/rxjs/blob/6.0.0-tenacious-rc.2/src/internal/operators/bufferWhen.ts#L88
- 6.0.0-tenacious-rc.2_deprecation-class-BufferTimeSubscriber
  - https://github.com/ReactiveX/rxjs/blob/6.0.0-tenacious-rc.2/src/internal/operators/bufferTime.ts#L173
- 6.0.0-tenacious-rc.2_deprecation-class-AsyncAction
  - https://github.com/ReactiveX/rxjs/blob/6.0.0-tenacious-rc.2/src/internal/scheduler/AsyncAction.ts#L132
- 6.0.0-tenacious-rc.2_deprecation-class-Subscriber
  - https://github.com/ReactiveX/rxjs/blob/6.0.0-tenacious-rc.2/src/internal/Subscriber.ts#L155
- 6.0.0-tenacious-rc.2_deprecation-class-Subject
  - https://github.com/ReactiveX/rxjs/blob/6.0.0-tenacious-rc.2/src/internal/Subject.ts#L103
- 6.0.0-tenacious-rc.2_deprecation-class-Subject
  - https://github.com/ReactiveX/rxjs/blob/6.0.0-tenacious-rc.2/src/internal/Subject.ts#L112
- 6.0.0-tenacious-rc.2_deprecation-class-BehaviorSubject
  - https://github.com/ReactiveX/rxjs/blob/6.0.0-tenacious-rc.2/src/internal/BehaviorSubject.ts#L20
- 6.0.0-tenacious-rc.2_deprecation-class-AsyncScheduler
  - https://github.com/ReactiveX/rxjs/blob/6.1.0/src/internal/scheduler/AsyncScheduler.ts#L14
- 6.0.0-tenacious-rc.2_deprecation-class-AsyncScheduler
  - https://github.com/ReactiveX/rxjs/blob/6.1.0/src/internal/scheduler/AsyncScheduler.ts#L22
- 6.0.0-turbo-rc.4_deprecation-class-GroupedObservable
  - https://github.com/ReactiveX/rxjs/blob/6.0.0-turbo-rc.4/src/internal/operators/groupBy.ts#L256
- 6.2.1_deprecation-function-delayWhen
  - https://github.com/ReactiveX/rxjs/blob/6.2.1/src/internal/operators/delayWhen.ts#L11
- 6.3.3_deprecation-const-rxSubscriber
  - https://github.com/ReactiveX/rxjs/blob/6.3.3/src/internal/symbol/rxSubscriber.ts#L1
- 6.4.0_deprecation-class-Subject
  - https://github.com/ReactiveX/rxjs/blob/6.4.0/src/internal/Subject.ts#L49
- 6.4.0_deprecation-interface-Subscribable
  - https://github.com/ReactiveX/rxjs/blob/6.4.0/src/internal/types.ts#L43
- 6.4.0_deprecation-interface-Subscribable
  - https://github.com/ReactiveX/rxjs/blob/6.4.0/src/internal/types.ts#L45
- 6.4.0_deprecation-interface-Subscribable
  - https://github.com/ReactiveX/rxjs/blob/6.4.0/src/internal/types.ts#L48



# MigrationTimeLine Container Component

The migration timeline container takes over the following things: 

- react to URL changes and map it to component state
As we can not control the URL we have to introduce some parsing in between URL change and component state update: 
  - ensure proper release UID (parsing, searching for latest release)
  - ensure proper item UID (parsing, search for relevant release item)
  
- react to migration data changes and map it to component state (as we have no backend this happens only once from static data)
  - calculate UID`s linking and Date formatting

- react to UI interaction and trigger navigation (URL is leading and reflected in the component state)
  - release selection 
  - item selection

The UI consists out of:
- A navigation bar that enables us to navigate between release versions
- A list of releases that displays all information related to the release including a list of deprecations ect..

# MigrationTimeLine Container Component