import { OpenAPIPlugin, OpenAPIPluginOptions, ParserResult } from '@opas/core'
import {
  ParsedOperation,
  ServiceDescriptor,
  WriteFileMode,
  createRenderer,
  formatCode,
  formatService,
  outFile,
} from '@opas/helper'
import { Schema } from 'dtsgenerator'
import { kebabCase } from 'lodash'
import os from 'node:os'
import path from 'node:path'
import { DEFAULT_API_AST_TEMPLATE, DEFAULT_REQUEST_CONFIG_PARAM_TYPE_NAME, DEFAULT_SERVICE_DIR } from './constants'

export type PluginWriteFileMode =
  | string
  | WriteFileMode
  | {
      api?: WriteFileMode
      service?: WriteFileMode
    }

export interface OpenAPITransformAppPluginOptions extends OpenAPIPluginOptions {
  // api 输出目录
  apiDir?: string
  // service 输出目录
  serviceDir?: string
  // dts 输出目录
  dtsDir?: string
  // extractPath 用于提取 url 中的公共前缀
  extractPath?: string
  /**
   * 类型提取中进一步提取的字段
   * @example extractField = 'data'
   */
  extractField?: string | string[]
  baseUrl?: string | ((extractPath?: string) => void)
  /**
   * 值为WriteMode ，则 api 和 service都用这个类型.
   * 值为WriteFileOptions，则 api 和 service单独设置.
   *
   * @default 'warn'
   */
  writeFileMode?:
    | WriteFileMode
    | {
        api?: WriteFileMode
        service?: WriteFileMode
      }

  /**
   * 请求参数配置类型名称
   * @default AxiosRequestConfig
   */
  configParamTypeName?: string
}

export default class OpenAPITransformAppPlugin extends OpenAPIPlugin<OpenAPITransformAppPluginOptions> {
  public transform = async ({ apis, definition, service, schema }: ParserResult) => {
    const { writeFileMode } = this.options
    const { api: apiMode = 'skip', service: serviceMode = 'warn' } = this.adaptorWriteFileModeArgs(writeFileMode)
    await this.outputApis({
      apis,
      service,
      writeFileMode: apiMode,
      openApiVersion: schema.openApiVersion ?? 2,
      configParamTypeName: this.options.configParamTypeName ?? DEFAULT_REQUEST_CONFIG_PARAM_TYPE_NAME,
      schema,
    })
    await this.outputService(service.basePath, service, serviceMode)
    await this.outputDts(service, definition)
  }

  private outputDts = async (service: ServiceDescriptor, definition: string) => {
    const { cwd = process.cwd(), dtsDir = path.join(cwd, 'src/interfaces') } = this.options
    const dtsFile = path.join(dtsDir, `${kebabCase(service.name)}.d.ts`)

    const formattedContent = await formatCode({
      source: definition,
      filePath: dtsFile,
    })

    await outFile({
      tips: {
        start: 'start generate dts file',
        error: 'dts file generate failed',
        success: `dts file generate success: ${dtsFile}`,
      },
      code: formattedContent,
      outFileName: dtsFile,
      writeFileMode: 'overwrite',
    })
  }

  private outputService = async (basePath = '', service: ServiceDescriptor, writeFileMode: WriteFileMode | string) => {
    const { cwd = process.cwd(), serviceDir = path.join(cwd, 'src/services'), extractPath = '', baseUrl } = this.options
    const serviceName = service.name
    const mergedPath = basePath + extractPath
    const code = `import Service from '../utils/service'
 const ${serviceName}Service = new Service({
   baseURL: ${typeof baseUrl === 'function' ? baseUrl(mergedPath) : `'${baseUrl + mergedPath}'`},
   headers: {},
 })
 export default ${formatService(serviceName)}`
    const outFileName = serviceDir + `/${kebabCase(serviceName)}.ts`
    const formattedContent = await formatCode({
      source: code,
      filePath: outFileName,
      parser: 'typescript',
    })

    await outFile({
      tips: {
        start: 'start generate service file',
        error: 'service file generate failed',
        success: `service file generate success: ${outFileName}`,
      },
      code: formattedContent,
      outFileName,
      writeFileMode,
    })
  }

  private outputApis = async ({
    apis,
    service,
    writeFileMode,
    openApiVersion,
    configParamTypeName = DEFAULT_REQUEST_CONFIG_PARAM_TYPE_NAME,
    schema,
  }: {
    apis: ParsedOperation[]
    service: ServiceDescriptor
    writeFileMode: WriteFileMode | string
    openApiVersion: 2 | 3
    configParamTypeName: string
    schema: Schema
  }) => {
    const { cwd = process.cwd(), apiDir = path.join(cwd, 'src/apis'), extractField } = this.options
    const serviceName = service.name
    const render = createRenderer(DEFAULT_API_AST_TEMPLATE, {
      openApiVersion,
      extractField,
      configParamTypeName,
      schema,
    })
    // add service import code
    const importServiceCode = this.createServiceImport(service)
    // add apis
    const apisCode = apis
      .map((api) => {
        return render(api, serviceName)
      })
      .join(os.EOL)
    const serviceFileName = kebabCase(serviceName)
    const outFileName = path.join(apiDir, `${serviceFileName}.ts`)

    const content = `
    import type { ${configParamTypeName} } from 'axios';

    ${importServiceCode}
    ${apisCode}
    `

    const formattedContent = await formatCode({
      source: content,
      filePath: outFileName,
      parser: 'typescript',
    })

    await outFile({
      tips: {
        start: 'start generate api file',
        error: 'api file generate failed',
        success: `api file generate success: ${outFileName}`,
      },
      outFileName,
      code: formattedContent,
      writeFileMode,
    })
  }

  private createServiceImport = (service: ServiceDescriptor) => {
    const serviceName = service.name
    const importee = formatService(serviceName)
    const serviceFileName = kebabCase(serviceName)
    const importer = path.posix.join(DEFAULT_SERVICE_DIR, serviceFileName)
    return `import ${importee} from '${importer}';`
  }

  private adaptorWriteFileModeArgs = (writeFileMode: PluginWriteFileMode = 'warn') => {
    if (typeof writeFileMode === 'string') {
      return {
        api: writeFileMode,
        service: writeFileMode,
      }
    }
    return writeFileMode
  }
}
