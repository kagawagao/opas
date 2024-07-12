import path from 'node:path';
import { OpenAPIRunner } from '../src';

describe('core', () => {
  it('should work with open api v2', async () => {
    await OpenAPIRunner.run([
      {
        url: path.resolve(__dirname, '../../../openapi_v2.json'),
        namespace: 'artist',
      },
    ]);
  });
  it('should work with open api v3', async () => {
    await OpenAPIRunner.run([
      {
        url: path.resolve(__dirname, '../../../openapi_v3.json'),
        namespace: 'pets-store',
      },
    ]);
  });
});
