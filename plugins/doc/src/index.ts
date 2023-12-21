import {
  OpenAPIPlugin,
  OpenAPIPluginOptions,
  OpenApis,
  ParameterV2,
  ParserResult,
  SchemaApi,
  SchemaJsonV2,
} from '@opas/core'
import fs from 'fs-extra'
import json2md from 'json2md'
import { kebabCase } from 'lodash'
import path from 'node:path'

export type Field = Required<SchemaJsonV2>['definitions'][''] & {
  type?: any
  name?: string
}

function formatQuoteString(str: string) {
  return `\`${str}\``
}

function resolveDefinition(ref: string, definitions: Required<SchemaJsonV2>['definitions']) {
  const def = ref.split('/').pop() as string
  const definition = definitions[def]
  const properties = definition?.properties
  const required = definition?.required || []
  const refs: string[] = []
  const fields: Field[] = []
  if (properties) {
    Object.entries(properties).forEach(([key, value]) => {
      if (value.$ref) {
        const subDefName = value.$ref.split('/').pop() as any
        const subDef = definitions[subDefName]
        if (subDef.properties) {
          refs.push(value.$ref)
        }
        fields.push({
          name: key,
          type: subDef.properties ? subDefName : subDef.type,
          default: '-',
        })
      } else {
        if (value.type === 'array') {
          const ref = (value.items as any)?.$ref
          if (ref) {
            refs.push(ref)
            const subDefName = ref.split('/').pop() as any
            fields.push({
              name: key,
              ...value,
              type: `${value.type}<${subDefName}>` as any,
            })
          } else {
            fields.push({
              name: key,
              ...value,
              type: `${value.type}<${(value.items as any)?.type}>` as any,
            })
          }
        } else {
          fields.push({
            name: key,
            ...value,
          })
        }
      }
    })
  }
  return { fields, refs, name: def, required }
}

json2md.converters.raw = function (input) {
  return input
}

export type TagAliasMapper = (tag: string) => string

export interface OpenAPITransformDocPluginOptions extends OpenAPIPluginOptions {
  /**
   * 输出目录
   */
  output?: string
  /**
   * 是否以 tags 分组
   */
  grouped?: boolean
  /**
   * 是否跳过文件输出
   */
  skipOutput?: boolean
  /**
   * 成功回调
   */
  onSuccess?: (result: Record<string, string>) => void
  tagAlias?: TagAliasMapper | Record<string, string>
  include?: ((api: SchemaApi) => boolean) | RegExp | string[]
  exclude?: ((api: SchemaApi) => boolean) | RegExp | string[]
}

