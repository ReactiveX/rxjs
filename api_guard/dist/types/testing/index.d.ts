export interface RunHelpers {
    cold: typeof TestScheduler.prototype.createColdObservable;
    expectObservable: typeof TestScheduler.prototype.expectObservable;
    expectSubscriptions: typeof TestScheduler.prototype.expectSubscriptions;
    flush: typeof TestScheduler.prototype.flush;
    hot: typeof TestScheduler.prototype.createHotObservable;
    time: typeof TestScheduler.prototype.createTime;
}

export declare class TestScheduler extends VirtualTimeScheduler {
    assertDeepEqual: (actual: any, expected: any) => boolean | void;
    readonly coldObservables: ColdObservable<any>[];
    readonly hotObservables: HotObservable<any>[];
    constructor(assertDeepEqual: (actual: any, expected: any) => boolean | void);
    createColdObservable<T = string>(marbles: string, values?: {
        [marble: string]: T;
    }, error?: any): ColdObservable<T>;
    createHotObservable<T = string>(marbles: string, values?: {
        [marble: string]: T;
    }, error?: any): HotObservable<T>;
    createTime(marbles: string): number;
    expectObservable(observable: Observable<any>, subscriptionMarbles?: string | null): ({
        toBe: observableToBeFn;
    });
    expectSubscriptions(actualSubscriptionLogs: SubscriptionLog[]): ({
        toBe: subscriptionLogsToBeFn;
    });
    flush(): void;
    run<T>(callback: (helpers: RunHelpers) => T): T;
    static frameTimeFactor: number;
    static parseMarbles(marbles: string, values?: any, errorValue?: any, materializeInnerObservables?: boolean, runMode?: boolean): TestMessage[];
    static parseMarblesAsSubscriptions(marbles: string | null, runMode?: boolean): SubscriptionLog;
}
