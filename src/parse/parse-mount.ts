import { none, Some, Option, } from "../options";
import { InputChild } from "./parse-type";

export type InputMountArray = [ absolutePath: string, children: InputChild[] ];
export type InputMountObject = { absolutePath: string, children: InputChild[] };
export type InputMount = InputMountArray | InputMountObject;

export type InputNormalizedMount = { absolutePath: string, children: unknown[] };

/**
 * Conflicts with parseDirectory
 *
 * Only call on input object
 */
export function parseMount(unknown: unknown): Option<InputNormalizedMount> {
  if (!unknown) return none;
  const _unknown = unknown as InputMount;

  if (Array.isArray(_unknown)) {
    if (_unknown.length !== 2) return none;
    const [absolutePath, children] = _unknown;
    if (typeof absolutePath !== 'string') return none;
    if (!Array.isArray(children)) return none;
    return new Some({ absolutePath, children });
  }

  else if (typeof _unknown === 'object') {
    const { absolutePath, children } = _unknown;
    if (typeof absolutePath !== 'string') return none;
    if (!Array.isArray(children)) return none;
    return new Some({ absolutePath, children });
  }

  return none;
}
