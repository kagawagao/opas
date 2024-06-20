import generate from '@babel/generator'
import template from '@babel/template'
import { Statement } from '@babel/types'
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
import fs from 'fs-extra'
import { kebabCase } from 'lodash'
import os from 'node:os'
import path from 'node:path'
import { DEFAULT_REQUEST_CONFIG_PARAM_TYPE_NAME, DEFAULT_SERVICE_DIR } from './constants'

export type PluginWriteFileMode =
  | string
  | WriteFileMode
  | {
      api?: WriteFileMode
      service?: WriteFileMode
    }

export interface OpenAPITransformAppPluginOptions extends OpenAPIPluginOptions {
  // api output dir
  apiDir?: string
  // service output dir
  serviceDir?: string
  // dts output dir
  dtsDir?: string
  // extractPath for api and service
  extractPath?: string
  /**
   * extract field from response data
   * @example extractField = 'data'
   */
  extractField?: string | string[]
  baseUrl?: string | ((extractPath?: string) => void)
  /**
   * write file mode
   * @default 'warn'
   */
  writeFileMode?:
    | WriteFileMode
    | {
        api?: WriteFileMode
        service?: WriteFileMode
      }
  /**
   * config param type name
   * @default AxiosRequestConfig
   */
  configParamTypeName?: string
  /**
   * service import path
   */
  serviceImportPath?: string
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

  private joinUrl = (pre: string = '', next: string = '') => {
    if (next.startsWith('http')) {
      return next
    } else {
      return pre.replace(/\/$/, '') + '/' + next.replace(/^\//, '')
    }
  }

  private outputService = async (basePath = '', service: ServiceDescriptor, writeFileMode: WriteFileMode | string) => {
    const {
      cwd = process.cwd(),
      serviceDir = path.join(cwd, 'src/services'),
      extractPath = '',
      baseUrl,
      serviceImportPath = '../utils/service',
    } = this.options
    const serviceName = service.name
    const mergedPath = this.joinUrl(basePath, extractPath)
    const templateSource = await fs.readFile(path.join(__dirname, '../templates/service.tpl'), {
      encoding: 'utf-8',
    })

    const templateAst = template(templateSource, {
      plugins: ['typescript'],
    })
    const statements = templateAst({
      SERVICE_NAME: `${serviceName}Service`,
      BASE_URL: typeof baseUrl === 'function' ? baseUrl(mergedPath) : `'${this.joinUrl(baseUrl, mergedPath)}'`,
      SERVICE_PATH: serviceImportPath,
    }) as Statement[]

    const code = statements.map((statement) => generate(statement).code).join('\n')
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
    const apiAstTemplate = await fs.readFile(path.join(__dirname, '../templates/api.tpl'), {
      encoding: 'utf-8',
    })
    const render = createRenderer(apiAstTemplate, {
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
