import path from 'path';

const thisdir = __dirname;

export function dirRoot (...segs: string[]): string {
  return path.normalize(path.join(thisdir, '..', ...segs));
}
export function dirTests (...segs: string[]): string {
  return dirRoot('__tests__', ...segs);
}
export function dirTestDist (...segs: string[]): string {
  return dirRoot('.testdist', ...segs);
}
export function dirSrc (...segs: string[]): string {
  return dirRoot('src', ...segs);
}
