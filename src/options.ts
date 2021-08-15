export abstract class Option<T> {
  /**
   * Create a new option from the value
   *
   * @param value
   * @returns
   */
  static from<T>(value: T | undefined): Option<T> {
    if (value === undefined) return new None();
    return new Some(value);
  }

  protected abstract readonly _hasValue: boolean;
  protected abstract _value: T | undefined = undefined;

  /**
   * Map the value
   *
   * @param mapFn
   * @returns
   */
  map<U>(mapFn: (item: T) => U): Option<U> {
    if (this.isNone()) return this;
    return new Some(mapFn(this._value!));
  }

  /**
   * Flat map the value
   *
   * @param mapFn
   * @returns
   */
  flatMap<U>(mapFn: (item: T) => Option<U>): Option<U> {
    if (this.isNone()) return this;
    return mapFn(this._value!);
  }

  /**
   * Map the none side of this option
   *
   * @param mapFn
   * @returns
   */
  mapNone<U>(mapFn: () => U): Option<T | U> {
    if (this.isNone()) return new Some(mapFn());
    return this;
  }


  /**
   * Map the none side of this option
   *
   * @param mapFn
   * @returns
   */
  flatMapNone<U>(mapFn: () => Option<U>): Option<T | U> {
    if (this.isNone()) return mapFn();
    return this;
  }

  /**
   *
   * @param filterFn
   * @returns
   */
  filter(filterFn: (item: T) => boolean): Option<T> {
    if (this.isNone()) return this;
    if (filterFn(this._value!)) return this;
    return new None();
  }

  /**
   * Filter out the specific value
   *
   * @param value
   */
  exclude(value: T): Option<T> {
    return this.filter((item) => item !== value);
  }

  /**
   * Unwrap, throwing an error if is none
   *
   * @returns
   */
  unwrap(): T {
    if (!this._hasValue) throw new TypeError('value is None');
    return this._value!;
  }

  /**
   * Get the value, if its defined
   *
   * @returns
   */
  getValue(): T | undefined {
    if (!this._hasValue) return undefined;
    return this._value!;
  }

  /**
   * Is this a some?
   *
   * @returns
   */
  isSome(): this is Some<T> {
    return this._hasValue;
  }

  /**
   * Is this a none?
   *
   * @returns
   */
  isNone(): this is None {
    return !this._hasValue;
  }
}

export class Some<T> extends Option<T> {
  protected get _hasValue(): boolean { return true; }
  protected readonly _value: T;

  constructor(value: T) {
    super();
    this._value = value;
  }
}

export class None extends Option<any> {
  protected get _hasValue() { return false; }
  protected readonly _value: undefined;

  constructor() {
    if (NoneSingleton) return NoneSingleton;
    super();
    this._value = undefined;
    NoneSingleton = this;
  }
}

let NoneSingleton: None | undefined = undefined;
export const none = new None();
