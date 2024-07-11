# plugin-sdk

> sdk plugin for OpenAPI toolkit

## Usage

### Install

```sh
npm install @opas/core @opas/plugin-sdk
```

### Use

```ts
import { OpenAPIRunner } from '@opas/core';
import OpenAPITransformSDKPlugin from '@opas/plugin-sdk';

OpenAPIRunner.run([
  {
    url: 'http://petstore.swagger.io/v2/swagger.json',
    namespace: 'pets-store',
    plugins: [
      new OpenAPITransformSDKPlugin({
        // plugin options
      }),
    ],
  },
]);
```

## Plugin Options

| Option           | Type                                                         | Description                            |
| ---------------- | ------------------------------------------------------------ | -------------------------------------- |
| `outputDir`      | `string?`                                                    | Output directory for the generated SDK |
| `tagAlias`       | `TagAliasMapper \| Record<string, string>?`                  | Mapping of tag names to aliases        |
| `classTemplate`  | `string?`                                                    | Template for generating class files    |
| `methodTemplate` | `string?`                                                    | Template for generating method files   |
| `include`        | `((api: ParsedOperation) => boolean) \| RegExp \| string[]?` | Criteria to include APIs               |
| `exclude`        | `((api: ParsedOperation) => boolean) \| RegExp \| string[]?` | Criteria to exclude APIs               |
