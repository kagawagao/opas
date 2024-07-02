import { TransformerOptions } from '@opas/core'
import { OpenAPITransformAppPluginOptions } from '@opas/plugin-app'

export interface Config extends TransformerOptions, Pick<OpenAPITransformAppPluginOptions, 'extractField'> {
  /**
   * 生成的类型定义文件目录
   */
  dtsDir?: string
  /**
   * 生成的 service 文件目录
   */
  serviceDir?: string
  /**
   * 生成的 api 文件目录
   */
  apiDir?: string
  /**
   * 生成的 docs 文件目录
   */
  docsDir?: string
  /**
   * 环境变量
   */
  env?: string
  /**
   * 基础路径
   */
  base?: string
}

export interface OpasConfig
  extends Pick<Config, 'apiDir' | 'docsDir' | 'dtsDir' | 'serviceDir' | 'env' | 'base' | 'extractField'> {
  /**
   * 配置项
   */
  configs: Config[]
  /**
   * 请求参数配置类型名称
   * @default AxiosRequestConfig
   */
  configParamTypeName?: string
}

export interface CliOptions {
  config?: string
  namespace?: string | string[]
}
