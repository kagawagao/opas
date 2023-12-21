import { OpenAPIPlugin, OpenAPIPluginOptions, ParserResult } from '@opas/core'
import { formatCode } from '@opas/helper'
import fs from 'fs-extra'
import { kebabCase } from 'lodash'
import path from 'path'

export interface OpenAPITransformDefinitionPluginOptions extends OpenAPIPluginOptions {
  definitionDir?: string
  outputFilename?: string
}

export default class SwaggerTransformSDKPlugin extends OpenAPIPlugin<OpenAPITransformDefinitionPluginOptions> {
  public transform = async ({ definition, service }: ParserResult) => {
    const {
      cwd = process.cwd(),
      definitionDir = path.resolve(cwd, 'src/interfaces'),
      outputFilename = kebabCase(service.name) + '.d.ts',
    } = this.options

    await fs.ensureDir(definitionDir)

    const definitionFilePath = path.resolve(definitionDir, outputFilename)
    const formattedContent = await formatCode({
      source: definition,
      filePath: definitionFilePath,
    })
    await fs.writeFile(definitionFilePath, formattedContent, {
      encoding: 'utf8',
    })
  }
}
