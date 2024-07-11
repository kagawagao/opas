import { OpenAPIRunner } from '@opas/core';
import fs from 'fs-extra';
import path from 'node:path';
import OpenAPITransformDocPlugin from '../src';

describe('doc', () => {
  it('should generate doc', async () => {
    await OpenAPIRunner.run([
      {
        url: path.resolve(__dirname, '../../../openapi_v3.json'),
        namespace: 'pets-store',
        plugins: [
          new OpenAPITransformDocPlugin({
            outputDir: path.resolve(__dirname, './fixtures'),
          }),
        ],
      },
    ]);
    const fileContent = await fs.readFile(path.resolve(__dirname, './fixtures/pets-store.md'), 'utf-8');
    expect(fileContent.trim()).not.toEqual('');
  });
});
