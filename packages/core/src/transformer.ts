import OpenAPIParser from './parser'
import OpenAPIPlugin, { OpenAPIPluginOptions } from './plugin'

export interface TransformerOptions {
  url: string
  namespace: string
  plugins?: OpenAPIPlugin<OpenAPIPluginOptions>[]
}

export default class OpenAPITransformer {
  public options: TransformerOptions
  public parser: OpenAPIParser
  public plugins: OpenAPIPlugin<OpenAPIPluginOptions>[]
  constructor(options: TransformerOptions) {
    this.options = options
    this.parser = new OpenAPIParser(options)
    this.plugins = options.plugins || []
  }

  public transform = async () => {
    const result = await this.parser.parse()

    await Promise.all(this.plugins.map(async (plugin) => await plugin.transform(result)))
  }
}
