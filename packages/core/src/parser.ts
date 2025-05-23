import {
  OpenAPISchemaJSON,
  Operation,
  ParsedOperation,
  PathItem,
  ServiceDescriptor,
  camelCase,
  pascalCase,
} from '@opas/helper';
import dtsGenerator, { Schema, readSchemaFromUrl, readSchemasFromFile } from 'dtsgenerator';
import { OpenApisV2 } from 'dtsgenerator/dist/core/openApiV2';
import { OpenApisV3 } from 'dtsgenerator/dist/core/openApiV3';
import { uniqueId } from 'lodash';

export interface ParserOptions {
  /**
   * TypeScript Definitions Namespace
   */
  namespace: string;
  /**
   * OpenAPI schema json url, a http(s) url or file path
   */
  url: string;
  /**
   * post process schema
   */
  postSchema?: (schema: Schema) => PromiseLike<Schema> | Schema;
}

export interface ParserResult extends Record<string, any> {
  schema: Schema;
  definition: string;
  apis: ParsedOperation[];
  service: ServiceDescriptor;
  tags: string[];
}

export default class OpenAPIParser {
  public schema: Schema;
  public url: string;
  public namespace: string;
  public postSchema?: (schema: Schema) => PromiseLike<Schema> | Schema;

  public constructor(options: ParserOptions) {
    this.url = options.url;
    this.namespace = options.namespace;
    this.schema = {} as Schema;
    this.postSchema = options.postSchema;
  }

  /**
   * parse open api json schema
   */
  public parse = async (): Promise<ParserResult> => {
    const schema = await this.readSchema(this.url);

    const [definition, apis, service] = await Promise.all([
      this.parseDefinition(),
      this.parseApis(),
      this.parseService(),
    ]);

    const tags: string[] = [];
    if (!(schema.content as OpenAPISchemaJSON).tags) {
      apis.forEach((api) => {
        tags.push(...(api.tags || []));
      });

      const tagSet = new Set(tags);

      (schema.content as OpenAPISchemaJSON).tags = Array.from(tagSet).map((tag) => ({
        name: tag,
        description: tag,
      }));
    }

    return {
      schema,
      definition,
      apis,
      service,
      tags,
    };
  };

  /**
   * read schema
   * @param url open api json schema url
   * @returns {Promise<Schema>} Schema
   */
  private readSchema = async (url: string): Promise<Schema> => {
    if (/^https?/.test(url)) {
      this.schema = await readSchemaFromUrl(url);
    } else {
      const schemas = await readSchemasFromFile(url);

      this.schema = schemas[0];
    }
    // post process schema
    if (this.postSchema) {
      this.schema = await this.postSchema(this.schema);
    }
    return this.schema;
  };

  /**
   * parse definition from open api json schema
   */
  public parseDefinition = async () => {
    const content = await dtsGenerator({
      contents: [this.schema],
      config: {
        plugins: {
          '@dtsgenerator/replace-namespace': {
            map: [
              {
                from: [true],
                to: [pascalCase(this.namespace)],
              },
            ],
          },
        },
      },
    });

    return content;
  };

  /**
   * parse apis from open api json schema
   */
  public parseApis = () => {
    const content = this.schema.content as OpenAPISchemaJSON;
    const apis: ParsedOperation[] = [];
    const { paths } = content;
    for (const uri in paths) {
      const pathItem = paths[uri] as PathItem;
      for (const method in pathItem) {
        const operation = pathItem[method as keyof PathItem] as Operation;
        if ('requestBody' in operation && operation.requestBody) {
          const { requestBody } = operation;
          operation.parameters = operation.parameters || [];
          const required = '$ref' in requestBody ? true : requestBody.required;
          // check is formData
          if ('content' in requestBody) {
            Object.entries(requestBody.content).forEach(([mediaType, content]) => {
              const schema = content.schema;
              if (mediaType.includes('form-data')) {
                operation.parameters!.push({
                  name: 'formData',
                  in: 'formData',
                  required,
                  schema: schema as any,
                });
              } else if (mediaType.includes('application/x-www-form-urlencoded')) {
                operation.parameters!.push({
                  name: 'query',
                  in: 'query',
                  required,
                  schema: schema as any,
                });
              } else {
                operation.parameters!.push({
                  name: 'body',
                  in: 'body',
                  required,
                  schema: schema as any,
                });
              }
            });
          } else {
            const schema = requestBody;
            operation.parameters.push({
              name: 'body',
              in: 'body',
              required,
              schema: schema as any,
            });
          }
        }

        let successResponseKey = '200';
        if (operation.responses) {
          const keys = Object.keys(operation.responses);
          const findKey = keys.find((key) => key.startsWith('2'));
          if (findKey) {
            successResponseKey = findKey;
          } else if (!successResponseKey && keys.includes('default')) {
            successResponseKey = 'default';
          }
        }

        const successResponse = operation.responses[successResponseKey];

        const parsedOperation: ParsedOperation = {
          ...operation,
          uri,
          method,
          operationId: operation.operationId || uniqueId(),
          successResponse,
        };

        apis.push(parsedOperation);
      }
    }
    // sort apis by uri
    return apis.sort((a, b) => a.uri.localeCompare(b.uri));
  };

  /**
   * parse service info from open api json schema
   */
  public parseService = () => {
    const serviceName = camelCase(this.namespace);
    const service: ServiceDescriptor = {
      name: serviceName,
      host: '',
      basePath: '',
      title: '',
      description: '',
      version: '',
    };
    if (this.schema.openApiVersion === 2) {
      const content = this.schema.content as OpenApisV2.SchemaJson;
      service.host = content.host || '';
      service.basePath = content.basePath || '';
      service.title = content.info.title;
      service.description = content.info.description || '';
      service.version = content.info.version || '';
    } else {
      const content = this.schema.content as OpenApisV3.SchemaJson;
      service.host = content.servers?.[0].url ?? '';
      service.basePath = content.servers?.[0].url ?? '';
      service.title = content.info.title;
      service.description = content.info.description || '';
      service.version = content.info.version || '';
    }

    return service;
  };
}
