import { ParameterV2, SchemaJsonV2 } from '@opas/helper';
import { APIField, Field } from './types';

export function formatQuoteString(str: string | string[]) {
  return `\`${str}\``;
}

export function formatSchemaType(schema: any) {
  const refs: string[] = [];
  let type = '-';
  if (schema.type === 'array') {
    type = schema.type;
    if (schema.items) {
      if (Array.isArray(schema.items)) {
        type = schema.items
          .map((item: any) => {
            if (item.$ref) {
              return `${schema.type}<${item.$ref.split('/').pop()}>`;
            } else if (item.type) {
              return `${schema.type}<${item.type}>`;
            }
            return '-';
          })
          .join('|');
      } else {
        if (schema.items.$ref) {
          type = `${schema.type}<${schema.items.$ref.split('/').pop()}>`;
          refs.push(schema.items.$ref);
        } else if (schema.items.type) {
          type = `${schema.type}<${schema.items.type}>`;
        }
      }
    }
  } else {
    type = Array.isArray(schema.type) ? schema.type.join('|') : (schema.type ?? '-');
  }

  return { type, refs };
}

export function formatParameterType(parameter: ParameterV2) {
  if ('type' in parameter) {
    return [parameter.type ?? '-'];
  } else if ('schema' in parameter) {
    const schemaType = parameter.schema.type;
    if (schemaType === 'array') {
      const { type, refs } = formatSchemaType(parameter.schema);
      return [type, refs];
    }
  }
  return ['-'];
}

export function resolveDefinition(ref: string, definitions: Required<SchemaJsonV2>['definitions']) {
  const def = ref.split('/').pop() as string;
  const definition = definitions[def];
  const properties = definition?.properties;
  const required = definition?.required || [];
  const refs: string[] = [];
  const fields: Field[] = [];
  if (properties) {
    Object.entries(properties).forEach(([key, value]) => {
      if (value.$ref) {
        const subDefName = value.$ref.split('/').pop() as any;
        const subDef = definitions[subDefName];
        if (subDef.properties) {
          refs.push(value.$ref);
        }
        fields.push({
          name: key,
          type: subDef.properties ? subDefName : subDef.type,
          default: '-',
        });
      } else {
        if (value.type === 'array') {
          const { type, refs: subDefs } = formatSchemaType(value);

          refs.push(...subDefs);

          fields.push({
            name: key,
            ...value,
            type: type as any,
          });
        } else {
          fields.push({
            name: key,
            ...value,
          });
        }
      }
    });
  }
  return { fields, refs, name: def, required };
}

export function parseDefinitions(ref: string, content: SchemaJsonV2) {
  const {
    fields,
    refs,
    required = [],
  } = resolveDefinition(ref, (content as any).definitions || (content as any).components?.schemas || {});

  const apiFields: APIField[] = fields.map((field) => ({
    name: field.name as string,
    type: field.type,
    required: field.required?.includes(field.name as string) ?? required.includes(field.name as string),
    description: field.description,
    default: field.default,
  }));

  const definitions: Record<string, APIField[]> = {};

  if (refs) {
    const dedupedRefs = Array.from(new Set(refs.filter((str) => ref !== str)));
    dedupedRefs.forEach((ref) => {
      const name = ref.split('/').pop() as string;
      const { fields: parsedFields, definitions: parsedDefinitions } = parseDefinitions(ref, content);
      definitions[name] = parsedFields;
      Object.entries(parsedDefinitions).forEach(([key, value]) => {
        definitions[key] = value;
      });
    });
  }

  return {
    fields: apiFields,
    definitions,
  };
}

export function parseParameters(parameters: ParameterV2[], content: SchemaJsonV2) {
  const refs: string[] = [];
  const fields: APIField[] = [];
  parameters.forEach((parameter) => {
    const [type, resolvedRefs] = formatParameterType(parameter);

    if (resolvedRefs) {
      refs.push(...resolvedRefs);
    }
    fields.push({
      name: parameter.name,
      type,
      required: parameter.required,
      description: parameter.description,
      default: 'default' in parameter ? parameter.default : undefined,
    });
  });
  const definitions: Record<string, APIField[]> = {};
  if (refs.length) {
    const dedupedRefs = Array.from(new Set(refs));
    dedupedRefs.forEach((ref) => {
      const name = ref.split('/').pop() as string;
      const { fields: parsedFields, definitions: parsedDefinitions } = parseDefinitions(ref, content);

      definitions[name] = parsedFields;
      Object.entries(parsedDefinitions).forEach(([key, value]) => {
        definitions[key] = value;
      });
    });
  }
  return {
    fields,
    definitions,
  };
}
