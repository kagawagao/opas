import { OpenAPIPluginOptions } from '@opas/core';
import { ParsedOperation, SchemaJsonV2 } from '@opas/helper';
import locales from './locales';

export type InternalRenderType = 'md' | 'doc';

export interface LocaleData {
  method: string;
  uri: string;
  parameters: string;
  responses: string;
  name: string;
  type: string;
  required: string;
  description: string;
  headerParameters: string;
  pathParameters: string;
  bodyParameters: string;
  queryParameters: string;
  default: string;
}

export type Field = Required<SchemaJsonV2>['definitions'][''] & {
  type?: any;
  name?: string;
};

export type TagAliasMapper = (tag: string) => string;

export interface Document {
  content: string | Buffer;
  ext: string;
}

export interface DocumentRender {
  (nodes: APINode[], locales: LocaleData): Document | Promise<Document>;
}

export interface OpenAPITransformDocPluginOptions extends OpenAPIPluginOptions {
  /**
   * output dir
   */
  outputDir?: string;
  /**
   * grouped by tag
   */
  grouped?: boolean;
  /**
   * tag alias mapper
   */
  tagAlias?: TagAliasMapper | Record<string, string>;
  /**
   * include apis
   */
  include?: ((api: ParsedOperation) => boolean) | RegExp | string[];
  /**
   * exclude apis
   */
  exclude?: ((api: ParsedOperation) => boolean) | RegExp | string[];
  /**
   * custom locale data, default is zh-cn
   */
  locale?: LocaleData | keyof typeof locales;
  /**
   * specify render type or use custom render
   */
  render?: DocumentRender | InternalRenderType;
}

export interface APIField {
  name: string;
  required?: boolean;
  description?: string;
  type?: string | string[];
  default?: any;
}

export interface APIParameter {
  type: 'body' | 'query' | 'header' | 'path';
  fields?: APIField[];
  definitions?: Record<string, APIField[]>;
}

export interface APIResponse {
  fields: APIField[];
  definitions?: Record<string, APIField[]>;
}

export interface APINode {
  uri: string;
  summary?: string;
  description?: string;
  method: string;
  parameters?: APIParameter[];
  response?: APIResponse;
}
