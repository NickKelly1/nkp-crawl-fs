import fsp from 'fs/promises';
import fs from 'fs';
import { DirectoryNode } from './nodes/directory';
import { FileNode } from './nodes/file';
import { FsNode } from './nodes/node';
import { SymlinkNode } from './nodes/symlink';
import { MountNodeType, NodeType } from './nodes/type';
import { MountNode } from './nodes/mount';

const noop = (): void => undefined;

/**
 * Write a structure out to the filesystem
 *
 * @param mount
 * @returns
 */
export async function write(mount: MountNode | FsNode): Promise<void> {
  return _writeNode(mount);

  function _writeNode(node: MountNode | FsNode): Promise<void> {
    switch (node.type) {
    case MountNodeType: return _writeMount(node);
    case NodeType.Directory: return _writeDirectory(node);
    case NodeType.File: return _writeFile(node);
    case NodeType.SymLink: return _writeSymlink(node);
    default: {
      console.warn(`Unable to write file type ${node.type}`);
      return Promise.resolve();
    }
    }
  }

  function _writeMount(node: MountNode): Promise<void> {
    return Promise.all(Array
      .from(node.children)
      .map(_writeNode)
    ).then(noop);
  }

  function _writeDirectory(node: DirectoryNode): Promise<void> {
    return fsp
      .mkdir(node.absolutePath)
      .then(() => Promise.all(Array
        .from(node.children)
        .map(_writeNode))
      ).then(noop);
  }

  async function _writeFile(node: FileNode): Promise<void> {
    const { override, absolutePath, } = node;
    if (node.write === null) {
      // check for existance and move on (can read file okay)
      // throw if not existing
      await fsp.access(node.absolutePath, fs.constants.R_OK );
    } else {
      // try to write
      const { content, encoding, } = await node.write();
      return fsp.writeFile(
        absolutePath,
        content,
        {
          encoding,
          flag: override
            ? undefined
            // wx - no override if exists
            // https://stackoverflow.com/questions/12899061/creating-a-file-only-if-it-doesnt-exist-in-node-js
            : 'wx',
        });
    }
  }

  function _writeSymlink(node: SymlinkNode): Promise<void> {
    return fsp.symlink(node.link, node.absolutePath);
  }
}
