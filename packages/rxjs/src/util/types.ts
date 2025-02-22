// COPYRIGHT (c) 2025 Ben Lesh <ben@benlesh.com> All rights reserved
export type ObservedValueOf<T> = T extends ObservableValue<infer R> ? R : never;

export type ObservableArrayToValueArray<
  Sources extends readonly ObservableValue<any>[]
> = {
  [K in keyof Sources]: Sources[K] extends ObservableValue<infer T> ? T : never;
};

export type ObservableArrayToValueUnion<
  T extends readonly ObservableValue<any>[]
> = T extends ObservableValue<infer R>[] ? R : never;

export interface SubjectLike<In, Out = In>
  extends Subscribable<Out>,
    Observer<In> {
  readonly active: boolean;
}
