import { OpenApisV2 } from 'dtsgenerator/dist/core/openApiV2'
import { OpenApisV3 } from 'dtsgenerator/dist/core/openApiV3'

export interface ParametersBase {
  name: string
  [p: string]: unknown
  required: boolean
}

export interface QueryParameters extends ParametersBase {
  type: 'query'
}

export interface BodyParameters extends ParametersBase {
  type: 'body'
}

export interface PathParameters extends ParametersBase {
  type: 'path'
}

export interface FormDataParameters extends ParametersBase {
  type: 'formData'
}

export type ParametersType = BodyParameters | QueryParameters | PathParameters | FormDataParameters

export interface API {
  /**
   * api summary
   */
  summary: string
  /**
   * api name
   */
  name: string
  /**
   * api parameters
   */
  parameters: ParametersType[]
  /**
   * api response
   */
  response?: string
  /**
   * api method
   */
  method: string
  /**
   * api url
   */
  url: string
  /**
   * api operationId
   */
  operationId: string
}

export interface Response {
  description: string
  schema?: {
    $ref?: string
    type?: string
  }
}

export interface Parameters {
  in: 'body' | 'path' | 'query'
  name: string
  description: string
  required: boolean
  schema: {
    $ref: string
  }
}

export interface OAS {
  paths: {
    [url: string]: {
      [method: string]: {
        tags: string[]
        description: string
        parameters: Parameters[]
        operationId: string
        summary: string
        responses: {
          [statusCode: number]: Response
        }
      }
    }
  }
  tags: { name: string; description: string }[]
  info: {
    title: string
    version: string
    description: string
    [key: string]: unknown
  }
}

export enum WriteFileMode {
  /**
   * overwrite file if exists
   */
  overwrite = 'overwrite',
  /**
   * skip if file exists
   */
  skip = 'skip',
  /**
   * warn if file exists
   */
  warn = 'warn',
  /**
   * error if file exists
   */
  error = 'error',
}

export interface ApiCreateOptions {
  /**
   * api 名称格式化方法
   */
  nameFormatter?: (
    method: string,
    uri: string,
    parameters: Parameters[],
    rawFormatter: (method: string, url: string, parameters: Parameters[]) => string,
  ) => string
  /**
   * url 格式化方法
   */
  urlFormatter?: (url: string) => string
  openApiVersion?: number
  /**
   * 类型提取中进一步提取的字段
   * @example extractField = 'data'
   */
  extractField?: string | string[]
}

export type WriteFileOptions = {
  /**
   * api file write mode
   * @default overwrite
   */
  api?: WriteFileMode
  /**
   * service file write mode
   * @default warn
   */
  service?: WriteFileMode
}

export interface CreateResponseOptions {
  response?: string
  operationId: string
  service: string
  isV3: boolean
  extractField?: string | string[]
}

export type OpenAPISchemaJSON = OpenApisV2.SchemaJson | OpenApisV3.SchemaJson

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

export type ParsedOperation = Operation & {
  uri: string
  rawUri: string
  formattedUri: string
  method: string
  operationId: string
}
