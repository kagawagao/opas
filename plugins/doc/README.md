# plugin-doc

> doc plugin for OpenAPI toolkit

## Usage

### Install

```sh
npm install @opas/core @opas/plugin-doc
```

### Use

```js
import { OpenAPIRunner } from '@opas/core'
import OpenAPITransformDocPlugin from '@opas/plugin-doc'

OpenAPIRunner.run({
  url: 'http://petstore.swagger.io/v2/swagger.json',
  namespace: 'pets-store',
  plugins: [new OpenAPITransformDocPlugin({})],
})
```

## Options

see [src/index.ts](./src/index.ts)
