import { OpenAPIRunner } from '@opas/core'
import fs from 'fs-extra'
import path from 'node:path'
import OpenAPITransformSDKPlugin from '../src'

describe('doc', () => {
  it('should generate sdk with openapi v2', async () => {
    await OpenAPIRunner.run([
      {
        url: path.resolve(__dirname, '../../../openapi_v2.json'),
        namespace: 'artist',
        plugins: [
          new OpenAPITransformSDKPlugin({
            outputDir: path.resolve(__dirname, './fixtures'),
          }),
        ],
      },
    ])
    const fileContent = await fs.readFile(path.resolve(__dirname, './fixtures/artist/index.ts'), 'utf-8')
    expect(fileContent.trim()).not.toEqual('')
  })

  it('should generate sdk with openapi v3', async () => {
    await OpenAPIRunner.run([
      {
        url: path.resolve(__dirname, '../../../openapi_v3.json'),
        namespace: 'pets-store',
        plugins: [
          new OpenAPITransformSDKPlugin({
            outputDir: path.resolve(__dirname, './fixtures'),
          }),
        ],
      },
    ])
    const fileContent = await fs.readFile(path.resolve(__dirname, './fixtures/pets-store/index.ts'), 'utf-8')
    expect(fileContent.trim()).not.toEqual('')
  })
})
