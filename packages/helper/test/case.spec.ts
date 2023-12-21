import { camelCase, pascalCase } from '../src/case'

describe('case', () => {
  it('should convert to camelCase', () => {
    expect(camelCase('hello world')).toBe('helloWorld')
    expect(camelCase('HELLO_WORLD')).toBe('HELLOWORLD')
  })

  it('should convert to PascalCase', () => {
    expect(pascalCase('hello world')).toBe('HelloWorld')
    expect(pascalCase('HELLO_WORLD')).toBe('HELLOWORLD')
  })
})
