/**
 * get params from template
 * @param template babel template
 */
export function getTemplateParams(template: string) {
  const matches = template.match(/[_$A-Z0-9]+/gim) || []
  return matches.filter((str) => /^[_$A-Z0-9]+$/gm.test(str))
}
