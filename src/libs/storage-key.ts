export function createStorageKey<T extends string, V extends number>(
  key: T,
  version: V
): `${T}-v${V}` {
  return `${key}-v${version}`;
}
