import { Stats, Dirent } from 'fs';
import path from 'path';
import { AncestorNode } from './ancestor';
import { Base } from "./base";
import { NodeType } from "./type";

export enum ExoticKind {
  Socket = 'Exotic:Socket',
  FIFO = 'Exotic:FIFO',
  CharacterDevice = 'Exotic:CharacterDevice',
  BlockDevice = 'Exotic:BlockDevice',
}

export function statsToKind(stats: Stats | Dirent): undefined | ExoticKind {
  if (stats.isSocket()) return ExoticKind.Socket;
  if (stats.isBlockDevice()) return ExoticKind.BlockDevice;
  if (stats.isCharacterDevice()) return ExoticKind.CharacterDevice;
  if (stats.isFIFO()) return ExoticKind.FIFO;
  return undefined;
}

// file
export interface ExoticNode extends Base {
  type: NodeType.Exotic;
  kind: ExoticKind,
}

export interface ExoticPayloadBase {
  kind: ExoticKind,
}

export interface ExoticPayloadParented extends ExoticPayloadBase {
  absolutePath?: undefined;
  name: string,
  root: AncestorNode,
  parent: AncestorNode;
}

export interface ExoticPayloadRoot extends ExoticPayloadBase {
  absolutePath: string;
  name?: undefined,
  root?: null | undefined,
  parent?: null | undefined;
}

export type ExoticPayload =
  | ExoticPayloadRoot
  | ExoticPayloadParented
;

function isRoot(payload: ExoticPayload): payload is ExoticPayloadRoot {
  return payload.name === undefined;
}

export function toExotic(payload: ExoticPayload): ExoticNode {
  const {
    root,
    parent,
    kind,
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

  const node: ExoticNode = {
    type: NodeType.Exotic,
    kind,
    name: _name,
    root: root ? root : null,
    parent: parent ?? null,
    absolutePath,
    relativePath,
  }

  return node;
}

