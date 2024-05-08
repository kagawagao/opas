# OPAS

Open API toolkit for TS/JS

[![build](https://github.com/kagawagao/opas/actions/workflows/build.yml/badge.svg)](https://github.com/kagawagao/opas/actions/workflows/build.yml) [![CodeQL](https://github.com/kagawagao/opas/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/kagawagao/opas/actions/workflows/codeql-analysis.yml)

## Features

- [x] Generate API definitions from OpenAPI 2/3 spec
- [x] Generate API docs from OpenAPI 2/3 spec
- [x] Generate API client from OpenAPI 2/3 spec
- [x] Generate API SDK from OpenAPI 2/3 spec
- [ ] Generate UI from OpenAPI 2/3 spec

## Fundamentals

### Core packages

| Package                             | Version                                                                                                     | Description                          |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| [`@opas/core`](./packages/core)     | [![NPM Version](https://img.shields.io/npm/v/%40opas%2Fcore)](https://www.npmjs.com/package/@opas/core)     | Core package for OpenAPI toolkit     |
| [`@opas/cli`](./packages/cli/)      | [![NPM Version](https://img.shields.io/npm/v/%40opas%2Fcli)](https://www.npmjs.com/package/@opas/cli)       | CLI for OpenAPI toolkit              |
| [`@opas/helper`](./packages/helper) | [![NPM Version](https://img.shields.io/npm/v/%40opas%2Fhelper)](https://www.npmjs.com/package/@opas/helper) | Helper functions for OpenAPI toolkit |

### Plugins

| Package                                           | Version                                                                                                                           | Description                           |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| [`@opas/plugin-app`](./plugins/app)               | [![NPM Version](https://img.shields.io/npm/v/%40opas%2Fplugin-app)](https://www.npmjs.com/package/@opas/plugin-app)               | Plugin for generating API client      |
| [`@opas/plugin-sdk`](./plugins/sdk)               | [![NPM Version](https://img.shields.io/npm/v/%40opas%2Fplugin-sdk)](https://www.npmjs.com/package/@opas/plugin-sdk)               | Plugin for generating API SDK         |
| [`@opas/plugin-doc`](./plugins/doc)               | [![NPM Version](https://img.shields.io/npm/v/%40opas%2Fplugin-doc)](https://www.npmjs.com/package/@opas/plugin-doc)               | Plugin for generating API docs        |
| [`@opas/plugin-definition`](./plugins/definition) | [![NPM Version](https://img.shields.io/npm/v/%40opas%2Fplugin-definition)](https://www.npmjs.com/package/@opas/plugin-definition) | Plugin for generating API definitions |

## Usage

### Install

```bash
npm install @opas/core
```

### Example

```typescript
import { OpenAPIRunner } from '@opas/core'
import OpenAPITransformDefinitionPlugin from '@opas/plugin-definition'

await OpenAPIRunner.run([
  {
    url: `your open api spec url or file path`,
    namespace: `your namespace`,
    plugins: [
      new OpenAPITransformDefinitionPlugin({
        outputDir: `your output dir`,
      }),
    ],
  },
])
```

> More examples can be found in the test directory of each plugin
