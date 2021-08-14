import path from 'path';
import fsp from 'fs/promises';

export enum FswType {
  Directory,
  File,
  SymLink,
}

// file
export interface FswFileWritePayload {
  content: Buffer | string,
  encoding: BufferEncoding
}
export interface FswFileWriteFn {
  (): FswFileWritePayload
}
export interface FswFile {
  type: FswType.File;
  name: string;
  write: FswFileWriteFn;
}

// symlink
export interface FswSymlink {
  type: FswType.SymLink;
  name: string;
  from: string;
}

// directory
export interface FswDirectory {
  type: FswType.Directory;
  name: string;
  children?: FswNode;
}

// combinations
export type FswAtomic = FswFile | FswSymlink | FswDirectory;
export type FswChildren = FswAtomic[];
export type FswNode = FswChildren | FswAtomic;
export type FswStructure = { root: string; children: FswNode; }

// factories
export function structure(payload: { root: string, children: FswNode }): FswStructure {
  return { ...payload };
}
export function file(payload: { name: string, write: FswFileWriteFn }): FswFile {
  return { type: FswType.File, ...payload, }
}
export function directory(payload: { name: string, children?: FswNode }): FswDirectory {
  return { type: FswType.Directory, ...payload };
}
export function symlink(payload: { name: string, from: string }): FswSymlink {
  return { type: FswType.SymLink, ...payload };
}

/**
 * Write a structure out to the filesystem
 *
 * @param rootStructure
 * @returns
 */
export async function write(rootStructure: FswStructure) {
  return _handleNode(rootStructure.root, rootStructure.children);

  async function _handleNode(hostPath: string, struct: FswNode): Promise<void> {
    if (Array.isArray(struct)) {
      await Promise.all(struct.map((atomic) => _handleNode(hostPath, atomic)))
      return;
    }
    switch (struct.type) {
    case FswType.Directory:
      return _handleDirectory(hostPath, struct);
    case FswType.File:
      return _handleFile(hostPath, struct);
    case FswType.SymLink:
      return _handleSymlink(hostPath, struct);
    }
  }

  async function _handleFile(hostPath: string, file: FswFile): Promise<void> {
    const absolutePath = path.join(hostPath, file.name);
    const { content, encoding } = await file.write();
    return fsp.writeFile(absolutePath, content, { encoding });
  }

  async function _handleSymlink(hostPath: string, symlink: FswSymlink): Promise<void> {
    const absolutePath = path.join(hostPath, symlink.name);
    let from: string;
    if (path.isAbsolute(symlink.from)) from = symlink.from;
    else from = path.normalize(path.join(hostPath, symlink.from));
    return fsp.symlink(absolutePath, from);
  }

  async function _handleDirectory(hostPath: string, directory: FswDirectory): Promise<void> {
    const absolutePath = path.join(hostPath, directory.name);
    await fsp.mkdir(absolutePath);

    if (Array.isArray(directory.children)) {
      // many children
      await Promise.all(directory.children.map(child =>
        _handleNode(absolutePath, child)));
    }

    else if (directory.children) {
      // one child
      await _handleNode(absolutePath, directory.children);
    }

    else{
      // no childre
    }

    return;
  }
}
