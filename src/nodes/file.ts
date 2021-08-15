import path from 'path';
import { OrPromise } from '../types';
import { AncestorNode } from './ancestor';
import { Base } from './base';
import { NodeType } from './type';

// file
export interface FileWritePayload {
  content: Buffer | string,
  encoding: BufferEncoding,
}
export interface FileWrite {
  (): OrPromise<FileWritePayload>,
}
export interface FileNode extends Base {
  type: NodeType.File;
  write: null | FileWrite;
  override: boolean,
}

export interface FilePayloadBase {
  override: boolean,
  write?: null | FileWrite,
}

export interface FilePayloadParented extends FilePayloadBase {
  absolutePath?: undefined;
  name: string,
  root: AncestorNode,
  parent: AncestorNode;
}

export interface FilePayloadRoot extends FilePayloadBase {
  absolutePath: string;
  name?: undefined,
  root?: null | undefined,
  parent?: null | undefined;
}

export type FilePayload =
  | FilePayloadParented
  | FilePayloadRoot
;

function isRoot(payload: FilePayload): payload is FilePayloadRoot {
  return payload.name === undefined;
}

export function toFile(payload: FilePayload): FileNode {
  const {
    root,
    parent,
    write,
    override,
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

  const node: FileNode = {
    type: NodeType.File,
    name: _name,
    root: root ? root : null,
    parent: parent ?? null,
    absolutePath,
    relativePath,
    write: write ?? null,
    override,
  };

  return node;
}

