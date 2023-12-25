#!/usr/bin/env node
import { OpenAPIPlugin, OpenAPIRunner } from '@opas/core'
import { WriteFileMode } from '@opas/helper'
import AppPlugin, { OpenAPITransformAppPluginOptions } from '@opas/plugin-app'
import chalk from 'chalk'
import { program } from 'commander'
import { CosmiconfigResult, cosmiconfig } from 'cosmiconfig'
import path from 'path'
import signale from 'signale'

const configExplore = cosmiconfig('oasis')

const workDir = process.cwd()

function getPathFromWorkDir(...args: string[]) {
  return path.resolve(workDir, ...args)
}

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

export interface OasisConfig {
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

interface CliOptions {
  config?: string
  namespace?: string | string[]
}

program
  .option('-c, --config <config path>', 'oasis config path')
  .option('-n, --namespace <namespaces...>', 'namespace filter')
  .action(async (options: CliOptions) => {
    const { namespace: namespaces, config: configPath } = options

    const namespaceList = namespaces ? (Array.isArray(namespaces) ? namespaces : [namespaces]) : []

    let searchResult: CosmiconfigResult
    if (configPath) {
      searchResult = await configExplore.load(configPath)
    } else {
      searchResult = await configExplore.search()
    }

    if (!searchResult) {
      signale.error(chalk.redBright('No config file found'))
      process.exit(0)
    } else {
      const { config } = searchResult
      const {
        configs = [],
        dtsDir: globalDtsDir = getPathFromWorkDir('src/interfaces'),
        serviceDir: globalServiceDir = getPathFromWorkDir('src/services'),
        apiDir: globalApiDir = getPathFromWorkDir('src/apis'),
        env: globalEnv,
        base: globalBase,
        extractField: globalExtractField,
      } = config as OasisConfig
      await OpenAPIRunner.run(
        configs
          .filter(({ namespace, url }) => {
            if (!url) {
              signale.error(chalk.redBright(`${namespace}: url is required`))
              return false
            }
            if (namespaceList.length === 0) {
              return true
            }
            return namespaceList.includes(namespace)
          })
          .map((item) => {
            const {
              url,
              namespace,
              apiDir = globalApiDir,
              dtsDir = globalDtsDir,
              serviceDir = globalServiceDir,
              env = globalEnv,
              base = globalBase,
              extractField = globalExtractField,
            } = item

            const plugins: OpenAPIPlugin<OpenAPITransformAppPluginOptions>[] = [
              new AppPlugin({
                serviceDir,
                apiDir,
                dtsDir,
                writeFileMode: {
                  api: WriteFileMode.overwrite,
                  service: WriteFileMode.warn,
                },
                baseUrl: (extractPath = '') => {
                  if (base) {
                    return `'${base}' + '${extractPath}'`
                  }
                  return `process.env.${env} + '${extractPath}'`
                },
                extractField,
              }),
            ]

            return {
              url,
              namespace,
              plugins,
            }
          }),
      )
    }
    console.log()
  })
  .parse(process.argv)
