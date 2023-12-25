# plugin-app

> app plugin for OpenAPI toolkit

## Usage

### Install

```sh
npm install @opas/core @opas/plugin-app
```

### Use

```js
import { OpenAPIRunner } from '@opas/core'
import OpenAPITransformAppPlugin from '@opas/plugin-app'

OpenAPIRunner.run({
  url: 'http://petstore.swagger.io/v2/swagger.json',
  namespace: 'pets-store',
  plugins: [new OpenAPITransformAppPlugin({})],
})
```

## Options

see [src/index.ts](./src/index.ts)
