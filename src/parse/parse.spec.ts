import path from 'path';
import { dirTestDist } from "../dir";
import { DirectoryNode } from "../nodes/directory";
import { FileNode } from "../nodes/file";
import { MountNode } from '../nodes/mount';
import { FsNode } from "../nodes/node";
import { SymlinkNode } from "../nodes/symlink";
import { MountNodeType, NodeType} from "../nodes/type";
import { parse } from "./parse";
import { InputChild, InputType } from "./parse-type";

const dist = dirTestDist();

describe('parse', () => {
  it('should work', () => {
    const root = parse([dist, [
      ['dir1', [],],
    ]]);
    const r1 = root as MountNode;
    expect(r1.absolutePath).toBe(dist);
    expect(r1.type).toBe(MountNodeType);
    expect(r1.children).toBeInstanceOf(Array);
    expect(r1.children[0]!.type).toBe(NodeType.Directory);
  });

  it('should parse large structures', async () => {
    const directoryContents: InputChild[] = [
      ['1_file', 'file 1 content'],
      ['2_file', { write: 'file 2 content' }],
      ['3_file', { write: 'file 3 content', encoding: 'binary' }],
      ['4_file', { write: () => ({ content: 'file 4 content' }), encoding: 'binary' }],
      ['5_file', { write: () => ({ content: 'file 5 content', encoding: 'hex' }), }],
      ['6_file', { write: () => ({ content: 'file 6 content', encoding: 'latin1' }), encoding: 'ucs2' }],
      ['7_link', { link: './1_file' }],
      { name: '8_link', link: './2_file', },
      ['9_directory_nested_1', []],
      { name: '10_directory_nested_2', children: []},
    ];

    const structure = parse([dist, [
      ...directoryContents,
      ['11_directory', [
        ...directoryContents,
      ]],
      { name: '12_directory', children: [
        ...directoryContents,
      ]},
    ]]);

    await testChildren(dist, '.', structure.children);

    const d1 = structure.children[directoryContents.length] as DirectoryNode;
    expect(d1.name).toBe('11_directory');
    expect(d1.absolutePath).toBe(path.join(dist, '11_directory'));
    expect(d1.relativePath).toBe('11_directory');
    expect(d1.type).toBe(NodeType.Directory);
    expect(d1.children).toBeInstanceOf(Array);
    expect(d1.children.length).toBe(directoryContents.length);

    await testChildren(dist, '11_directory', d1.children);

    const d2 = structure.children[directoryContents.length + 1] as DirectoryNode;
    expect(d2.name).toBe('12_directory');
    expect(d2.absolutePath).toBe(path.join(dist, '12_directory'));
    expect(d2.relativePath).toBe('12_directory');
    expect(d2.type).toBe(NodeType.Directory);
    expect(d2.children).toBeInstanceOf(Array);
    expect(d2.children.length).toBe(directoryContents.length);

    await testChildren(dist, '12_directory', d2.children);


    async function testChildren(out: string, relative: string, children: FsNode[]) {
      const n1 = children[0] as FileNode;
      expect(n1.name).toBe('1_file');
      expect(n1.type).toBe(NodeType.File);
      expect((await n1.write!()).content).toBe('file 1 content');
      expect((await n1.write!()).encoding).toBe('utf-8');
      expect(n1.absolutePath).toBe(path.join(out, relative, '1_file'));
      expect(n1.relativePath).toBe(path.join(relative, '1_file'));

      const n2 = children[1] as FileNode;
      expect(n2.name).toBe('2_file');
      expect(n2.type).toBe(NodeType.File);
      expect((await n2.write!()).content).toBe('file 2 content');
      expect((await n2.write!()).encoding).toBe('utf-8');
      expect(n2.absolutePath).toBe(path.join(out, relative, '2_file'));
      expect(n2.relativePath).toBe(path.join(relative, '2_file'));

      const n3 = children[2] as FileNode;
      expect(n3.name).toBe('3_file');
      expect(n3.type).toBe(NodeType.File);
      expect((await n3.write!()).content).toBe('file 3 content');
      expect((await n3.write!()).encoding).toBe('binary');
      expect(n3.absolutePath).toBe(path.join(out, relative, '3_file'));
      expect(n3.relativePath).toBe(path.join(relative, '3_file'));

      const n4 = children[3] as FileNode;
      expect(n4.name).toBe('4_file');
      expect(n4.type).toBe(NodeType.File);
      expect((await n4.write!()).content).toBe('file 4 content');
      expect((await n4.write!()).encoding).toBe('binary');
      expect(n4.absolutePath).toBe(path.join(out, relative, '4_file'));
      expect(n4.relativePath).toBe(path.join(relative, '4_file'));

      const n5 = children[4] as FileNode;
      expect(n5.name).toBe('5_file');
      expect(n5.type).toBe(NodeType.File);
      expect((await n5.write!()).content).toBe('file 5 content');
      expect((await n5.write!()).encoding).toBe('hex');
      expect(n5.absolutePath).toBe(path.join(out, relative, '5_file'));
      expect(n5.relativePath).toBe(path.join(relative, '5_file'));

      const n6 = children[5] as FileNode;
      expect(n6.name).toBe('6_file');
      expect(n6.type).toBe(NodeType.File);
      expect((await n6.write!()).content).toBe('file 6 content');
      expect((await n6.write!()).encoding).toBe('latin1');
      expect(n6.absolutePath).toBe(path.join(out, relative, '6_file'));
      expect(n6.relativePath).toBe(path.join(relative, '6_file'));

      const n7 = children[6] as SymlinkNode;
      expect(n7.name).toBe('7_link');
      expect(n7.type).toBe(NodeType.SymLink);
      expect(n7.link).toBe('./1_file');
      expect(n7.absolutePath).toBe(path.join(out, relative, '7_link'));
      expect(n7.relativePath).toBe(path.join(relative, '7_link'));

      const n8 = children[7] as SymlinkNode;
      expect(n8.name).toBe('8_link');
      expect(n8.type).toBe(NodeType.SymLink);
      expect(n8.link).toBe('./2_file');
      expect(n8.absolutePath).toBe(path.join(out, relative, '8_link'));
      expect(n8.relativePath).toBe(path.join(relative, '8_link'));

      const n9 = children[8] as DirectoryNode;
      expect(n9.name).toBe('9_directory_nested_1');
      expect(n9.type).toBe(NodeType.Directory);
      expect(n9.children).toBeInstanceOf(Array);
      expect(n9.children.length).toBe(0);
      expect(n9.absolutePath).toBe(path.join(out, relative, '9_directory_nested_1'));
      expect(n9.relativePath).toBe(path.join(relative, '9_directory_nested_1'));

      const n10 = children[9] as DirectoryNode;
      expect(n10.name).toBe('10_directory_nested_2');
      expect(n10.type).toBe(NodeType.Directory);
      expect(n10.children).toBeInstanceOf(Array);
      expect(n10.children.length).toBe(0);
      expect(n10.absolutePath).toBe(path.join(out, relative, '10_directory_nested_2'));
      expect(n10.relativePath).toBe(path.join(relative, '10_directory_nested_2'));
    }
  });
});
