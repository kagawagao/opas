# OPAS

Open API toolkit for TS/JS

## Features

- [x] Generate API definitions from OpenAPI 2/3 spec
- [x] Generate API docs from OpenAPI 2/3 spec
- [x] Generate API client from OpenAPI 2/3 spec
- [x] Generate API SDK from OpenAPI 2/3 spec
- [ ] Generate UI from OpenAPI 2/3 spec

## Fundamentals

### Core packages

- [`@opas/core`](./packages/core) - Core package for OpenAPI toolkit
- [`@opas/cli`](./packages/cli/) - CLI for OpenAPI toolkit
- [`@opas/helpers`](./packages/helper) - helper functions for OpenAPI toolkit

### Plugins

- [`@opas/plugin-app`](./plugins/app) - Plugin for generating API client
- [`@opas/plugin-sdk`](./plugins/sdk) - Plugin for generating API SDK
- [`@opas/plugin-doc`](./plugins/doc) - Plugin for generating API docs
- [`@opas/plugin-definition`](./plugins/definition) - Plugin for generating API definitions

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
