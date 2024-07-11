import { OpenAPIPlugin, OpenAPIPluginOptions, ParserResult } from '@opas/core';
import { OpenAPISchemaJSON, ParameterV2, ParsedOperation, SchemaJsonV2 } from '@opas/helper';
import fs from 'fs-extra';
import json2md from 'json2md';
import { kebabCase } from 'lodash';
import path from 'node:path';

const defaultSymbols = {
  method: '请求方法',
  uri: '请求地址',
  parameters: '请求参数',
  responses: '返回值',
  name: '参数名称',
  type: '参数类型',
  required: '是否必填',
  description: '参数描述',
  headerParameters: '请求头设置',
  pathParameters: '路径参数',
  bodyParameters: '请求体参数',
  queryParameters: '查询参数',
} as const;

export type Field = Required<SchemaJsonV2>['definitions'][''] & {
  type?: any;
  name?: string;
};

function formatQuoteString(str: string | string[]) {
  return `\`${str}\``;
}

function formatSchemaType(schema: any) {
  const refs: string[] = [];
  let type = '-';
  if (schema.type === 'array') {
    type = schema.type;
    if (schema.items) {
      if (Array.isArray(schema.items)) {
        type = schema.items
          .map((item: any) => {
            if (item.$ref) {
              return `${schema.type}<${item.$ref.split('/').pop()}>`;
            } else if (item.type) {
              return `${schema.type}<${item.type}>`;
            }
            return '-';
          })
          .join('|');
      } else {
        if (schema.items.$ref) {
          type = `${schema.type}<${schema.items.$ref.split('/').pop()}>`;
          refs.push(schema.items.$ref);
        } else if (schema.items.type) {
          type = `${schema.type}<${schema.items.type}>`;
        }
      }
    }
  } else {
    type = Array.isArray(schema.type) ? schema.type.join('|') : schema.type ?? '-';
  }

  return { type, refs };
}

function formatParameterType(parameter: ParameterV2) {
  if ('type' in parameter) {
    return [parameter.type ?? '-'];
  } else if ('schema' in parameter) {
    const schemaType = parameter.schema.type;
    if (schemaType === 'array') {
      const { type, refs } = formatSchemaType(parameter.schema);
      return [type, refs];
    }
  }
  return ['-'];
}

function resolveDefinition(ref: string, definitions: Required<SchemaJsonV2>['definitions']) {
  const def = ref.split('/').pop() as string;
  const definition = definitions[def];
  const properties = definition?.properties;
  const required = definition?.required || [];
  const refs: string[] = [];
  const fields: Field[] = [];
  if (properties) {
    Object.entries(properties).forEach(([key, value]) => {
      if (value.$ref) {
        const subDefName = value.$ref.split('/').pop() as any;
        const subDef = definitions[subDefName];
        if (subDef.properties) {
          refs.push(value.$ref);
        }
        fields.push({
          name: key,
          type: subDef.properties ? subDefName : subDef.type,
          default: '-',
        });
      } else {
        if (value.type === 'array') {
          const { type, refs: subDefs } = formatSchemaType(value);

          refs.push(...subDefs);

          fields.push({
            name: key,
            ...value,
            type: type as any,
          });
        } else {
          fields.push({
            name: key,
            ...value,
          });
        }
      }
    });
  }
  return { fields, refs, name: def, required };
}

json2md.converters.raw = function (input) {
  return input;
};

export type TagAliasMapper = (tag: string) => string;

export interface OpenAPITransformDocPluginOptions extends OpenAPIPluginOptions {
  /**
   * output dir
   */
  outputDir?: string;
  /**
   * grouped by tag
   */
  grouped?: boolean;
  /**
   * skip output
   */
  skipOutput?: boolean;
  /**
   * on success callback
   */
  onSuccess?: (result: Record<string, string>) => void;
  /**
   * tag alias mapper
   */
  tagAlias?: TagAliasMapper | Record<string, string>;
  /**
   * include apis
   */
  include?: ((api: ParsedOperation) => boolean) | RegExp | string[];
  /**
   * exclude apis
   */
  exclude?: ((api: ParsedOperation) => boolean) | RegExp | string[];
  /**
   * symbols
   */
  symbols?: Partial<typeof defaultSymbols>;
}

