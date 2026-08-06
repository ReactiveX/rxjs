export type ObservedValueOf<T> = T extends ObservableInput<infer R> ? R : never;

export type ObservableArrayToValueArray<Sources extends readonly ObservableInput<any>[]> = {
  [K in keyof Sources]: Sources[K] extends ObservableInput<infer T> ? T : never;
};

export type ObservableArrayToValueUnion<T extends readonly ObservableInput<any>[]> = T extends ObservableInput<infer R>[] ? R : never;

export interface SubjectLike<In, Out = In> extends Subscribable<Out>, Observer<In> {
  readonly active: boolean;
}
