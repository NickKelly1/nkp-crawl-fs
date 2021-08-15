import { InputDirectory, InputNormalizedDirectory } from './parse-direcetory';
import { InputFile, InputNormalizedFile } from './parse-file';
import { InputNormalizedSymlink, InputSymlink } from './parse-symlink';

export enum InputType {
  File = 'Input:FIle',
  Directory = 'Input:Directory',
  Symlink = 'Input:Symlink',
}


export type InputChild =
  | InputDirectory
  | InputFile
  | InputSymlink
;

export type InputNormalizedAtom =
  | InputNormalizedDirectory
  | InputNormalizedFile
  | InputNormalizedSymlink
;

export class ParseError extends Error {}
