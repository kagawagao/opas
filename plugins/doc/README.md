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

| Option      | Type                                                         | Description                                                                              |
| ----------- | ------------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| `outputDir` | `string?`                                                    | output directory                                                                         |
| `grouped`   | `boolean?`                                                   | grouped by tag                                                                           |
| `tagAlias`  | `TagAliasMapper \| Record<string, string>?`                  | tag alias mapper                                                                         |
| `include`   | `((api: ParsedOperation) => boolean) \| RegExp \| string[]?` | include apis                                                                             |
| `exclude`   | `((api: ParsedOperation) => boolean) \| RegExp \| string[]?` | exclude apis                                                                             |
| `locale`    | `Partial<LocaleData> \| string?`                             | locale data or internal support locale                                                   |
| `render`    | `DocumentRender \| InternalRenderType?`                      | specify render type or use custom render, see [Support Render](#support-render) for more |

## Support Render

- `md`: markdown
- `doc`: word document

> PRs are welcome to add more render support.
