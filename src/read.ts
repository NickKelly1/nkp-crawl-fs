import path from 'path';
import fs from 'fs';
import fsp from 'fs/promises';
import { toDirectory } from './nodes/directory';
import { toSymlink } from './nodes/symlink';
import { FsNode } from './nodes/node';
import { ExoticKind, statsToKind, toExotic } from './nodes/exotic';
import { toFile } from './nodes';
import { ParseError } from './parse';
import { AncestorNode } from './nodes/ancestor';

/**
 * Read a director and its children
 *
 * @param rootAbsolutePath
 * @returns
 */
export async function read(rootAbsolutePath: string): Promise<FsNode> {
  const lstats = await fsp.lstat(rootAbsolutePath);

  if (lstats.isFile()) {
    const node = toFile({ absolutePath: rootAbsolutePath, override: false, });
    return node;
  }

  if (lstats.isSymbolicLink()) {
    const realAbsolutePath = await fsp.realpath(rootAbsolutePath);
    const node = toSymlink({
      absolutePath: rootAbsolutePath,
      link: realAbsolutePath,
    });
    return node;
  }

  if (lstats.isDirectory()) {
    const visited = new Map<string, FsNode>();
    const node = toDirectory({ absolutePath: rootAbsolutePath, });
    visited.set(node.absolutePath, node);
    node.children = await fsp
      .readdir(node.absolutePath, { withFileTypes: true, })
      .then((dirents) => Promise.all(dirents.map(dirent => _handleNode(
        visited,
        node,
        node,
        dirent.name,
        dirent,
      ))));
    return node;
  }

  const kind = statsToKind(lstats);
  if (!kind) throw new ParseError(`Unhandled file type ${rootAbsolutePath}`);
  const node = toExotic({ absolutePath: rootAbsolutePath, kind, });
  return node;
}


/**
 * Handle any node
 *
 * @param visited
 * @param root
 * @param parent
 * @param name
 * @param stats
 * @returns
 */
async function _handleNode(
  visited: Map<string, FsNode>,
  root: AncestorNode,
  parent: AncestorNode,
  name: string,
  stats: fs.Stats | fs.Dirent
): Promise<FsNode> {
  if (stats.isFile()) return _handleFile(visited, root, parent, name);
  else if (stats.isDirectory()) return _handleDirectory(visited, root, parent, name);
  else if (stats.isSymbolicLink()) return _handleSymbolicLink(visited, root, parent, name);
  else return _handleExotic(visited, root, parent, name, stats);
}

/**
 * Handle a directory
 *
 * @param visited
 * @param root
 * @param parent
 * @param name
 * @param stats
 * @returns
 */
async function _handleDirectory(
  visited: Map<string, FsNode>,
  root: AncestorNode,
  parent: AncestorNode,
  name: string,
): Promise<FsNode> {
  const absolutePath = path.join(parent.absolutePath, name);
  if (visited.has(absolutePath)) return visited.get(absolutePath)!;
  const node = toDirectory({ root, parent, name, });
  node.children = await fsp
    .readdir(node.absolutePath, { withFileTypes: true, })
    .then(dirents => Promise.all(dirents.map(async (dirent) => _handleNode(
      visited,
      root,
      node,
      dirent.name,
      dirent,
    ))));
  return node;
}

/**
 * Handle a symbolic link
 *
 * @param visited
 * @param root
 * @param parent
 * @param name
 * @param stats
 * @returns
 */
async function _handleSymbolicLink(
  visited: Map<string, FsNode>,
  root: AncestorNode,
  parent: AncestorNode,
  name: string,
): Promise<FsNode> {
  const absoluteLinkPath = path.join(parent.absolutePath, name);
  const [
    absolutePathFollowed,
    pathFollowed,
  ] = await Promise.all([
    fsp.realpath(absoluteLinkPath),
    fsp.readlink(absoluteLinkPath),
  ]);
  if (visited.has(absoluteLinkPath)) return visited.get(absoluteLinkPath)!;
  const node = toSymlink({
    root,
    parent,
    name,
    link: absolutePathFollowed,
    linkValue: pathFollowed,
  });
  visited.set(absoluteLinkPath, node);
  return node;
}

/**
 * Handle a file
 *
 * @param visited
 * @param root
 * @param parent
 * @param name
 * @param stats
 * @returns
 */
async function _handleFile(
  visited: Map<string, FsNode>,
  root: AncestorNode,
  parent: AncestorNode,
  name: string,
): Promise<FsNode> {
  const absolutePath = path.join(parent.absolutePath, name);
  if (visited.has(absolutePath)) return visited.get(absolutePath)!;
  const node = toFile({ root, parent, name, override: false, });
  visited.set(absolutePath, node);
  return node;
}

/**
 * Handle an exotic file
 *
 * @param visited
 * @param root
 * @param parent
 * @param name
 * @param stats
 * @returns
 */
async function _handleExotic(
  visited: Map<string, FsNode>,
  root: AncestorNode,
  parent: AncestorNode,
  name: string,
  stats: fs.Stats | fs.Dirent,
): Promise<FsNode> {
  const absolutePath = path.join(parent.absolutePath, name);
  if (visited.has(absolutePath)) return visited.get(absolutePath)!;
  const kind: undefined | ExoticKind = statsToKind(stats);
  if (kind) {
    const node = toSymlink({ root, parent, name, link: absolutePath, });
    visited.set(absolutePath, node);
    return node;
  } else {
    throw new Error(`Unhandled file type at ${absolutePath}`);
  }
}
