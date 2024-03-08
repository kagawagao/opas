# cli

> command line tools which bundle `@opas/core` and `@opas/plugin-app`

## Usage

```bash
npx @opas/cli --help
```

## Commands

- `init`: Initialize `opas` config file
- `app`: Generate API client from OpenAPI 2/3 spec

## Config

you can use all config types which supported by [`cosmiconfig`](https://github.com/cosmiconfig/cosmiconfig)

- `opas.config.cjs`

```javascript
/** @type {import('@opas/cli').OpasConfig} */
const config = {
  configs: [
    {
      url: '', // your open api spec url or file path
      namespace: '', // your namespace
      extractField: '', // extract field from open api spec
    },
  ],
}

module.exports = config
```

> You can find all configuration options in the [OpasConfig](./src/types.ts)
