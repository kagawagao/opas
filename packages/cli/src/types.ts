export interface Config {
  /**
   * API JSON 地址
   */
  url: string
  /**
   * 命名空间
   */
  namespace: string
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
   * 环境变量
   */
  env?: string
  /**
   * 基础路径
   */
  base?: string
  /**
   * 类型提取中进一步提取的字段
   * @example extractField = 'data'
   */
  extractField?: string
}

export interface OpasConfig {
  /**
   * 配置项
   */
  configs: Config[]
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
   * 环境变量
   */
  env?: string
  /**
   * 基础路径
   */
  base?: string
  /**
   * 类型提取中进一步提取的字段
   * @example extractField = 'data'
   */
  extractField?: string
}

export interface CliOptions {
  config?: string
  namespace?: string | string[]
}
