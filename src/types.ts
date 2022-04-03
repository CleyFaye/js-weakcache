export type KeyType = string | number;

export interface Cache<ValueType> {
  get(key: KeyType): ValueType | undefined;
  set(key: KeyType, value?: ValueType): void;
  clear(): void;
}
