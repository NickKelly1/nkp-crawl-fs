import crypto from 'crypto';
import fsp from 'fs/promises';
import mkdirp from 'mkdirp';
import path from 'path';
import { dirTestDist } from './dir';
import { promisify } from 'util';
import _rimraf from 'rimraf';
import { read } from './read';
import { flatten } from './flatten';
import { DirectoryNode, FileNode, FsNode, NodeType, SymlinkNode } from './nodes';
const rimraf = promisify(_rimraf);

const dist = dirTestDist();

async function setup(): Promise<void> {
  async function mkDir(abs: string) {
    await fsp.mkdir(abs);
    return abs;
  }
  function mkFile(abs: string) {
    return fsp.writeFile(
      abs,
      crypto.randomBytes(56),
      { encoding: 'binary', flag: 'wx' },
    );
  }
  function mkLink(abs: string, link: string) {
    return fsp.symlink(link, abs);
  }

  await Promise.all([
    mkDir(path.join(dist, 'd1')).then(d1 => Promise.all([
      mkFile(path.join(d1, 'd1f1')),
      mkFile(path.join(d1, 'd1f2')),
    ])),
    mkDir(path.join(dist, 'd2')).then(d2 => Promise.all([
      mkFile(path.join(d2, 'd2f1')),
      mkFile(path.join(d2, 'd2f2')),
    ])),
    mkFile(path.join(dist, 'f1')),
    mkFile(path.join(dist, 'f2')),
    mkLink(path.join(dist, 'l1'), './f1'),
  ]);
}

describe('read', () => {
  beforeEach(() => rimraf(dist).then(() => mkdirp(dist)));
  afterAll(() => rimraf(dist));

  // afterEach(() => rimraf(dist));

  it('should work', async () => {
    await setup();
    const result = await read(dist);
    const flat = Array.from(flatten(result))

    function find(name: string): undefined | FsNode {
      return flat.find((node) => node.name === name);
    }

    const d1 = find('d1') as DirectoryNode;
    expect(d1).toBeDefined();
    expect(d1.absolutePath).toBe(path.join(dist, 'd1'));
    expect(d1.type).toBe(NodeType.Directory);
    expect(d1.children).toBeInstanceOf(Array);
    expect(d1.children.length).toBe(2);

    const d1f1 = find('d1f1') as FileNode;
    expect(d1f1).toBeDefined();
    expect(d1f1.absolutePath).toBe(path.join(dist, 'd1', 'd1f1'));
    expect(d1f1.type).toBe(NodeType.File);

    const d1f2 = find('d1f2') as FileNode;
    expect(d1f2).toBeDefined();
    expect(d1f2.absolutePath).toBe(path.join(dist, 'd1', 'd1f2'));
    expect(d1f2.type).toBe(NodeType.File);

    const d2 = find('d2') as DirectoryNode;
    expect(d2).toBeDefined();
    expect(d2.absolutePath).toBe(path.join(dist, 'd2'));
    expect(d2.type).toBe(NodeType.Directory);
    expect(d2.children).toBeInstanceOf(Array);
    expect(d2.children.length).toBe(2);

    const d2f1 = find('d2f1') as FileNode;
    expect(d2f1).toBeDefined();
    expect(d2f1.absolutePath).toBe(path.join(dist, 'd2', 'd2f1'));
    expect(d2f1.type).toBe(NodeType.File);

    const d2f2 = find('d2f2') as FileNode;
    expect(d2f2).toBeDefined();
    expect(d2f2.absolutePath).toBe(path.join(dist, 'd2', 'd2f2'));
    expect(d2f2.type).toBe(NodeType.File);

    const f1 = find('f1') as FileNode;
    expect(f1).toBeDefined();
    expect(f1.absolutePath).toBe(path.join(dist, 'f1'));
    expect(f1.type).toBe(NodeType.File);

    const f2 = find('f2') as FileNode;
    expect(f2).toBeDefined();
    expect(f2.absolutePath).toBe(path.join(dist, 'f2'));
    expect(f2.type).toBe(NodeType.File);

    const l1 = find('l1') as SymlinkNode;
    expect(l1).toBeDefined();
    expect(l1.absolutePath).toBe(path.join(dist, 'l1'));
    expect(l1.type).toBe(NodeType.SymLink);
    expect(l1.link).toBe(path.normalize(path.join(l1.absolutePath, '..', 'f1')));
    expect(l1.linkValue).toBe('./f1');
  });
});
