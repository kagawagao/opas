# plugin-app

> app plugin for OpenAPI toolkit

## Usage

### Install

```sh
npm install @opas/core @opas/plugin-app
```

### Use

```ts
import { OpenAPIRunner } from '@opas/core';
import OpenAPITransformAppPlugin from '@opas/plugin-app';

OpenAPIRunner.run([
  {
    url: 'http://petstore.swagger.io/v2/swagger.json',
    namespace: 'pets-store',
    plugins: [
      new OpenAPITransformAppPlugin({
        // plugin options
      }),
    ],
  },
]);
```

## Plugin Options

| Option                | Type                                                                  | Description                      |
| --------------------- | --------------------------------------------------------------------- | -------------------------------- |
| `apiDir`              | `string?`                                                             | api output dir                   |
| `serviceDir`          | `string?`                                                             | service output dir               |
| `dtsDir`              | `string?`                                                             | dts output dir                   |
| `extractPath`         | `string?`                                                             | extractPath for api and service  |
| `extractField`        | `string \| string[]?`                                                 | extract field from response data |
| `baseUrl`             | `string \| ((extractPath?: string) => void)?`                         | base URL                         |
| `writeFileMode`       | `WriteFileMode \| { api?: WriteFileMode; service?: WriteFileMode; }?` | write file mode                  |
| `configParamTypeName` | `string?`                                                             | config param type name           |
| `serviceImportPath`   | `string?`                                                             | service import path              |
| `include`             | `((api: ParsedOperation) => boolean) \| RegExp \| string[]?`          | include filter                   |
| `exclude`             | `((api: ParsedOperation) => boolean) \| RegExp \| string[]?`          | exclude filter                   |
