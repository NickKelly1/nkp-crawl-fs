import path from 'path';
import { AncestorNode } from './ancestor';
import { Base } from './base';
import { FsNode } from './node';
import { NodeType } from './type';

// directory
export interface DirectoryNode extends Base {
  type: NodeType.Directory;
  name: string;
  children: FsNode[];
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface DirectoryPayloadBase {
  //
}

export interface DirectoryPayloadParented extends DirectoryPayloadBase {
  absolutePath?: undefined;
  name: string,
  root: AncestorNode,
  parent: AncestorNode;
}

export interface DirectoryPayloadRoot extends DirectoryPayloadBase {
  absolutePath: string;
  name?: undefined,
  root?: null | undefined,
  parent?: null | undefined;
}

export type DirectoryPayload =
  | DirectoryPayloadRoot
  | DirectoryPayloadParented
;


function isRoot(payload: DirectoryPayload): payload is DirectoryPayloadRoot {
  return payload.name === undefined;
}

export function toDirectory(payload: DirectoryPayload): DirectoryNode {
  const {
    root,
    parent,
  } = payload;

  let _name: string;
  let absolutePath: string;
  let relativePath: string;

  if (isRoot(payload)) {
    _name = path.basename(payload.absolutePath);
    absolutePath = payload.absolutePath;
    relativePath = '';
  } else {
    _name = payload.name;
    absolutePath = path.join(payload.parent.absolutePath, payload.name);
    relativePath = path.relative(payload.root.absolutePath, absolutePath);
  }

  const node: DirectoryNode = {
    type: NodeType.Directory,
    name: _name,
    root: root ? root : null,
    parent: parent ?? null,
    absolutePath,
    relativePath,
    children: [],
  };

  return node;
}