export default class SwaggerTransformDocPlugin extends OpenAPIPlugin<OpenAPITransformDocPluginOptions> {
  public transform = async ({ service, apis, schema }: ParserResult) => {
    const {
      cwd = process.cwd(),
      outputDir = path.resolve(cwd, 'docs'),
      tagAlias,
      grouped,
      include,
      exclude,
      skipOutput = false,
      onSuccess,
      symbols: symbolsFromOptions = {},
    } = this.options;

    const symbols = {
      ...defaultSymbols,
      ...symbolsFromOptions,
    };

    if (!skipOutput) {
      await fs.ensureDir(outputDir);
    }

    const content = schema.content as OpenAPISchemaJSON;
    // 理论上来说，这里的 tags 包含了所有的 tag
    const { tags = [] } = content;

    const groupedApis: Record<string, ParsedOperation[]> = {};
    if (grouped) {
      tags.forEach((tag) => {
        const groupName =
          typeof tagAlias === 'function' ? tagAlias(tag.name) : tagAlias ? tagAlias[tag.name] : tag.name;
        if (groupName) {
          groupedApis[groupName] = apis.filter((api) => api.tags?.includes(tag.name));
        }
      });
    } else {
      groupedApis[kebabCase(service.name)] = apis;
    }
    const result: Record<string, string> = {};
    await Promise.all(
      Object.entries(groupedApis).map(async ([groupName, apis]) => {
        const filePath = path.resolve(outputDir, `${groupName}.md`);
        const markdown: json2md.DataObject[] = [
          // {
          //   h1: groupName,
          // },
        ];
        apis
          .filter((api) => {
            if (include) {
              if (typeof include === 'function') {
                return include(api);
              } else if (Array.isArray(include)) {
                return include.includes(api.operationId);
              } else {
                return include.test(api.uri);
              }
            } else {
              return true;
            }
          })
          .filter((api) => {
            if (exclude) {
              if (typeof exclude === 'function') {
                return !exclude(api);
              } else if (Array.isArray(exclude)) {
                return !exclude.includes(api.operationId);
              } else {
                return !exclude.test(api.uri);
              }
            } else {
              return true;
            }
          })
          .forEach((api) => {
            const { summary, description, rawUri, method, responses } = api;
            const parameters = (api.parameters || []) as ParameterV2[];
            // API 名称
            markdown.push({
              h2: summary,
            });
            if (description) {
              // API 简介
              markdown.push({
                blockquote: description,
              });
            }

            markdown.push(
              {
                h3: symbols.method,
              },
              {
                raw: formatQuoteString(method.toUpperCase()),
              },
              {
                h3: symbols.uri,
              },
              {
                raw: formatQuoteString(`${service.basePath}${rawUri}`),
              },
            );

            function generateDefinitionTable(ref: string, isResponse = false) {
              const {
                fields,
                refs,
                required = [],
              } = resolveDefinition(ref, (content as any).definitions || (content as any).components?.schemas || {});

              markdown.push({
                table: {
                  headers: [
                    symbols.name,
                    symbols.type,
                    !isResponse ? symbols.required : '',
                    symbols.description,
                  ].filter(Boolean),
                  rows: fields.map((parameter) =>
                    [
                      formatQuoteString(parameter.name || '-'),
                      formatQuoteString(parameter.type || '-'),
                      !isResponse
                        ? formatQuoteString((!!(parameter.required || required.includes(parameter.name!))).toString())
                        : '',
                      parameter.description || '-',
                    ].filter(Boolean),
                  ),
                },
              });

              if (refs) {
                const dedupedRefs = Array.from(new Set(refs.filter((str) => ref !== str)));
                dedupedRefs.forEach((ref) => {
                  markdown.push({
                    raw: `  - \`${ref.split('/').pop()}\``,
                  });
                  generateDefinitionTable(ref, isResponse);
                });
              }
            }

            function generateParametersTable(parameters: ParameterV2[]) {
              const refs: string[] = [];
              markdown.push({
                table: {
                  headers: [symbols.name, symbols.type, symbols.required, symbols.description],
                  rows: parameters.map((parameter) => {
                    const [type, resolvedRefs] = formatParameterType(parameter);

                    if (resolvedRefs) {
                      refs.push(...resolvedRefs);
                    }
                    return [
                      formatQuoteString(parameter.name || '-'),
                      formatQuoteString(type),
                      formatQuoteString((!!parameter.required).toString()),
                      parameter.description || '-',
                    ];
                  }),
                },
              });

              if (refs.length) {
                const dedupedRefs = Array.from(new Set(refs));
                dedupedRefs.forEach((ref) => {
                  markdown.push({
                    raw: `  - \`${ref.split('/').pop()}\``,
                  });
                  generateDefinitionTable(ref);
                });
              }
            }

            if (parameters.length) {
              const bodyParameter = parameters.filter((parameter) => parameter.in === 'body')?.[0];
              const headerParameters = parameters.filter((parameter) => parameter.in === 'header');
              const queryParameters = parameters.filter((parameter) => parameter.in === 'query');
              const pathParameters = parameters.filter((parameter) => parameter.in === 'path');
              markdown.push({
                h3: symbols.parameters,
              });
              if (headerParameters.length) {
                markdown.push({
                  raw: `- ${symbols.headerParameters}`,
                });
                generateParametersTable(headerParameters);
              }
              if (pathParameters.length) {
                markdown.push({
                  raw: `- ${symbols.pathParameters}`,
                });
                generateParametersTable(pathParameters);
              }
              if (queryParameters.length) {
                markdown.push({
                  raw: `- ${symbols.queryParameters}`,
                });
                generateParametersTable(queryParameters);
              }
              if (bodyParameter) {
                // 理论上来说 bodyParameters 只会有一个
                markdown.push({
                  raw: `- ${symbols.bodyParameters}`,
                });
                if ((bodyParameter as any).schema.$ref) {
                  generateDefinitionTable((bodyParameter as any).schema.$ref);
                } else {
                  generateParametersTable([bodyParameter]);
                }
              }
            }

            const successResponse = (responses[200] ?? responses.default) as any;
            const responseContent = (successResponse as any)?.content;
            const response = responseContent?.['application/json'] ?? responseContent?.['*/*'];
            console.log(response);
            if (response?.schema) {
              markdown.push({
                h3: symbols.responses,
              });
              if (response.schema?.$ref) {
                generateDefinitionTable(response.schema.$ref, true);
              } else {
                markdown.push({
                  table: {
                    headers: [symbols.name, symbols.type, symbols.description],
                    rows: [
                      [
                        formatQuoteString(response.name || '-'),
                        formatQuoteString((response as any).schema.type),
                        response.description || '-',
                      ],
                    ],
                  },
                });
              }
            }
          });
        const markdownContent = json2md(markdown);
        result[groupName] = markdownContent;
        if (!skipOutput) {
          await fs.writeFile(filePath, markdownContent);
        }
      }),
    );

    onSuccess?.(result);
  };
}
