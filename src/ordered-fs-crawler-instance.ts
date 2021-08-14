import fsp from 'fs/promises';
import path from 'path';
import {
  FsItem,
  FsItemStats,
  FsItemDirectory,
  FsItemSymboliclink,
  FsItemFile,
  FsItemCharacterDevice,
  FsItemBlockDevice,
  FsItemFIFO,
  FsItemSocket,
} from './fs-items';

/**
 * Crawler instance
 */
export class OrderedFsCrawlerInstance {
  constructor(
    protected readonly rootDirectory: string,
    protected readonly visited: Set<string>,
    protected readonly followSymlinks?: boolean,
  ) {
    //
  }

  /**
   * Start crawling
   */
  public async * start(): AsyncGenerator<FsItem, void, void> {
    const first = await fsp.lstat(this.rootDirectory);
    if (first.isSymbolicLink()) {
      yield * this._handleSymbolicLink(this.rootDirectory, new FsItemStats(first));
    }
    else {
      yield * this._handleReal(this.rootDirectory, new FsItemStats(first));
    }
  }

  /**
   * Receive a directory
   *
   * @param absolutePath
   * @param stats
   * @returns
   */
  async * _handleDirectory(absolutePath: string, stats: FsItemStats): AsyncGenerator<FsItem, void, void> {
    if (this.visited.has(absolutePath)) return;
    this.visited.add(absolutePath);

    const relativePath = path.relative(this.rootDirectory, absolutePath);
    const item = new FsItemDirectory(stats, absolutePath, relativePath);
    yield item;

    const dirents = await fsp.readdir(absolutePath, { withFileTypes: true, });
    for (const dirent of dirents) {
      const absolutePathChild = path.join(absolutePath, dirent.name);
      const stats = new FsItemStats(dirent);
      if (dirent.isSymbolicLink()) {
        yield * this._handleSymbolicLink(absolutePathChild, stats);
      }
      else {
        yield * this._handleReal(absolutePathChild, stats);
      }
    }
  }

  /**
   * Receive a symbolic link
   *
   * @param absolutePathLink
   * @param linkStats
   * @returns
   */
  async * _handleSymbolicLink(absolutePathLink: string, linkStats: FsItemStats): AsyncGenerator<FsItem, void, void> {
    const absolutePathReal = await fsp.realpath(absolutePathLink);
    if (this.visited.has(absolutePathReal)) return;
    this.visited.add(absolutePathReal);
    const lstat = await fsp.lstat(absolutePathReal);
    const stats = new FsItemStats(lstat);

    const absolutePath = absolutePathReal;
    const relativePath = path.relative(this.rootDirectory, absolutePathLink);
    const item = new FsItemSymboliclink(linkStats, stats, absolutePath, relativePath);
    yield item;

    if (lstat.isSymbolicLink()) {
      yield * this._handleSymbolicLink(absolutePathReal, stats);
    }
    else {
      yield * this._handleReal(absolutePathReal, stats);
    }
  }

  /**
   * Receive a real (non-link) directory
   *
   * @param absolutePath
   * @param stats
   */
  async * _handleReal(absolutePath: string, stats: FsItemStats): AsyncGenerator<FsItem, void, void> {
    if (stats.isFile()) yield * this._handleFile(absolutePath, stats);
    else if (stats.isDirectory()) yield * this._handleDirectory(absolutePath, stats);
    else if (stats.isCharacterDevice()) yield * this._handleCharacterDevice(absolutePath, stats);
    else if (stats.isBlockDevice()) yield * this._handleBlockDevice(absolutePath, stats);
    else if (stats.isFIFO()) yield * this._handleFIFO(absolutePath, stats);
    else if (stats.isSocket()) yield * this._handleSocket(absolutePath, stats);
  }

  /**
   * Receivea  file
   *
   * @param absolutePath
   * @param stats
   * @returns
   */
  protected async * _handleFile(absolutePath: string, stats: FsItemStats): AsyncGenerator<FsItem, void, void> {
    if (this.visited.has(absolutePath)) return;
    this.visited.add(absolutePath);
    const relativePath = path.relative(this.rootDirectory, absolutePath);
    const item = new FsItemFile(stats, absolutePath, relativePath);
    yield item;
  }

  /**
   * Receive a character device
   *
   * @param absolutePath
   * @param stats
   * @returns
   */
  protected async * _handleCharacterDevice(absolutePath: string, stats: FsItemStats): AsyncGenerator<FsItem, void, void> {
    if (this.visited.has(absolutePath)) return;
    this.visited.add(absolutePath);
    const relativePath = path.relative(this.rootDirectory, absolutePath);
    const item = new FsItemCharacterDevice(stats, absolutePath, relativePath);
    yield item;
  }

  /**
   * Receive a block device
   *
   * @param absolutePath
   * @param stats
   * @returns
   */
  protected async * _handleBlockDevice(absolutePath: string, stats: FsItemStats): AsyncGenerator<FsItem, void, void> {
    if (this.visited.has(absolutePath)) return;
    this.visited.add(absolutePath);
    const relativePath = path.relative(this.rootDirectory, absolutePath);
    const item = new FsItemBlockDevice(stats, absolutePath, relativePath);
    yield item;
  }

  /**
   * Receive a FIFO
   *
   * @param absolutePath
   * @param stats
   * @returns
   */
  protected async * _handleFIFO(absolutePath: string, stats: FsItemStats): AsyncGenerator<FsItem, void, void> {
    if (this.visited.has(absolutePath)) return;
    this.visited.add(absolutePath);
    const relativePath = path.relative(this.rootDirectory, absolutePath);
    const item = new FsItemFIFO(stats, absolutePath, relativePath);
    yield item;
  }

  /**
   * Receive a socket
   *
   * @param absolutePath
   * @param stats
   * @returns
   */
  protected async * _handleSocket(absolutePath: string, stats: FsItemStats): AsyncGenerator<FsItem, void, void> {
    if (this.visited.has(absolutePath)) return;
    this.visited.add(absolutePath);
    const relativePath = path.relative(this.rootDirectory, absolutePath);
    const item = new FsItemSocket(stats, absolutePath, relativePath);
    yield item;
  }
}
