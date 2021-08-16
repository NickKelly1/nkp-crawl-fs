import { Maybe } from '@nkp/maybe';
import { InputChild } from './parse-type';

export type InputMountArray = [ absolutePath: string, children: InputChild[] ];
export type InputMountObject = { absolutePath: string, children: InputChild[] };
export type InputMount = InputMountArray | InputMountObject;

export type InputNormalizedMount = { absolutePath: string, children: unknown[] };

/**
 * Conflicts with parseDirectory
 *
 * Only call on input object
 */
export function parseMount(unknown: unknown): Maybe<InputNormalizedMount> {
  if (!unknown) return Maybe.none;
  const _unknown = unknown as InputMount;

  if (Array.isArray(_unknown)) {
    if (_unknown.length !== 2) return Maybe.none;
    const [absolutePath, children,] = _unknown;
    if (typeof absolutePath !== 'string') return Maybe.none;
    if (!Array.isArray(children)) return Maybe.none;
    return Maybe.some({ absolutePath, children, });
  }

  else if (typeof _unknown === 'object') {
    const { absolutePath, children, } = _unknown;
    if (typeof absolutePath !== 'string') return Maybe.none;
    if (!Array.isArray(children)) return Maybe.none;
    return Maybe.some({ absolutePath, children, });
  }

  return Maybe.none;
}
