import generate from '@babel/generator';
import template from '@babel/template';
import * as t from '@babel/types';
import camelcase from 'camelcase';
import { Schema } from 'dtsgenerator';
import { pascalCase } from './case';
import { SUPPORT_PARAMETERS_TYPES } from './constants';
import { formatIdentifierName, formatTypeName } from './identifier';
import { formatService } from './service';
import { getTemplateParams } from './template';
import {
  API,
  ApiCreateOptions,
  CreateResponseOptions,
  Parameters,
  ParametersType,
  ParsedOperation,
  ResponseValue,
} from './types';

function isSupportParametersType(type: string) {
  return SUPPORT_PARAMETERS_TYPES.includes(type);
}

function formatAPIFunctionName(method: string, url: string, parameters: Parameters[]) {
  const pathParameters = parameters.filter((parameter) => parameter.in === 'path').map((parameter) => parameter.name);
  const suffix = pathParameters.length ? 'By' + pathParameters.map((name) => pascalCase(name)).join('And') : '';
  const apiName = url
    .split('/')
    .filter((name) => !pathParameters.map((parameter) => `{${parameter}}`).includes(name))
    .map((str) => pascalCase(formatIdentifierName(str)))
    .join('');

  return camelcase(method.toLowerCase() + apiName + suffix);
}

function formatParameters(parameters: any[] = []): API['parameters'] {
  return parameters.map((it) => ({
    ...it,
    type: it.in,
  }));
}

function getResponseRef(response?: ResponseValue) {
  if (!response) {
    return '';
  }
  if ('content' in response) {
    // open api v3
    const responseContent = response.content;
    const jsonResponse = responseContent?.['application/json'] ?? responseContent?.['*/*'];
    if (jsonResponse) {
      const responseSchema = jsonResponse.schema;
      if (responseSchema?.$ref) {
        return responseSchema.$ref;
      }
    }
  } else if ('schema' in response) {
    // open api v2
    if (response.schema && response.schema.type !== 'file' && response.schema.$ref) {
      return response.schema.$ref;
    }
  }
  return '';
}

function formatResponse(response?: ResponseValue) {
  if (!response) {
    return undefined;
  }
  const ref: string = getResponseRef(response);
  let rawType: any = '';
  let items: any;
  if ('content' in response) {
    // open api v3
    const responseContent = response.content;
    const jsonResponse = responseContent?.['application/json'] ?? responseContent?.['*/*'];
    if (jsonResponse) {
      const responseSchema = jsonResponse.schema;
      if (responseSchema && 'type' in responseSchema) {
        rawType = responseSchema.type;
        if (rawType === 'array') {
          items = responseSchema.items;
        }
      }
    }
  } else if ('schema' in response) {
    // open api v2
    if (response.schema) {
      if (response.schema.type === 'file') {
        return 'Blob';
      } else if (response.schema.type) {
        rawType = response.schema.type;
        if (rawType === 'array') {
          items = response.schema.items;
        }
      }
    }
  }

  if (ref) {
    const type = ref.split('/').pop() || '';
    return formatTypeName(type);
  } else if (rawType) {
    if (rawType === 'array') {
      if (items?.$ref) {
        const type = items.$ref.split('/').pop() || '';
        return formatTypeName(type) + '[]';
      } else if (items?.type) {
        if (items?.type && /^[a-z]/.test(items?.type)) {
          if (items?.type === 'object') {
            return 'Record<string, any>[]';
          }
          // other basic value type
          return items.type + '[]';
        }
        return formatTypeName(items.type) + '[]';
      }
    }
    return rawType;
  } else {
    return undefined;
  }
}

function formatOperationId(operationId = '') {
  return formatTypeName(operationId);
}

function replaceParams(url: string, locator: string) {
  return url.replace(/\{(\w+)\}/g, `\${${locator}.$1}`);
}

