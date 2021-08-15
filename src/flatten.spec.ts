import { dirTestDist } from './dir';
import { flatten } from './flatten';
import { parse } from './parse';

const dist = dirTestDist();

describe('flatten', () => {
  it('should flatten nodes', () => {
    const structure = parse([dist, [
      ['dir1', [
        ['file1', 'file 1 content',],
        ['dir2', [
          ['file2', 'file 2 content',],
          ['dir3', [
            ['file3', 'file 3 content',],
          ],],
        ],],
      ],],
    ],]);

    const flat = Array.from(flatten(structure));
    expect(flat[0]!.name).toBe('dir1');
    expect(flat[1]!.name).toBe('file1');
    expect(flat[2]!.name).toBe('dir2');
    expect(flat[3]!.name).toBe('file2');
    expect(flat[4]!.name).toBe('dir3');
    expect(flat[5]!.name).toBe('file3');
  });
});
