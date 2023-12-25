# plugin-sdk

> sdk plugin for OpenAPI toolkit

## Usage

### Install

```sh
npm install @opas/core @opas/plugin-sdk
```

### Use

```js
import { OpenAPIRunner } from '@opas/core'
import OpenAPITransformSDKPlugin from '@opas/plugin-sdk'

OpenAPIRunner.run({
  url: 'http://petstore.swagger.io/v2/swagger.json',
  namespace: 'pets-store',
  plugins: [new OpenAPITransformSDKPlugin({})],
})
```

## Options

see [src/index.ts](./src/index.ts)
