import { OpenAPIPlugin, OpenAPIRunner } from '@opas/core';
import DocPlugin, { OpenAPITransformDocPluginOptions } from '@opas/plugin-doc';
import chalk from 'chalk';
import { CliOptions } from './types';
import { getPathFromWorkDir, logger, resolveConfig } from './utils';

const transformDoc = async (options: CliOptions) => {
  const { namespace: namespaces, config: configPath } = options;

  const namespaceList = namespaces ? (Array.isArray(namespaces) ? namespaces : [namespaces]) : [];

  const config = await resolveConfig(configPath);

  if (!config) {
    logger.error(chalk.redBright('No config file found'));
    process.exit(0);
  } else {
    const { configs = [], docsDir: globalDocsDir = getPathFromWorkDir('docs') } = config;
    await OpenAPIRunner.run(
      configs
        .filter(({ namespace, url }) => {
          if (!url) {
            logger.error(chalk.redBright(`${namespace}: url is required`));
            return false;
          }
          if (namespaceList.length === 0) {
            return true;
          }
          return namespaceList.includes(namespace);
        })
        .map((item) => {
          const { url, namespace, docsDir = globalDocsDir, ...options } = item;

          const plugins: OpenAPIPlugin<OpenAPITransformDocPluginOptions>[] = [
            new DocPlugin({
              outputDir: docsDir,
            }),
          ];

          return {
            ...options,
            url,
            namespace,
            plugins,
          };
        }),
    );
  }
  console.log();
};

export default transformDoc;
