export declare function webSocket<In, Out = In>(urlConfigOrSource: string | WebSocketSubjectConfig<In, Out>): WebSocketSubject<In, Out>;

export declare class WebSocketSubject<In, Out = In> extends Observable<Out> implements Observer<In> {
    destination?: Observer<In>;
    constructor(urlConfigOrSource: string | WebSocketSubjectConfig<In, Out> | Observable<In>, destination?: Observer<In>);
    complete(): void;
    error(err: any): void;
    lift<R>(operator: Operator<In, R>): WebSocketSubject<R>;
    multiplex(subMsg: () => any, unsubMsg: () => any, messageFilter: (value: Out) => boolean): Observable<Out>;
    next(value: In): void;
    unsubscribe(): void;
}

export interface WebSocketSubjectConfig<In, Out = In> {
    WebSocketCtor?: {
        new (url: string, protocols?: string | string[]): WebSocket;
    };
    binaryType?: 'blob' | 'arraybuffer';
    closeObserver?: NextObserver<CloseEvent>;
    closingObserver?: NextObserver<void>;
    deserializer?: (e: MessageEvent) => Out;
    openObserver?: NextObserver<Event>;
    protocol?: string | Array<string>;
    resultSelector?: (e: MessageEvent) => Out;
    serializer?: (value: In) => WebSocketMessage;
    url: string;
}
