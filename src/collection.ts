import { None, Option, Some } from "./options";

/**
 * Iterable collection
 */
export class Collection<T> implements Iterable<T> {
  constructor(protected readonly root: Iterable<T>) {
    //
  }

  * [Symbol.iterator](): IterableIterator<T> {
    yield * this.root;
  }

  /**
   * Iterate over the collection
   *
   * @param eachFn
   */
  each(eachFn: (item: T) => unknown) {
    for (const item of this.root) {
      eachFn(item);
    }
  }

  /**
   * Map the collection
   *
   * @param mapFn
   * @returns
   */
  map<U>(mapFn: (item: T) => U): Collection<U> {
    const self = this;
    const mapIterator = function * () {
      for (const item of self.root) { yield mapFn(item); }
    }();
    return new Collection(mapIterator);
  }

  /**
   * Filter the collection
   *
   * @param filterFn
   * @returns
   */
  filter(filterFn: (item: T) => boolean): Collection<T> {
    const self = this;
    const filterIterator = function * () {
      for (const item of self.root) {
        if (filterFn(item)) yield item;
      }
    }();
    return new Collection(filterIterator);
  }

  /**
   * Filter out the specific value
   *
   * @param value
   */
  exclude(value: T): Collection<T> {
    return this.filter((item) => item !== value);
  }

  /**
   * Get the first value
   *
   * @returns
   */
  first(): Option<T> {
    let hasValue = false;
    let value: T | undefined;
    for (const item of this) {
      hasValue = true;
      value = item;
      break;
    }
    if (hasValue) {
      return new Some(value!);
    }
    return new None();
  }

  /**
   * Get an item by index
   *
   * @param index
   * @returns
   */
  item(index: number): Option<T> {
    let i = 0;
    if (i >= 0) {
      // seek for i
      let hasValue = false;
      let value: T | undefined;
      for (const item of this) {
        if (i === index) {
          hasValue = true;
          value = item;
          break;
        }
        i += 1;
      }
      if (hasValue) {
        return new Some(value!);
      }
      return new None();
    } else {
      // i is negative
      // collect as array and reverse index
      const arr = this.toArray();
      if ((index) >= arr.length) return new None();
      return new Some(arr[index]!);
    }
  }

  /**
   * Trasnform the collection to an array
   *
   * @returns
   */
  toArray(): T[] {
    const array: T[] = [];
    this.each((item) => array.push(item));
    return array;
  }
}
