import { AncestorNode } from './ancestor';

// base
export interface Base {
  name: string;
  root: null | AncestorNode;
  parent: null | AncestorNode;
  absolutePath: string;
  relativePath: string;
}
