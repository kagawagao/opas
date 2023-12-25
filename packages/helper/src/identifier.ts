import { toTypeName } from 'dtsgenerator/dist/core/validateIdentifier'
import { startCase } from 'lodash'
import { ScriptTarget } from 'typescript'

/**
 * format open api generic type to typescript type
 * @example ResponseContent«Boolean» -> ResponseContentBoolean
 * @param type GenericType
 * @returns formatted type
 */
export function formatGenerics(type: string): string {
  return toTypeName(startCase(type), ScriptTarget.Latest)
}

/**
 * format open api type to typescript type
 * @param str identifier
 * @returns formatted type
 */
export function formatTypeName(str: string) {
  return toTypeName(str, ScriptTarget.Latest)
}
