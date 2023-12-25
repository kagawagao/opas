import generate from '@babel/generator'
import templateBuilder from '@babel/template'
import * as t from '@babel/types'
import { OpenAPIPlugin, OpenAPIPluginOptions, ParserResult } from '@opas/core'
import {
  ApiCreateOptions,
  OpenAPISchemaJSON,
  ParsedOperation,
  createRenderer,
  formatCode,
  getTemplateParams,
  pascalCase,
} from '@opas/helper'
import fs from 'fs-extra'
import { kebabCase } from 'lodash'
import path from 'node:path'

export type TagAliasMapper = (tag: string) => string

const defaultClassTemplate = `
import type { AxiosRequestConfig } from 'axios';

export default class CLASS_NAME {
  APIS
}
`

const defaultMethodTemplate = `
NAME = async (PARAMS) => {
  return this.request<RESPONSE>(ARGS)
}
`

export interface OpenAPITransformSDKPluginOptions extends OpenAPIPluginOptions, ApiCreateOptions {
  outputDir?: string
  tagAlias?: TagAliasMapper | Record<string, string>
  classTemplate?: string
  methodTemplate?: string
  include?: ((api: ParsedOperation) => boolean) | RegExp | string[]
  exclude?: ((api: ParsedOperation) => boolean) | RegExp | string[]
}
export default class OpenAPITransformSDKPlugin extends OpenAPIPlugin<OpenAPITransformSDKPluginOptions> {
  public transform = async ({ apis, schema, service }: ParserResult) => {
    const {
      cwd = process.cwd(),
      outputDir = path.resolve(cwd, 'src/biz'),
      classTemplate = defaultClassTemplate,
      methodTemplate = defaultMethodTemplate,
      tagAlias = (name: string) => name,
      include,
      exclude,
      ...apiCreateOptions
    } = this.options
    if (!apis.length) {
      return
    }
    const templatePlaceholders = getTemplateParams(classTemplate)
    const buildClass = templateBuilder(classTemplate, {
      plugins: ['typescript'],
      preserveComments: true,
    })
    const buildMethod = createRenderer(methodTemplate, {
      ...apiCreateOptions,
      openApiVersion: schema.openApiVersion ?? 2,
    })
    const bizSubDir = path.resolve(outputDir, kebabCase(service.name))

    await fs.ensureDir(bizSubDir)

    const content = schema.content as OpenAPISchemaJSON
    const { tags = [] } = content

    const groupedApis: Record<string, ParsedOperation[]> = {}
    if (tags.length) {
      tags.forEach((tag) => {
        const groupName = typeof tagAlias === 'function' ? tagAlias(tag.name) : tagAlias[tag.name]
        if (groupName) {
          groupedApis[groupName] = apis.filter((api) => api.tags?.includes(tag.name))
        }
      })
    } else {
      groupedApis[service.name] = apis
    }
    await fs.ensureDir(bizSubDir)

    const keys = Object.keys(groupedApis)

    if (tags.length) {
      const exportClasses = keys
        .map((key) => `export { default as ${pascalCase(key)} } from './${kebabCase(key)}'`)
        .join('\n')

      const entryFilePath = path.resolve(bizSubDir, 'index.ts')

      const entryFileContent = await formatCode({
        source: exportClasses + '\n',
        filePath: entryFilePath,
      })
      await fs.writeFile(entryFilePath, entryFileContent, {
        encoding: 'utf8',
      })
    }

    await Promise.all([
      ...Object.entries(groupedApis).map(async ([key, apis]) => {
        const apisCode = apis
          .filter((api) => {
            if (include) {
              if (typeof include === 'function') {
                return include(api)
              } else if (Array.isArray(include)) {
                return include.includes(api.operationId)
              } else {
                return include.test(api.uri)
              }
            } else {
              return true
            }
          })
          .filter((api) => {
            if (exclude) {
              if (typeof exclude === 'function') {
                return !exclude(api)
              } else if (Array.isArray(exclude)) {
                return !exclude.includes(api.operationId)
              } else {
                return !exclude.test(api.uri)
              }
            } else {
              return true
            }
          })
          .map((api) => buildMethod(api, service.name))
          .join('\n')

        const placeholderArgs: Record<string, any> = {
          CLASS_NAME: t.identifier(pascalCase(key)),
          APIS: apisCode,
        }
        const statement = buildClass(
          templatePlaceholders.reduce<Record<string, any>>((args: { [x: string]: any }, key: string) => {
            args[key] = placeholderArgs[key]
            return args
          }, {}),
        )
        const { code } = generate(t.program(Array.isArray(statement) ? statement : [statement]), {})
        const codeFilePath = path.resolve(bizSubDir, `${tags.length ? kebabCase(key) : 'index'}.ts`)
        const formattedCode = await formatCode({
          source: code,
          filePath: codeFilePath,
        })
        await fs.writeFile(codeFilePath, formattedCode, { encoding: 'utf8' })
      }),
    ])
  }
}
