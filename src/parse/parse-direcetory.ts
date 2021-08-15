import { none, Some, Maybe } from '../maybe';
import { InputChild } from './parse-type';

export type InputDirectoryArray = [ name: string, children: InputChild[] ];
export type InputDirectoryObject = { name: string, children: InputChild[] };
export type InputDirectory = InputDirectoryArray | InputDirectoryObject;

export type InputNormalizedDirectory = { type: 'directory', name: string, children: unknown[] };

export function parseDirectory(unknown: unknown): Maybe<InputNormalizedDirectory> {
  if (!unknown) return none;
  const _unknown = unknown as InputDirectory;

  if (Array.isArray(_unknown)) {
    if (_unknown.length !== 2) return none;
    const [name, children,] = _unknown;
    if (!Array.isArray(children)) return none;
    if (typeof name !== 'string') return none;
    return new Some({ type: 'directory', name, children, });
  }

  else if (typeof _unknown === 'object') {
    const { name, children, } = _unknown;
    if (typeof name !== 'string') return none;
    if (!Array.isArray(children)) return none;
    return new Some({ type: 'directory', name, children, });
  }

  return none;
}
