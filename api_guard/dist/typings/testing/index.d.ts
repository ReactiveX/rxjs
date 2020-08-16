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
    expectObservable(observable: Observable<any>, subscriptionMarbles?: string): ({
        toBe: observableToBeFn;
    });
    expectSubscriptions(actualSubscriptionLogs: SubscriptionLog[]): ({
        toBe: subscriptionLogsToBeFn;
    });
    flush(): void;
    run<T>(callback: (helpers: RunHelpers) => T): T;
    static parseMarbles(marbles: string, values?: any, errorValue?: any, materializeInnerObservables?: boolean, runMode?: boolean): TestMessage[];
    static parseMarblesAsSubscriptions(marbles: string, runMode?: boolean): SubscriptionLog;
}