function createResponse(options: CreateResponseOptions) {
  const { response, service, isV3 = false, extractField, raw, schema } = options;
  const serviceNamespace = pascalCase(service);
  if (response) {
    if (response && /^[a-z]/.test(response)) {
      if (response === 'object') {
        return t.identifier('Record<string, any>');
      }
      // other basic value type
      return t.identifier(response);
    } else if (response.startsWith('Record<string, any>')) {
      return t.identifier(response);
    } else if (response.endsWith('Void')) {
      return t.identifier('void');
    } else if (extractField) {
      // need extract field
      if (schema && raw) {
        const ref = getResponseRef(raw);
        // if extract field not exist in response, remove it
        if (ref) {
          const fields = recursiveRemoveFieldFromSchema(
            Array.isArray(extractField) ? extractField : [extractField],
            ref,
            schema,
            0,
          );
          const identifier = fields.reduce(
            (prev, cur) => {
              return `Required<${prev}>['${cur}']`;
            },
            `${serviceNamespace}${isV3 ? '.Schemas' : ''}.${response}`,
          );
          return t.identifier(identifier);
        }
      }
    }
    return t.identifier(`${serviceNamespace}${isV3 ? '.Schemas' : ''}.${response}`);
  } else {
    return t.identifier('void');
  }
}

function addComments(node: any, comment: string[]) {
  const value = comment.map((str) => `*\n* ${str}`).join('\n') + '\n';
  return t.addComments(node, 'leading', [
    {
      type: 'CommentBlock',
      value,
    },
  ]);
}

function pickParams(parameters: API['parameters']) {
  return function (type: ParametersType['type']) {
    return parameters.filter((it) => it.type === type);
  };
}

function createParams(
  parameters: API['parameters'],
  service: string,
  operationId: string,
  configTypeName = 'AxiosRequestConfig',
) {
  const serviceNamespace = pascalCase(service);
  const types = [...new Set(parameters.map((it) => it.type))].sort((a, b) => {
    return SUPPORT_PARAMETERS_TYPES.indexOf(a) - SUPPORT_PARAMETERS_TYPES.indexOf(b);
  });

  const bodyParameters = parameters.filter((it) => it.type === 'body');
  const configParamNode = t.identifier('config');
  configParamNode.typeAnnotation = t.tsTypeAnnotation(t.tsTypeReference(t.identifier(configTypeName)));
  configParamNode.optional = true;
  return types
    .filter(isSupportParametersType)
    .map((type) => {
      if (type === 'body') {
        return paramsTypeAst('bodyParameters')(
          serviceNamespace,
          operationId,
          bodyParameters.length === 1 ? bodyParameters[0].name : '',
        );
      } else if (type === 'formData') {
        return paramsTypeAst('formDataParameters')(serviceNamespace, operationId);
      } else if (type === 'path') {
        return paramsTypeAst('pathParameters')(serviceNamespace, operationId);
      } else {
        return paramsTypeAst('queryParameters')(serviceNamespace, operationId);
      }
    })
    .concat(configParamNode);
}
function createCalleeArgs(url: string, method: string, parameters: API['parameters']) {
  const pick = pickParams(parameters);
  const queryParams = pick('query');
  const pathParams = pick('path');
  const bodyParams = pick('body');
  const formDataParams = pick('formData');

  if (pathParams.length !== 0) {
    url = replaceParams(url, 'pathParameters');
  }
  let configStr = `
  {
    url: ${url.includes('${') ? '`' + url + '`' : `'${url}'`},
    method: '${method}',
  `;
  if (bodyParams.length) {
    configStr += 'data: bodyParameters, \n';
  } else if (formDataParams.length) {
    configStr += 'data: formDataParameters, \n';
  }
  if (queryParams.length) {
    configStr += 'params: queryParameters, \n';
  }
  configStr += `...config,
  }`;
  return configStr;
}

