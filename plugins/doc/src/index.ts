import { OpenAPIPlugin, ParserResult } from '@opas/core';
import { OpenAPISchemaJSON, ParameterV2, ParsedOperation, SchemaJsonV2 } from '@opas/helper';
import fs from 'fs-extra';
import { kebabCase } from 'lodash';
import path from 'node:path';
import { DEFAULT_LOCALE } from './constants';
import locales from './locales';
import renders from './renders';
import { APIField, APINode, APIParameter, OpenAPITransformDocPluginOptions } from './types';
import { formatSchemaType, parseDefinitions, parseParameters } from './utils';

export default class SwaggerTransformDocPlugin extends OpenAPIPlugin<OpenAPITransformDocPluginOptions> {
  public transform = async ({ service, apis, schema }: ParserResult) => {
    const {
      cwd = process.cwd(),
      outputDir = path.resolve(cwd, 'docs'),
      tagAlias,
      grouped,
      include,
      exclude,
      render: docRender = 'md',
      locale = {},
    } = this.options;

    const render = typeof docRender === 'string' ? renders[docRender] : docRender;

    if (!render) {
      throw new Error(`docRender ${docRender} not supported`);
    }

    const localData = typeof locale === 'string' ? locales[locale] : locale;

    const symbols = {
      ...DEFAULT_LOCALE,
      ...localData,
    };

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
    const result: Record<string, string | Buffer> = {};
    await Promise.all(
      Object.entries(groupedApis).map(async ([groupName, apis]) => {
        const apiNodes = apis
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
          .map((api) => {
            const { operationId, summary = operationId, description, uri, method } = api;
            const parameters = (api.parameters || []) as ParameterV2[];
            // API 名称
            const node: APINode = {
              uri: `${service.basePath}${uri}`.replace(/\/\//, '/'),
              method: method.toUpperCase(),
              summary,
              description,
            };

            if (parameters.length) {
              node.parameters = [];
              const bodyParameter = parameters.filter((parameter) => parameter.in === 'body')?.[0];
              const headerParameters = parameters.filter((parameter) => parameter.in === 'header');
              const queryParameters = parameters.filter((parameter) => parameter.in === 'query');
              const pathParameters = parameters.filter((parameter) => parameter.in === 'path');
              if (headerParameters.length) {
                node.parameters.push({
                  type: 'header',
                  ...parseParameters(headerParameters, content as SchemaJsonV2),
                });
              }
              if (pathParameters.length) {
                node.parameters.push({
                  type: 'path',
                  ...parseParameters(pathParameters, content as SchemaJsonV2),
                });
              }
              if (queryParameters.length) {
                node.parameters.push({
                  type: 'query',
                  ...parseParameters(queryParameters, content as SchemaJsonV2),
                });
              }
              if (bodyParameter) {
                // 理论上来说 bodyParameters 只会有一个
                const apiNodeBodyParameter: APIParameter = {
                  type: 'body',
                };
                if ('schema' in bodyParameter && bodyParameter.schema.$ref) {
                  const { fields, definitions } = parseDefinitions(bodyParameter.schema.$ref, content as SchemaJsonV2);
                  apiNodeBodyParameter.fields = fields;
                  apiNodeBodyParameter.definitions = definitions;
                } else {
                  const { fields, definitions } = parseParameters([bodyParameter], content as SchemaJsonV2);
                  apiNodeBodyParameter.fields = fields;
                  apiNodeBodyParameter.definitions = definitions;
                }

                node.parameters.push(apiNodeBodyParameter);
              }
            }

            const successResponse = api.successResponse;
            if (successResponse) {
              let ref = '';
              if ('content' in successResponse) {
                const responseContent = successResponse.content;
                const response = responseContent?.['application/json'] ?? responseContent?.['*/*'];
                if (response?.schema) {
                  if (response.schema?.$ref) {
                    ref = response.schema?.$ref;
                  }
                }
              } else if ('$ref' in successResponse) {
                ref = successResponse.$ref;
              } else if ('schema' in successResponse && successResponse.schema) {
                if ('$ref' in successResponse.schema && successResponse.schema.$ref) {
                  ref = successResponse.schema.$ref;
                } else if (successResponse.schema.type !== 'file') {
                  if (successResponse.schema.type === 'array') {
                    const { type, refs } = formatSchemaType(successResponse.schema);
                    node.response = {
                      fields: [
                        {
                          name: '',
                          type,
                          description: successResponse.schema.description,
                        },
                      ],
                    };
                    if (refs.length) {
                      node.response.definitions = {};
                      refs.forEach((ref) => {
                        const { fields, definitions } = parseDefinitions(ref, content as SchemaJsonV2);
                        node.response!.definitions![ref.split('/').pop() as string] = fields;
                        Object.entries(definitions).forEach(([key, value]) => {
                          node.response!.definitions![key] = value;
                        });
                      });
                    }
                  } else if (successResponse.schema.type === 'object') {
                    const resolveRefs: string[] = [];
                    const fields = Object.entries(successResponse.schema.properties || {}).map(([key, value]) => {
                      const { type, refs } = formatSchemaType(value);
                      if (refs) {
                        resolveRefs.push(...refs);
                      }
                      return {
                        name: key,
                        type,
                        description: value.description,
                      };
                    });
                    const definitions: Record<string, APIField[]> = {};
                    if (resolveRefs.length) {
                      const dedupedRefs = Array.from(new Set(resolveRefs));
                      dedupedRefs.forEach((ref) => {
                        const { fields, definitions: parsedDefinitions } = parseDefinitions(
                          ref,
                          content as SchemaJsonV2,
                        );
                        definitions[ref.split('/').pop() as string] = fields;
                        Object.entries(parsedDefinitions).forEach(([key, value]) => {
                          definitions[key] = value;
                        });
                      });
                    }
                    node.response = {
                      fields,
                      definitions,
                    };
                  } else {
                    node.response = {
                      fields: [
                        {
                          name: '',
                          type: successResponse.schema.type,
                          description: successResponse.schema.description,
                        },
                      ],
                    };
                  }
                }
              }

              if (ref) {
                const { fields, definitions } = parseDefinitions(ref, content as SchemaJsonV2);
                node.response = {
                  fields,
                  definitions,
                };
              }
            }
            return node;
          });
        const doc = await render(apiNodes, symbols);
        result[groupName] = doc.content;
        await fs.ensureDir(outputDir);
        const filePath = path.resolve(outputDir, `${groupName}.${doc.ext}`);
        await fs.writeFile(filePath, doc.content);
      }),
    );
  };
}
