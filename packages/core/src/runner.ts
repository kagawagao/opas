import { ParserOptions } from './parser'
import OpenAPIPlugin, { OpenAPIPluginOptions } from './plugin'
import OpenAPITransformer, { TransformerOptions } from './transformer'

export interface RunnerOption {
  plugins?: OpenAPIPlugin<OpenAPIPluginOptions>[]
  namespaces: ParserOptions[]
}

/**
 * OpenAPI Runner
 */
export default class OpenAPIRunner {
  /**
   * run single transformer
   * @param options transformer options
   */
  private static async runSingle(options: TransformerOptions) {
    const transformer = new OpenAPITransformer(options)
    await transformer.transform()
  }

  /**
   * run transformers
   * @param options single runner options or multiple transformer options
   */
  public static async run(options: RunnerOption | TransformerOptions[]) {
    if (Array.isArray(options)) {
      await Promise.all(options.map(async (option) => await OpenAPIRunner.runSingle(option)))
    } else {
      const { plugins = [], namespaces } = options
      await Promise.all(
        namespaces.map(
          async (option) =>
            await OpenAPIRunner.runSingle({
              plugins,
              ...option,
            }),
        ),
      )
    }
  }
}
