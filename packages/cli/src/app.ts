import { OpenAPIPlugin, OpenAPIRunner } from '@opas/core'
import { WriteFileMode } from '@opas/helper'
import AppPlugin, { OpenAPITransformAppPluginOptions } from '@opas/plugin-app'
import chalk from 'chalk'
import { CliOptions } from './types'
import { getPathFromWorkDir, logger, resolveConfig } from './utils'

const transformApp = async (options: CliOptions) => {
  const { namespace: namespaces, config: configPath } = options

  const namespaceList = namespaces ? (Array.isArray(namespaces) ? namespaces : [namespaces]) : []

  const config = await resolveConfig(configPath)

  if (!config) {
    logger.error(chalk.redBright('No config file found'))
    process.exit(0)
  } else {
    const {
      configs = [],
      dtsDir: globalDtsDir = getPathFromWorkDir('src/interfaces'),
      serviceDir: globalServiceDir = getPathFromWorkDir('src/services'),
      apiDir: globalApiDir = getPathFromWorkDir('src/apis'),
      env: globalEnv,
      base: globalBase,
      extractField: globalExtractField,
      configParamTypeName,
    } = config
    await OpenAPIRunner.run(
      configs
        .filter(({ namespace, url }) => {
          if (!url) {
            logger.error(chalk.redBright(`${namespace}: url is required`))
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
            ...options
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
                if (extractPath.startsWith('http')) {
                  // absolute path
                  return `'${extractPath}'`
                } else if (base) {
                  // relative path
                  return `'${base}' + '${extractPath}'`
                } else if (env) {
                  // env path
                  return `${env} + '${extractPath}'`
                }
                // default path
                return `'${extractPath}'`
              },
              extractField,
              configParamTypeName,
            }),
          ]

          return {
            ...options,
            url,
            namespace,
            plugins,
          }
        }),
    )
  }
  console.log()
}

export default transformApp
