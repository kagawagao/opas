import camelcase from 'camelcase';

/**
 * @description camelCase
 */
export function camelCase(str: string) {
  return camelcase(str, { preserveConsecutiveUppercase: true });
}

/**
 * @description PascalCase
 */
export function pascalCase(str: string) {
  return camelcase(str, { pascalCase: true, preserveConsecutiveUppercase: true });
}
