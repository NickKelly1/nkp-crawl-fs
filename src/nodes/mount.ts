import { FsNode } from './node';
import { MountNodeType } from './type';

// directory
export interface MountNode {
  type: MountNodeType;
  absolutePath: string;
  children: FsNode[];
}

export interface MountPayload {
  absolutePath: string;
}

export function toMount(payload: MountPayload): MountNode {
  const {
    absolutePath,
  } = payload;

  const node: MountNode = {
    type: MountNodeType,
    absolutePath,
    children: [],
  };

  return node;
}

