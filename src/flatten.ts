import { MountNode } from './nodes/mount';
import { FsNode } from './nodes/node';
import { MountNodeType, NodeType } from './nodes/type';

/**
 * Flatten a structure
 *
 * @param node
 */
export function * flatten(node: MountNode | FsNode): IterableIterator<FsNode> {
  switch (node.type) {
  case MountNodeType:
    for (const nodelet of node.children) {
      yield * flatten(nodelet);
    }
    break;

  case NodeType.Directory:
    yield node;
    for (const nodelet of node.children) {
      yield * flatten(nodelet);
    }
    break;

  case NodeType.File:
    yield node;
    break;

  case NodeType.SymLink:
    yield node;
    break;
  }
}
