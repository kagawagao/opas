/**
 * remove path params from uri
 */
export function removeUriPathParams(uri: string) {
  return uri
    .split('/')
    .filter((str) => !(str.startsWith('{') && str.endsWith('}')))
    .join('/');
}
