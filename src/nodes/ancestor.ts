import { DirectoryNode } from "./directory";
import { MountNode } from "./mount";

export type AncestorNode =
  | DirectoryNode
  | MountNode
;
