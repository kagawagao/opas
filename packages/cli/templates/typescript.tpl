import { OpasConfig } from '@opas/cli';

const config: OpasConfig = {
  configs: [
    {
      url: '', // your open api spec url or file path
      namespace: '', // your namespace
      extractField: '', // extract field from open api spec
    },
  ],
};

export default config;
