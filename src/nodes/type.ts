export type MountNodeType = 'Node:Mount';
export const MountNodeType: MountNodeType = 'Node:Mount';

export enum NodeType {
  Directory = 'Node:Directory',
  File = 'Node:File',
  SymLink = 'Node:Symlink',
  Exotic = 'Node:Exotic',
}
