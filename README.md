# @nkp/fs

[![npm version](https://badge.fury.io/js/%40nkp%2Ffs.svg)](https://www.npmjs.com/package/@nkp/fs)
[![Node.js Package](https://github.com/NickKelly1/nkp-fs/actions/workflows/npm-publish.yml/badge.svg)](https://github.com/NickKelly1/nkp-fs/actions/workflows/npm-publish.yml)
![Known Vulnerabilities](https://snyk.io/test/github/NickKelly1/nkp-fs/badge.svg)

Filesystem utilities for recursively creating and reading file structures.

## Usage

### fsn.parse

`fsn.parse(inputStructure)` takes an input file structure then parses and normalizes it to work with the package.

It converts files, directories and symlinks to a tree of objects of type:

- **MountNode**: represents the input location
- **FileNode**: represents a file with optional content
- **DirectoryNode**: represents a directory with children, either `FileNode`, `DirectoryNode` or `SymlinkNode`
- **SymlinkNode**: represents a symbolic link

```ts
import * as fsn from '@nkp/fs';
import crypto from 'crypto';

// you have some flexibility in how you write the file structure
const fileStructure = fsn.parse(['/absolute/path/to/mount/point', [
  ['file_1', 'file 1 content'],
  ['file_2', { write: 'file 2 content' }],
  ['file_3', { write: 'file 3 content', encoding: 'utf-8' }],
  ['file_4', { write: async () => ({ content: 'file 3 content' }), encoding: 'utf-8' }],
  ['file_4', { write: async () => ({ content: crypto.randomBytes(56), encoding: 'binary' }), }],
  ['file_4', { write: async () => ({ content: crypto.randomBytes(56), encoding: 'binary' }), }],
  {
    name: 'file_4',
    write: async () => ({ content: crypto.randomBytes(56), encoding: 'binary' }),
  },

  ['directory_1', []],
  { name: 'directory_1', children: [] },

  ['directory_2', [
    ['nestedfile', 'nested file content2' ],
  ]],

  { name: 'directory_2', children: [
    { name: 'nested_file', write: 'nested file content' },
    { name: 'directory_2_nesting', children: [
      { name: 'double_nested_file', write: 'doubl nested file' },
    ]},
  ]},

  ['symlink', { link: './file_4' }],
]]);

// fileStructure: [MountNode] {
//    absolutePath: string,
//    type: 'Node:Mount'
//    children: [
//      [FileNode] {
//        type: 'Node:File',
//        name: 'file_1',
//        write: async () => ({ content: 'file 1 content', encoding: 'utf-8' })
//        override: false,
//        absolutePath: string,
//        relativePath: string,
//      },
//      [FileNode] {
//        type: 'Node:File',
//        name: 'file_2',
//        write: async () => ({ content: 'file 2 content', encoding: 'utf-8' })
//        override: false,
//        absolutePath: string,
//        relativePath: string,
//      },
//      ...
//    ]
//  }
```

### fsn.read

Recursively reads from the file system into a structure of linked `FileNode`, `DirectoryNode`, `SymlinkNode` and `ExoticNode`.

```ts
import * as afsn from '@nkp/fs';
const fileStructure = await fsn.read('/absolute/path/to/read/point');

// fileStructure: [Node:Directory] {
//    name: string,
//    absolutePath: string,
//    type: 'Node:Directory'
//    children: [
//      [FileNode] {
//        type: 'Node:File',
//        name: 'file_1',
//        write: null,
//        override: false,
//        absolutePath: string,
//        relativePath: string,
//      },
//      [FileNode] {
//        type: 'Node:File',
//        name: 'file_2',
//        write: null,
//        override: false,
//        absolutePath: string,
//        relativePath: string,
//      },
//      ...
//    ]
//  }
```

### fsn.write

Recursively write a file structure to the file system.

```ts
import * as fsn from '@nkp/fs';

const structure = fsn.parse(/* some parseable structure */);
await fsn.write(structure);
```

### fsn.flatten

Flatten a nested file structure into an array of nodes

```ts
import * as fsn from '@nkp/fs';

const structure = fsn.parse(/* some parseable structure */);
const flat: (FileNode | DirectoryNode | SymlinkNode | ExoticNode)[] = fsn.flatten(structure);
//
```

## Publishing

To a release a new version:

1. Update the version number in package.json
2. Push the new version to the `master` branch on GitHub
3. Create a `new release` on GitHub for the latest version

This will trigger a GitHub action that tests and publishes the npm package.
