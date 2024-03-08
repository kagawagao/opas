#!/usr/bin/env node
import { program } from 'commander'
import fs from 'fs-extra'
import path from 'path'
import transformApp from './app'
import initConfig from './init'

export * from './types'

const pkg = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../package.json'), 'utf-8'))

program.name('opas').description('command line tools for opas').version(pkg.version, '-v, --version')

program.command('init').description('init opas config files in current working directory').action(initConfig)

program
  .command('app', {
    isDefault: true,
  })
  .description('generate api client code from open api spec')
  .option('-c, --config <config path>', 'oasis config path')
  .option('-n, --namespace <namespace...>', 'namespace to generate')
  .action(transformApp)

program.parse(process.argv)
