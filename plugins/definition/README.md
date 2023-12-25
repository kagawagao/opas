# plugin-definition

> definition plugin for OpenAPI toolkit

## Usage

### Install

```sh
npm install @opas/core @opas/plugin-definition
```

### Use

```js
import { OpenAPIRunner } from '@opas/core'
import OpenAPITransformDefinitionPlugin from '@opas/plugin-definition'

OpenAPIRunner.run({
  url: 'http://petstore.swagger.io/v2/swagger.json',
  namespace: 'pets-store',
  plugins: [new OpenAPITransformDefinitionPlugin({})],
})
```

## Options

see [src/index.ts](./src/index.ts)
