import { OpenAPIRunner } from '@opas/core'
import path from 'node:path'
import OpenAPITransformDocPlugin from '../src'

describe('doc', () => {
  it('should generate doc', async () => {
    await OpenAPIRunner.run([
      {
        url: path.resolve(__dirname, '../../../openapi.json'),
        namespace: 'pets-store',
        plugins: [
          new OpenAPITransformDocPlugin({
            output: path.resolve(__dirname, './fixtures'),
          }),
        ],
      },
    ])
  })
})
