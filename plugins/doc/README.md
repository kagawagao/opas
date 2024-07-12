# plugin-doc

> doc plugin for OpenAPI toolkit

## Usage

### Install

```sh
npm install @opas/core @opas/plugin-doc
```

### Use

```ts
import { OpenAPIRunner } from '@opas/core';
import OpenAPITransformDocPlugin from '@opas/plugin-doc';

OpenAPIRunner.run([
  {
    url: 'http://petstore.swagger.io/v2/swagger.json',
    namespace: 'pets-store',
    plugins: [
      new OpenAPITransformDocPlugin({
        // plugin options
      }),
    ],
  },
]);
```

## Plugin Options

| Option       | Type                                                         | Description              |
| ------------ | ------------------------------------------------------------ | ------------------------ |
| `outputDir`  | `string?`                                                    | output directory         |
| `grouped`    | `boolean?`                                                   | grouped by tag           |
| `skipOutput` | `boolean?`                                                   | skip output              |
| `onSuccess`  | `(result: Record<string, string>) => void?`                  | on success callback      |
| `tagAlias`   | `TagAliasMapper \| Record<string, string>?`                  | tag alias mapper         |
| `include`    | `((api: ParsedOperation) => boolean) \| RegExp \| string[]?` | include apis             |
| `exclude`    | `((api: ParsedOperation) => boolean) \| RegExp \| string[]?` | exclude apis             |
| `symbols`    | `Partial<LabelSymbol>?`                                      | symbols                  |
| `render`     | `DocumentRender \| 'md'?`                                    | custom document renderer |
