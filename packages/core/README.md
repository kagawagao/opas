# @opas/core

> core package for OpenAPI toolkit

## Install

```sh
npm install @opas/core
```

## Usage

```typescript
import { OpenAPIRunner } from '@opas/core'

await OpenAPIRunner.run([
  {
    url: `your open api spec url or file path`,
    namespace: `your namespace`,
    plugins: [], // apply plugins here
    postSchema: (schema: Schema) => PromiseLike<Schema> | Schema?, // Option | Type | Description
  },
])
```

## APIs

### `OpenAPIParser`

Parse OpenAPI spec

#### Parser Options

| Option       | Type                                                 | Description                                         |
| ------------ | ---------------------------------------------------- | --------------------------------------------------- |
| `namespace`  | `string`                                             | TypeScript Definitions Namespace                    |
| `url`        | `string`                                             | OpenAPI schema json url, a http(s) url or file path |
| `postSchema` | `(schema: Schema) => PromiseLike<Schema> \| Schema?` | post process schema                                 |

### `OpenAPIPlugin`

Base class for OpenAPI plugin

#### Plugin Options

| Option | Type      | Description               |
| ------ | --------- | ------------------------- |
| `cwd`  | `string?` | Current working directory |

### `OpenAPIRunner`

Run OpenAPI plugins

#### Runner Options

| Option       | Type                                     | Description                           |
| ------------ | ---------------------------------------- | ------------------------------------- |
| `plugins`    | `OpenAPIPlugin<OpenAPIPluginOptions>[]?` | List of OpenAPI plugins               |
| `namespaces` | `ParserOptions[]`                        | List of parser options for namespaces |

### `OpenAPITransformer`

Transform OpenAPI spec

#### Transformer Options

transformer options extends `OpenAPIParserOptions`, and adds the following options:

| Option    | Type                                     | Description             |
| --------- | ---------------------------------------- | ----------------------- |
| `plugins` | `OpenAPIPlugin<OpenAPIPluginOptions>[]?` | List of OpenAPI plugins |
