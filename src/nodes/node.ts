import { DirectoryNode } from './directory';
import { ExoticNode } from './exotic';
import { FileNode } from './file';
import { SymlinkNode } from './symlink';

// all
export type FsNode =
  | FileNode
  | DirectoryNode
  | SymlinkNode
  | ExoticNode
;
