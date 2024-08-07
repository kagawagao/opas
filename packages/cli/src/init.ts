import { confirm } from '@inquirer/prompts';
import fs from 'fs/promises';
import path from 'node:path';
import { configExplore, logger } from './utils';

const templatePath = path.resolve(__dirname, '../templates');

const templates = {
  typescript: {
    filename: 'opas.config.ts', // 'opas.config.ts
    path: path.resolve(templatePath, 'typescript.tpl'),
  },
  javascript: {
    filename: 'opas.config.cjs',
    path: path.resolve(templatePath, 'javascript.tpl'),
  },
};

async function generateConfigFile() {
  try {
    const useTypeScript = await confirm({
      message: 'Would you like to use TypeScript?',
      default: true,
    });
    const template = useTypeScript ? templates.typescript : templates.javascript;
    logger.info(`Creating ${template.filename}...`);
    const content = await fs.readFile(template.path, 'utf-8');
    await fs.writeFile(path.resolve(process.cwd(), template.filename), content);
    logger.success(`Created ${template.filename}`);
  } catch (error) {
    logger.error(error);
    process.exit(1);
  }
}

const initConfig = async () => {
  // check if the file already exists
  const searchResult = await configExplore.search(process.cwd());
  if (searchResult?.filepath) {
    const overwrite = await confirm({
      message: 'Config file already exists. Do you want to overwrite it?',
      default: false,
    });
    if (overwrite) {
      // remove exist file
      await fs.unlink(searchResult.filepath);
      await generateConfigFile();
    } else {
      logger.info('Exiting...');
    }
  } else {
    await generateConfigFile();
  }
};

export default initConfig;