export default class SwaggerTransformDocPlugin extends OpenAPIPlugin<OpenAPITransformDocPluginOptions> {
  public transform = async ({ service, apis, schema }: ParserResult) => {
    const {
      cwd = process.cwd(),
      output = path.resolve(cwd, 'docs'),
      tagAlias,
      grouped,
      include,
      exclude,
      skipOutput = false,
      onSuccess,
    } = this.options

    if (!skipOutput) {
      await fs.ensureDir(output)
    }

    const content = schema.content as OpenApis
    // 理论上来说，这里的 tags 包含了所有的 tag
    const { tags = [] } = content

    const groupedApis: Record<string, SchemaApi[]> = {}
    if (grouped) {
      tags.forEach((tag) => {
        const groupName = typeof tagAlias === 'function' ? tagAlias(tag.name) : tagAlias ? tagAlias[tag.name] : tag.name
        if (groupName) {
          groupedApis[groupName] = apis.filter((api) => api.tags?.includes(tag.name))
        }
      })
    } else {
      groupedApis[kebabCase(service.name)] = apis
    }
    const result: Record<string, string> = {}
    await Promise.all(
      Object.entries(groupedApis).map(async ([groupName, apis]) => {
        const filePath = path.resolve(output, `${groupName}.md`)
        const markdown: json2md.DataObject[] = [
          // {
          //   h1: groupName,
          // },
        ]
        apis
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
          .forEach((api) => {
            const { summary, description, rawUri, method, responses } = api
            const parameters = (api.parameters || []) as ParameterV2[]
            // API 名称
            markdown.push({
              h2: summary,
            })
            if (description) {
              // API 简介
              markdown.push({
                blockquote: description,
              })
            }

            markdown.push(
              {
                h3: '请求方法',
              },
              {
                raw: formatQuoteString(method.toUpperCase()),
              },
              {
                h3: '请求地址',
              },
              {
                raw: formatQuoteString(`${service.basePath}${rawUri}`),
              },
            )

            function generateDefinitionTable(ref: string, isResponse = false) {
              const {
                fields,
                refs,
                required = [],
              } = resolveDefinition(ref, (content as any).definitions || (content as any).components?.schemas || {})

              markdown.push({
                table: {
                  headers: ['参数名称', '参数类型', !isResponse ? '是否必填' : '', '参数说明'].filter(Boolean),
                  rows: fields.map((parameter: any) =>
                    [
                      formatQuoteString(parameter.name || '-'),
                      formatQuoteString(parameter.type || '-'),
                      !isResponse
                        ? formatQuoteString((!!(parameter.required || required.includes(parameter.name))).toString())
                        : '',
                      parameter.description || '-',
                    ].filter(Boolean),
                  ),
                },
              })

              if (refs) {
                const dedupedRefs = Array.from(new Set(refs.filter((str) => ref !== str)))
                dedupedRefs.forEach((ref) => {
                  markdown.push({
                    raw: `  - \`${ref.split('/').pop()}\``,
                  })
                  generateDefinitionTable(ref, isResponse)
                })
              }
            }

            if (parameters.length) {
              const bodyParameter = parameters.filter((parameter) => parameter.in === 'body')?.[0]
              const headerParameters = parameters.filter((parameter) => parameter.in === 'header')
              const queryParameters = parameters.filter((parameter) => parameter.in === 'query')
              const pathParameters = parameters.filter((parameter) => parameter.in === 'path')
              markdown.push({
                h3: '请求参数',
              })
              if (headerParameters.length) {
                markdown.push({
                  raw: '- 请求头设置',
                })
                markdown.push({
                  table: {
                    headers: ['参数名称', '参数类型', '是否必填', '参数说明'],
                    rows: headerParameters.map((parameter: any) => [
                      formatQuoteString(parameter.name),
                      formatQuoteString(parameter.type),
                      formatQuoteString((!!parameter.required).toString()),
                      parameter.description || '-',
                    ]),
                  },
                })
              }
              if (pathParameters.length) {
                markdown.push({
                  raw: '- 路径参数',
                })
                markdown.push({
                  table: {
                    headers: ['参数名称', '参数类型', '是否必填', '参数说明'],
                    rows: pathParameters.map((parameter: any) => [
                      formatQuoteString(parameter.name),
                      formatQuoteString(parameter.type),
                      formatQuoteString((!!parameter.required).toString()),
                      parameter.description || '-',
                    ]),
                  },
                })
              }
              if (queryParameters.length) {
                markdown.push({
                  raw: '- 查询参数',
                })
                markdown.push({
                  table: {
                    headers: ['参数名称', '参数类型', '是否必填', '参数说明'],
                    rows: queryParameters.map((parameter: any) => [
                      formatQuoteString(parameter.name),
                      formatQuoteString(parameter.type),
                      formatQuoteString((!!parameter.required).toString()),
                      parameter.description || '-',
                    ]),
                  },
                })
              }
              if (bodyParameter) {
                // 理论上来说 bodyParameters 只会有一个
                markdown.push({
                  raw: '- 请求体参数',
                })
                if ((bodyParameter as any).schema.$ref) {
                  generateDefinitionTable((bodyParameter as any).schema.$ref)
                } else {
                  markdown.push({
                    table: {
                      headers: ['参数名称', '参数类型', '是否必填', '参数说明'],
                      rows: [
                        [
                          formatQuoteString(bodyParameter.name),
                          formatQuoteString((bodyParameter as any).schema.type),
                          formatQuoteString((!!bodyParameter.required).toString()),
                          bodyParameter.description || '-',
                        ],
                      ],
                    },
                  })
                }
              }
            }

            const response = responses['200'] as any
            if (response?.schema) {
              markdown.push({
                h3: '返回值',
              })
              if (response.schema?.$ref) {
                generateDefinitionTable(response.schema.$ref, true)
              } else {
                markdown.push({
                  table: {
                    headers: ['参数名称', '参数类型', '参数说明'],
                    rows: [
                      [
                        formatQuoteString(response.name || '-'),
                        formatQuoteString((response as any).schema.type),
                        response.description || '-',
                      ],
                    ],
                  },
                })
              }
            }
          })
        const markdownContent = json2md(markdown)
        result[groupName] = markdownContent
        if (!skipOutput) {
          await fs.writeFile(filePath, markdownContent)
        }
      }),
    )

    onSuccess?.(result)
  }
}
