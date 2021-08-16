import { Maybe } from '@nkp/maybe';
import { InputType } from './parse-type';

export type InputSymlinkOptions = { to: string }
export type InputSymlinkArray = [ name: string, options: { type?: InputType.Symlink, link: string }]
export type InputSymlinkObject = { name: string, type?: InputType.Symlink, link: string, }
export type InputSymlink = InputSymlinkObject | InputSymlinkArray;

export type InputNormalizedSymlink = { type: InputType.File, name: string, link: string, }

export function parseSymlink(unknown: unknown): Maybe<InputNormalizedSymlink> {
  if (!unknown) return Maybe.none;
  const _unknown = unknown as InputSymlink;
  if (Array.isArray(_unknown)) {
    if (_unknown.length !== 2) return Maybe.none;
    const [name, options,] = _unknown;
    if (typeof name !== 'string') return Maybe.none;
    if (!options || typeof options !== 'object') return Maybe.none;
    const { type, link, } = options;
    if (type !== undefined && type !== InputType.Symlink) return Maybe.none;
    if (typeof link !== 'string') return Maybe.none;
    return Maybe.some({ type: InputType.File, name, link, });
  }
  if (typeof _unknown === 'object') {
    const { name, type, link, } = _unknown;
    if (typeof name !== 'string') return Maybe.none;
    if (type !== undefined && type !== InputType.Symlink) return Maybe.none;
    if (typeof link !== 'string') return Maybe.none;
    return Maybe.some({ type: InputType.File, name, link, });
  }
  return Maybe.none;
}

