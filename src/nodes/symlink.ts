import path from 'path';
import { AncestorNode } from './ancestor';
import { Base } from "./base";
import { NodeType } from "./type";

// symlink
export interface SymlinkNode extends Base {
  type: NodeType.SymLink;
  name: string;
  link: string;
  linkValue: null | string;
}

export interface SymlinkPayloadBase {
  link: string;
  linkValue?: null | undefined | string;
}

export interface SymlinkPayloadParented extends SymlinkPayloadBase {
  absolutePath?: undefined;
  name: string,
  root: AncestorNode,
  parent: AncestorNode;
}

export interface SymlinkPayloadRoot extends SymlinkPayloadBase {
  absolutePath: string
  name?: undefined,
  root?: null | undefined;
  parent?: null | undefined;
}

export type SymlinkPayload =
  | SymlinkPayloadRoot
  | SymlinkPayloadParented
;

function isRoot(payload: SymlinkPayload): payload is SymlinkPayloadRoot {
  return payload.name === undefined;
}

export function toSymlink(payload: SymlinkPayload): SymlinkNode {
  const {
    parent,
    root,
    link,
    linkValue,
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

  const symlink: SymlinkNode = {
    type: NodeType.SymLink,
    name: _name,
    root: root ? root : null,
    parent: parent ?? null,
    absolutePath,
    relativePath,
    link,
    linkValue: linkValue ?? null,
  }

  return symlink;
}
