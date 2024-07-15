import json2md from 'json2md';
import { DocumentRender, LocaleData } from '../types';
import { formatQuoteString } from '../utils';

json2md.converters.raw = function (input) {
  return input;
};

const markdownRender: DocumentRender = (nodes, symbols) => {
  const markdowns = nodes.map((node) => {
    const { uri, summary, description, method, parameters, response } = node;
    const markdown: json2md.DataObject[] = [];
    if (summary) {
      markdown.push({ h2: summary });
    }
    if (description) {
      markdown.push({ blockquote: description });
    }

    markdown.push({ h3: symbols.method });
    markdown.push({ raw: formatQuoteString(method) });
    markdown.push({ h3: symbols.uri });
    markdown.push({ raw: formatQuoteString(uri) });

    if (parameters) {
      // markdown.push({ h3: symbols.parameters });
      parameters.forEach((parameter) => {
        const { type, fields, definitions } = parameter;
        markdown.push({ h3: symbols[(type + 'Parameters') as keyof LocaleData] });

        if (fields) {
          markdown.push({
            table: {
              headers: [symbols.name, symbols.type, symbols.required, symbols.default, symbols.description],
              rows: fields.map(
                (field) =>
                  [
                    formatQuoteString(field.name ?? '-'),
                    formatQuoteString(field.type ?? ('-' as string)),
                    formatQuoteString(field.required ? field.required.toString() : '-'),
                    formatQuoteString(field.default ? field.default.toString() : '-'),
                    field.description ?? '-',
                  ] as string[],
              ),
            },
          });
        }

        if (definitions) {
          Object.entries(definitions).forEach(([key, value]) => {
            markdown.push({ h4: key });
            markdown.push({
              table: {
                headers: [symbols.name, symbols.type, symbols.required, symbols.default, symbols.description],
                rows: value.map(
                  (field) =>
                    [
                      formatQuoteString(field.name ?? '-'),
                      formatQuoteString(field.type ?? ('-' as string)),
                      formatQuoteString(field.required ? field.required.toString() : '-'),
                      formatQuoteString(field.default ? field.default.toString() : '-'),
                      field.description ?? '-',
                    ] as string[],
                ),
              },
            });
          });
        }
      });
    }

    if (response) {
      markdown.push({ h3: symbols.responses });
      const { fields, definitions } = response;
      if (fields) {
        markdown.push({
          table: {
            headers: [symbols.name, symbols.type, symbols.required, symbols.default, symbols.description],
            rows: fields.map(
              (field) =>
                [
                  formatQuoteString(field.name ?? '-'),
                  formatQuoteString(field.type ?? ('-' as string)),
                  formatQuoteString(field.required ? field.required.toString() : '-'),
                  formatQuoteString(field.default ? field.default.toString() : '-'),
                  field.description ?? '-',
                ] as string[],
            ),
          },
        });
      }

      if (definitions) {
        Object.entries(definitions).forEach(([key, value]) => {
          markdown.push({ h4: key });
          markdown.push({
            table: {
              headers: [symbols.name, symbols.type, symbols.required, symbols.default, symbols.description],
              rows: value.map(
                (field) =>
                  [
                    formatQuoteString(field.name ?? '-'),
                    formatQuoteString(field.type ?? ('-' as string)),
                    formatQuoteString(field.required ? field.required.toString() : '-'),
                    formatQuoteString(field.default ? field.default.toString() : '-'),
                    field.description ?? '-',
                  ] as string[],
              ),
            },
          });
        });
      }
    }

    return markdown;
  });

  return {
    content: json2md(markdowns.filter(Boolean).flat()),
    ext: 'md',
  };
};

export default markdownRender;
