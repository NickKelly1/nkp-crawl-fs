import crypto from 'crypto';
import rimraf from "rimraf";
import path from 'path';
import { dirTestDist } from "../utils/dir";
import * as fsw from "./fs-writer";
import mkdirp from 'mkdirp';

const dist = dirTestDist();

const write: fsw.FswFileWriteFn = () => ({
  content: crypto.randomBytes(512),
  encoding: 'binary',
})

describe("fsWriter", () => {
  beforeAll(async () => {
    await new Promise<void>((res, rej) => rimraf(dist, (err) => err ? rej(err) : res()));
    await mkdirp(dist);
  });

  it("should work", async () => {
    await fsw.write(fsw.structure({
      root: dist,
      children: [
        fsw.directory({ name: "dir_1", children: [
          fsw.directory({ name: 'dir_1_1', children: [
            fsw.file({ name: 'dir_1_1_1', write }),
            fsw.file({ name: 'dir_1_1_2', write }),
            fsw.file({ name: 'dir_1_1_3', write }),
          ]}),
          fsw.directory({ name: 'dir_1_2', children: [
            fsw.file({ name: 'dir_1_2_1', write }),
            fsw.file({ name: 'dir_1_2_2', write }),
            fsw.file({ name: 'dir_1_2_3', write }),
          ]}),
          fsw.directory({ name: 'dir_1_3', children: [
            fsw.file({ name: 'dir_1_3_1', write }),
            fsw.file({ name: 'dir_1_3_2', write }),
            fsw.file({ name: 'dir_1_3_3', write }),
          ]}),
          fsw.file({ name: 'file_1_4', write }),
          fsw.file({ name: 'file_1_5', write }),
          fsw.file({ name: 'file_1_6', write }),
        ]}),
        fsw.directory({ name: "dir_2", children: [
          fsw.directory({ name: 'dir_2_2', children: [
            fsw.file({ name: 'dir_2_1_1', write }),
            fsw.file({ name: 'dir_2_1_2', write }),
            fsw.file({ name: 'dir_2_1_3', write }),
          ]}),
          fsw.directory({ name: 'dir_2_2', children: [
            fsw.file({ name: 'dir_2_2_1', write }),
            fsw.file({ name: 'dir_2_2_2', write }),
            fsw.file({ name: 'dir_2_2_3', write }),
          ]}),
          fsw.directory({ name: 'dir_2_3', children: [
            fsw.file({ name: 'dir_2_3_1', write }),
            fsw.file({ name: 'dir_2_3_2', write }),
            fsw.file({ name: 'dir_2_3_3', write }),
          ]}),
          fsw.file({ name: 'file_2_4', write }),
          fsw.file({ name: 'file_2_5', write }),
          fsw.file({ name: 'file_2_6', write }),
        ]}),
        fsw.symlink({ name: 'symlink_0', from: './dir_1/dir_1_1', }),
      ],
    }));
  });
});
