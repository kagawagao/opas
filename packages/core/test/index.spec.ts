import path from 'node:path';
import { OpenAPIRunner } from '../src';

describe('doc', () => {
  it('should run without crash', async () => {
    await OpenAPIRunner.run([
      {
        url: path.resolve(__dirname, '../../../openapi_v3.json'),
        namespace: 'pets-store',
      },
    ]);
  });
});
