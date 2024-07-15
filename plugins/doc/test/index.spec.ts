import { OpenAPIRunner } from '@opas/core';
import fs from 'fs-extra';
import path from 'node:path';
import OpenAPITransformDocPlugin from '../src';

describe('doc', () => {
  it('should generate doc with open api v3', async () => {
    await OpenAPIRunner.run([
      {
        url: path.resolve(__dirname, '../../../openapi_v3.json'),
        namespace: 'pets-store',
        plugins: [
          new OpenAPITransformDocPlugin({
            outputDir: path.resolve(__dirname, './fixtures'),
            render: 'doc',
          }),
        ],
      },
    ]);
    const fileContent = await fs.readFile(path.resolve(__dirname, './fixtures/pets-store.md'), 'utf-8');
    expect(fileContent.trim()).not.toEqual('');
  });
  it('should generate doc with open api v2', async () => {
    await OpenAPIRunner.run([
      {
        url: path.resolve(__dirname, '../../../openapi_v2.json'),
        namespace: 'artist',
        plugins: [
          new OpenAPITransformDocPlugin({
            outputDir: path.resolve(__dirname, './fixtures'),
            render: 'md',
          }),
        ],
      },
    ]);
    const fileContent = await fs.readFile(path.resolve(__dirname, './fixtures/artist.md'), 'utf-8');
    expect(fileContent.trim()).not.toEqual('');
  });
});