function paramsTypeAst(name: string) {
  const node = t.identifier(name);
  const type = (node.typeAnnotation = t.typeAnnotation(t.anyTypeAnnotation()));
  if (name === 'bodyParameters') {
    return function (serviceNamespace: string, operationId: string, parameterName?: string) {
      let parameterType = `${serviceNamespace}.${formatTypeName(operationId)}.${formatTypeName(name)}`;
      if (parameterName) {
        parameterType += `['${parameterName}']`;
      }
      type.typeAnnotation = t.tsTypeReference(t.identifier(parameterType)) as any;
      return node;
    };
  } else if (name === 'formDataParameters') {
    return function () {
      type.typeAnnotation = t.tsTypeReference(t.identifier('FormData')) as any;
      return node;
    };
  } else {
    return function (serviceNamespace: string, operationId: string) {
      type.typeAnnotation = t.tsTypeReference(
        t.identifier(`${serviceNamespace}.${formatTypeName(operationId)}.${formatTypeName(name)}`),
      ) as any;
      return node;
    };
  }
}

function createItem(api: ParsedOperation, options: ApiCreateOptions = {}): API {
  const {
    method,
    uri,
    description = '',
    summary = description,
    parameters = [],
    operationId = '',
    successResponse,
  } = api;
  const { urlFormatter = (url) => url, nameFormatter = formatAPIFunctionName } = options;
  return {
    method: method.toString(),
    url: urlFormatter(uri),
    summary,
    name: nameFormatter(method, uri, parameters as unknown as Parameters[], formatAPIFunctionName),
    parameters: formatParameters(parameters),
    response: formatResponse(successResponse),
    operationId: formatOperationId(operationId),
    rawResponse: successResponse,
  };
}

export function createRenderer(templateSource: string, options?: ApiCreateOptions) {
  const templateAst = template(templateSource, {
    plugins: ['typescript'],
  });
  const templatePlaceholders = getTemplateParams(templateSource);
  return (api: ParsedOperation, service: string) => {
    const {
      name,
      method,
      url,
      summary,
      parameters = [],
      operationId = '',
      response,
      rawResponse,
    } = createItem(api, options);
    const allArgs: Record<string, any> = {
      NAME: name,
      SERVICE: formatService(service),
      RESPONSE: createResponse({
        response,
        operationId,
        service,
        isV3: options?.openApiVersion === 3,
        extractField: options?.extractField,
        schema: options?.schema,
        raw: rawResponse,
      }),
      PARAMS: createParams(parameters, service, operationId, options?.configParamTypeName),
      ARGS: createCalleeArgs(url, method, parameters),
    };
    const neededArgs = templatePlaceholders.reduce<Record<string, unknown>>((acc, cur) => {
      acc[cur] = allArgs[cur];
      return acc;
    }, {});

    const astNode = templateAst(neededArgs);
    const withCommentsNode = addComments(
      astNode,
      [
        summary,
        api.description && api.description !== summary ? `@description ${api.description}` : '',
        api.deprecated ? '@deprecated' : '',
        api.externalDocs?.url ? `@see ${api.externalDocs?.url}` : '',
      ].filter(Boolean),
    );
    const { code } = generate(withCommentsNode);
    return code;
  };
}

export function recursiveRemoveFieldFromSchema(fields: string[], refStr: string, schema: Schema, index = 0) {
  const ref = refStr.split('/');
  const field = fields[index];
  const definitionName = ref.pop() as string;
  if (typeof schema.content === 'object') {
    const definitions = schema.content.definitions ?? (schema.content as any).components?.schemas ?? {};
    const responseSchema = definitions[definitionName];
    if (responseSchema && typeof responseSchema === 'object') {
      const { properties } = responseSchema;
      if (properties) {
        const property = properties[field];
        if (!property) {
          // if field not exist, remove all fields
          return fields.filter((_, i) => i < index);
        } else if (typeof property === 'object' && property.$ref) {
          return recursiveRemoveFieldFromSchema(fields, property.$ref.split('/').pop() as string, schema, index + 1);
        }
      }
    }
  }
  return [...fields];
}
