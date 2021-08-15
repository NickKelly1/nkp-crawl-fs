import crypto from 'crypto';
import _rimraf from 'rimraf';
import path from 'path';
import { dirTestDist } from './dir';
import mkdirp from 'mkdirp';
import { promisify } from 'util';
import fsp from 'fs/promises';
import { FileWrite } from './nodes';
import { parse } from './parse';
import { write } from './write';

const rimraf = promisify(_rimraf);

const dist = dirTestDist();

const writeFn: FileWrite = () => ({
  content: crypto.randomBytes(8),
  encoding: 'binary',
});

const structure = parse([dist, [
  ['dir1', [
    ['dir2', [
      ['file', writeFn,],
      ['link', { link: './file',},],
    ],],
    ['file', writeFn,],
    ['link1', { link: './file',},],
    ['link2', { link: './dir2/file',},],
  ],],
  ['file', writeFn,],
  ['link1', { link: './file',},],
  ['link2', { link: './dir1/file',},],
  ['link3', { link: './dir1/dir2/file',},],
],]);

describe('write', () => {
  beforeEach(() => rimraf(dist).then(() => mkdirp(dist)));
  afterAll(() => rimraf(dist));

  it('should write a directory structure to the filesystem', async () => {
    await write(structure);

    const dir1 = await fsp.lstat(path.join(dist, 'dir1'));
    expect(dir1.isDirectory()).toBe(true);

    const file = await fsp.lstat(path.join(dist, 'file'));
    expect(file.isFile()).toBe(true);

    const link1 = await fsp.lstat(path.join(dist, 'link1'));
    expect(link1.isSymbolicLink()).toBe(true);

    const link2 = await fsp.lstat(path.join(dist, 'link2'));
    expect(link2.isSymbolicLink()).toBe(true);

    const link3 = await fsp.lstat(path.join(dist, 'link3'));
    expect(link3.isSymbolicLink()).toBe(true);

    const dir1dir2 = await fsp.lstat(path.join(dist, 'dir1', 'dir2'));
    expect(dir1dir2.isDirectory()).toBe(true);

    const dir1file = await fsp.lstat(path.join(dist, 'dir1', 'file'));
    expect(dir1file.isFile()).toBe(true);

    const dir1link1 = await fsp.lstat(path.join(dist, 'dir1', 'link1'));
    expect(dir1link1.isSymbolicLink()).toBe(true);

    const dir1link2 = await fsp.lstat(path.join(dist, 'dir1', 'link2'));
    expect(dir1link2.isSymbolicLink()).toBe(true);

    const dir1dir2file = await fsp.lstat(path.join(dist, 'dir1', 'dir2', 'file'));
    expect(dir1dir2file.isFile()).toBe(true);

    const dir1dir2link = await fsp.lstat(path.join(dist, 'dir1', 'dir2', 'link'));
    expect(dir1dir2link.isSymbolicLink()).toBe(true);
  });
});
