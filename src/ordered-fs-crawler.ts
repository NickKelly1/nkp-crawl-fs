
import { FsItem, } from './fs-items';
import { OrderedFsCrawlerInstance } from './ordered-fs-crawler-instance';


export interface OrderedFsCrawlerOptions {
  followSymlinks?: boolean;
  signal?: AbortSignal;
}


/**
 * Crawl the filesystem
 */
export function crawlFsOrdered(
  rootDirectory: string,
  options: OrderedFsCrawlerOptions,
): OrderedFsCrawler {
  return new OrderedFsCrawler(rootDirectory, options);
}


/**
 * Filesystem crawler
 */
export class OrderedFsCrawler implements AsyncIterable<FsItem> {
  constructor(
    protected readonly rootDirectory: string,
    protected readonly options: OrderedFsCrawlerOptions = {}
  ) {
    //
  }

  /**
   * Iterate over files
   */
  async * [Symbol.asyncIterator](): AsyncIterableIterator<FsItem> {
    const { rootDirectory, options, } = this;
    const { followSymlinks, signal, } = options;
    const visited = new Set<string>();

    let generator = new OrderedFsCrawlerInstance(rootDirectory, visited, followSymlinks);
    let iterator = generator.start();
    let next: void | FsItem;
    // continue iterating until done
    while (await iterator.next().then(result => (next = result.value, !result.done))) {
      if (signal?.aborted) break;
      yield next!;
    }
  }

  /**
   * Iterate over each of the items
   *
   * @param fn
   */
  async each(fn: (fsItem: FsItem) => unknown): Promise<void> {
    for await (const fsItem of this) { fn(fsItem); }
  }

  /**
   * Map the results
   *
   * @param fn
   * @returns
   */
  async map<T>(fn: (fsItem: FsItem) => T): Promise<T[]> {
    const items: T[] = [];
    this.each((fsItem) => void items.push(fn(fsItem)));
    return items;
  }

  /**
   * Collect results
   */
  async collect() {
    const collected: FsItem[] = [];
    this.each((fsItem) => void collected.push(fsItem));
    return collected;
  }
}

