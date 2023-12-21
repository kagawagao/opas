import OpenAPITransformer, { TransformerOptions } from './transformer'

export default class OpenAPIRunner {
  public static async runSingle(options: TransformerOptions) {
    const transformer = new OpenAPITransformer(options)
    await transformer.transform()
  }

  public static async run(options: TransformerOptions[]) {
    await Promise.all(options.map(async (option) => await OpenAPIRunner.runSingle(option)))
  }

  public static async runByConfig(config: string) {
    const options = require(config)

    if (Array.isArray(options)) {
      await OpenAPIRunner.run(options)
    } else {
      await OpenAPIRunner.run([options])
    }
  }
}
