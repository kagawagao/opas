import { OpenAPIRunner } from '@opas/core'
import fs from 'fs-extra'
import path from 'node:path'
import OpenAPITransformDefinitionPlugin from '../src'

describe('doc', () => {
  it('should generate definition', async () => {
    await OpenAPIRunner.run({
      namespaces: [
        {
          url: path.resolve(__dirname, '../../../openapi_v3.json'),
          namespace: 'pets-store',
        },
      ],
      plugins: [
        new OpenAPITransformDefinitionPlugin({
          outputDir: path.resolve(__dirname, './fixtures'),
        }),
      ],
    })
    const fileContent = await fs.readFile(path.resolve(__dirname, './fixtures/pets-store.d.ts'), 'utf-8')
    expect(fileContent.trim()).not.toEqual('')
  })
})
