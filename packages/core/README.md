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
  },
])
```

## APIs

- `OpenAPIParser`: Parse OpenAPI spec
- `OpenAPIPlugin`: Base class for OpenAPI plugin
- `OpenAPIRunner`: Run OpenAPI plugins
- `OpenAPITransformer`: Transform OpenAPI spec
