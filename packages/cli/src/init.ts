import fs from 'fs/promises'
import inquirer from 'inquirer'
import path from 'node:path'
import { logger } from './utils'

const templatePath = path.resolve(__dirname, '../templates')

const templates = {
  typescript: {
    filename: 'opas.config.ts', // 'opas.config.ts
    path: path.resolve(templatePath, 'typescript.tpl'),
  },
  javascript: {
    filename: 'opas.config.cjs',
    path: path.resolve(templatePath, 'javascript.tpl'),
  },
}

interface UserAnswer {
  useTypeScript: boolean
}

const initConfig = async () => {
  try {
    const { useTypeScript } = await inquirer.prompt<UserAnswer>([
      {
        type: 'confirm',
        name: 'useTypeScript',
        message: 'Would you like to use TypeScript?',
        default: true,
      },
    ])
    const template = useTypeScript ? templates.typescript : templates.javascript
    logger.info(`Creating ${template.filename}...`)
    const content = await fs.readFile(template.path, 'utf-8')
    await fs.writeFile(path.resolve(process.cwd(), template.filename), content)
    logger.success(`Created ${template.filename}`)
  } catch (error) {
    logger.error(error)
    process.exit(1)
  }
}

export default initConfig
