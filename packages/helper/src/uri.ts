/**
 * format api uri
 */
export function formatApiUri(uri: string) {
  return uri.replace(/\/\{.+\}/g, '')
}
