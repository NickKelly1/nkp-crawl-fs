import { AncestorNode } from '../nodes/ancestor';
import { toDirectory } from '../nodes/directory';
import { toFile } from '../nodes/file';
import { MountNode, toMount } from '../nodes/mount';
import { FsNode } from '../nodes/node';
import { toSymlink } from '../nodes/symlink';
import { parseDirectory, InputNormalizedDirectory } from './parse-direcetory';
import { parseFile, InputNormalizedFile } from './parse-file';
import { InputMount, InputNormalizedMount, parseMount } from './parse-mount';
import { parseSymlink, InputNormalizedSymlink } from './parse-symlink';
import { ParseError, InputNormalizedAtom } from './parse-type';

/**
 * Parse the input into a symbolic representation of a filesystem structure
 *
 * @param input
 * @returns
 */
export function parse(input: InputMount): MountNode {
  const mount = parseMount(input).value;
  if (!mount) throw new ParseError('Failed to parse first node');
  const node = _handleMount(mount);
  return node;
}

function _handleMount(
  normalized: InputNormalizedMount,
): MountNode {
  const { absolutePath, children, } = normalized;
  const node = toMount({ absolutePath, });
  node.children = children.map((child) => _handleUnknown('', node, node, child));
  return node;
}


function _handleUnknown(
  context: string,
  root: AncestorNode,
  parent: AncestorNode,
  unknown: unknown
): FsNode {
  let value: undefined | InputNormalizedAtom;

  value = parseDirectory(unknown).value;
  if (value) return _handleDirectory(context, root, parent, value);

  value = parseFile(unknown).value;
  if (value) return _handleFile(root, parent, value);

  value = parseSymlink(unknown).value;
  if (value) return _handleSymlink(root, parent, value);

  throw new ParseError(`Faile to parse ${context}`);
}


function _handleFile(
  root: AncestorNode,
  parent: AncestorNode,
  normalized: InputNormalizedFile,
): FsNode {
  const { name, write, } = normalized;
  const file = toFile({ name: name, parent, root, override: false, write, });
  return file;
}

function _handleDirectory(
  context: string,
  root: AncestorNode,
  parent: AncestorNode,
  normalized: InputNormalizedDirectory,
): FsNode {
  const { name, } = normalized;
  const node = toDirectory({ name, parent, root, });
  node.children = normalized
    .children
    .map((child, i) => _handleUnknown(
      `${context}.${normalized.name}[${i}]`,
      root,
      node,
      child
    ));
  return node;
}

function _handleSymlink(
  root: AncestorNode,
  parent: AncestorNode,
  normalized: InputNormalizedSymlink
): FsNode {
  const { name, link, } = normalized;
  const node = toSymlink({ name, parent, root, link, });
  return node;
}
