export declare function webSocket<T>(urlConfigOrSource: string | WebSocketSubjectConfig<T>): WebSocketSubject<T>;

export declare class WebSocketSubject<T> extends AnonymousSubject<T> {
    constructor(urlConfigOrSource: string | WebSocketSubjectConfig<T> | Observable<T>, destination?: Observer<T>);
    lift<R>(operator: Operator<T, R>): WebSocketSubject<R>;
    multiplex(subMsg: () => any, unsubMsg: () => any, messageFilter: (value: T) => boolean): Observable<T>;
    unsubscribe(): void;
}

export interface WebSocketSubjectConfig<T> {
    WebSocketCtor?: {
        new (url: string, protocols?: string | string[]): WebSocket;
    };
    binaryType?: 'blob' | 'arraybuffer';
    closeObserver?: NextObserver<CloseEvent>;
    closingObserver?: NextObserver<void>;
    deserializer?: (e: MessageEvent) => T;
    openObserver?: NextObserver<Event>;
    protocol?: string | Array<string>;
    resultSelector?: (e: MessageEvent) => T;
    serializer?: (value: T) => WebSocketMessage;
    url: string;
}
