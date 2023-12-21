import { ParserResult } from './parser'

export interface IOpenAPIPlugin {
  transform: (result: ParserResult) => void | Promise<void>
}

export interface OpenAPIPluginOptions {
  cwd?: string
}

export default abstract class OpenAPIPlugin<T extends OpenAPIPluginOptions> implements IOpenAPIPlugin {
  protected options: T
  constructor(options: T) {
    this.options = options || {}
  }

  public abstract transform: (result: ParserResult) => void | Promise<void>
}
