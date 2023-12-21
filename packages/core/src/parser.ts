import { camelCase, formatApiUri, pascalCase } from '@opas/helper'
import dtsGenerator, { Schema, readSchemaFromUrl, readSchemasFromFile } from 'dtsgenerator'
import { OpenApisV2 } from 'dtsgenerator/dist/core/openApiV2'
import { OpenApisV3 } from 'dtsgenerator/dist/core/openApiV3'
import { uniqueId } from 'lodash'

export type OpenApis = OpenApisV2.SchemaJson | OpenApisV3.SchemaJson

export type SchemaJsonV2 = OpenApisV2.SchemaJson

export type PathItem = OpenApisV2.SchemaJson.Definitions.PathItem | OpenApisV3.SchemaJson.Definitions.PathItem

export type Operation = OpenApisV2.SchemaJson.Definitions.Operation | OpenApisV3.SchemaJson.Definitions.Operation

export type ParametersList = OpenApisV2.SchemaJson.Definitions.ParametersList

export type ParameterV2 = OpenApisV2.SchemaJson.Definitions.Parameter

export interface ServiceDescriptor {
  name: string
  title: string
  description: string
  version: string
  host: string
  basePath: string
}

export interface ParserOptions {
  /**
   * TypeScript Definitions Namespace
   */
  namespace: string
  /**
   * OpenAPI schema json url, a http(s) url or file path
   */
  url: string
}

export type SchemaApi = Operation & {
  uri: string
  rawUri: string
  formattedUri: string
  method: string
  operationId: string
}

export interface ParserResult extends Record<string, any> {
  schema: Schema
  definition: string
  apis: SchemaApi[]
  service: ServiceDescriptor
}

export default class OpenAPIParser {
  public schema: Schema
  public url: string
  public namespace: string

  public constructor(options: ParserOptions) {
    this.url = options.url
    this.namespace = options.namespace
    this.schema = {} as Schema
  }
  /**
   * parse open api json schema
   */
  public parse = async (): Promise<ParserResult> => {
    const schema = await this.readSchema(this.url)

    const [definition, apis, service] = await Promise.all([
      this.parseDefinition(),
      this.parseApis(),
      this.parseService(),
    ])

    if (!(schema.content as OpenApis).tags) {
      const tags: string[] = []
      apis.forEach((api) => {
        tags.push(...(api.tags || []))
      })

      const tagSet = new Set(tags)

      ;(schema.content as OpenApis).tags = Array.from(tagSet).map((tag) => ({
        name: tag,
        description: tag,
      }))
    }

    return {
      schema,
      definition,
      apis,
      service,
    }
  }

  /**
   * read schema
   * @param url open api json schema url
   * @returns {Promise<Schema>} Schema
   */
  private readSchema = async (url: string): Promise<Schema> => {
    if (/^https?/.test(url)) {
      this.schema = await readSchemaFromUrl(url)
    } else {
      const schemas = await readSchemasFromFile(url)

      this.schema = schemas[0]
    }
    return this.schema
  }

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
    })

    return content
  }

  /**
   * parse apis from open api json schema
   */
  public parseApis = () => {
    const content = this.schema.content as OpenApis
    const apis: SchemaApi[] = []
    const { paths } = content
    for (const uri in paths) {
      const pathItem = paths[uri] as PathItem
      const formattedUri = formatApiUri(uri)
      for (const method in pathItem) {
        const operation = pathItem[method as keyof PathItem] as Operation
        const { requestBody } = operation as OpenApisV3.SchemaJson.Definitions.Operation
        if (requestBody) {
          operation.parameters = operation.parameters || []
          const required = '$ref' in requestBody ? true : requestBody.required
          let schema = undefined
          if ('content' in requestBody) {
            schema = Object.values(requestBody.content)[0].schema
          } else {
            schema = requestBody
          }
          operation.parameters.push({
            name: 'body',
            in: 'body',
            required,
            schema: schema as any,
          })
        }

        apis.push({
          ...operation,
          uri: formattedUri,
          formattedUri,
          rawUri: uri,
          method,
          operationId: operation.operationId || uniqueId(),
        })
      }
    }
    return apis
  }

  /**
   * parse service info from open api json schema
   */
  public parseService = () => {
    const serviceName = camelCase(this.namespace)
    const service: ServiceDescriptor = {
      name: serviceName,
      host: '',
      basePath: '',
      title: '',
      description: '',
      version: '',
    }
    if (this.schema.openApiVersion === 2) {
      const content = this.schema.content as OpenApisV2.SchemaJson
      service.host = content.host || ''
      service.basePath = content.basePath || ''
      service.title = content.info.title
      service.description = content.info.description || ''
      service.version = content.info.version || ''
    } else {
      const content = this.schema.content as OpenApisV3.SchemaJson
      service.host = content.servers?.[0].url ?? ''
      service.basePath = content.servers?.[0].url ?? ''
      service.title = content.info.title
      service.description = content.info.description || ''
      service.version = content.info.version || ''
    }

    return service
  }
}
