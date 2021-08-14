import { Dirent, Stats } from 'fs';

export class FsItemStats {
  // eslint-disable-next-line no-unused-vars
  constructor(protected readonly stats: Dirent | Stats) {}
  isBlockDevice(): boolean { return this.stats.isBlockDevice(); }
  isCharacterDevice(): boolean { return this.stats.isCharacterDevice(); }
  isDirectory(): boolean { return this.stats.isDirectory(); }
  isFIFO(): boolean { return this.stats.isFIFO(); }
  isFile(): boolean { return this.stats.isFile(); }
  isSocket(): boolean { return this.stats.isSocket(); }
  isSymbolicLink(): boolean { return this.stats.isSymbolicLink(); }
}

export enum FsItemType {
  BlockDevice,
  CharacterDevice,
  Directory,
  FIFO,
  File,
  Socket,
  SymbolicLink,
}

export abstract class FsItemBase {
  abstract readonly type: FsItemType;

  constructor(
    public readonly stats: FsItemStats,
    public readonly absolutePath: string,
    public readonly relativePath: string,
  ) {
    //
  }
}

export class FsItemBlockDevice extends FsItemBase {
  public readonly type = FsItemType.BlockDevice;
}

export class FsItemCharacterDevice extends FsItemBase {
  public readonly type = FsItemType.BlockDevice;
}

export class FsItemDirectory extends FsItemBase {
  public readonly type = FsItemType.BlockDevice;
}

export class FsItemFIFO extends FsItemBase {
  public readonly type = FsItemType.BlockDevice;
}

export class FsItemFile extends FsItemBase {
  public readonly type = FsItemType.BlockDevice;
}

export class FsItemSocket extends FsItemBase {
  public readonly type = FsItemType.BlockDevice;
}

export class FsItemSymboliclink extends FsItemBase {
  public readonly type = FsItemType.SymbolicLink;

  constructor(
    public readonly linkStats: FsItemStats,
    stats: FsItemStats,
    absolutePath: string,
    relativePath: string,
  ) {
    super(
      stats,
      absolutePath,
      relativePath,
    );
  }
}

export type FsItem =
  | FsItemBlockDevice
  | FsItemCharacterDevice
  | FsItemDirectory
  | FsItemFIFO
  | FsItemFile
  | FsItemSocket
  | FsItemSymboliclink
;
