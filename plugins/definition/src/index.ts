import { OpenAPIPlugin, OpenAPIPluginOptions, ParserResult } from '@opas/core'
import { formatCode } from '@opas/helper'
import fs from 'fs-extra'
import { kebabCase } from 'lodash'
import path from 'path'

export interface OpenAPITransformDefinitionPluginOptions extends OpenAPIPluginOptions {
  /**
   * The output dir
   */
  outputDir?: string
  /**
   * The output filename
   */
  outputFilename?: string
}

export default class OpenAPITransformSDKPlugin extends OpenAPIPlugin<OpenAPITransformDefinitionPluginOptions> {
  public transform = async ({ definition, service }: ParserResult) => {
    const { cwd = process.cwd(), outputDir = cwd, outputFilename = kebabCase(service.name) + '.d.ts' } = this.options
    const definitionFilePath = path.resolve(outputDir, outputFilename)
    const formattedContent = await formatCode({
      source: definition,
      filePath: definitionFilePath,
    })
    await fs.writeFile(definitionFilePath, formattedContent, {
      encoding: 'utf8',
    })
  }
}
